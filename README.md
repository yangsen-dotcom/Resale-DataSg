# Resale-DataSg

A full-stack web app for exploring and analysing Singapore HDB resale flat
transactions, sourced live from [data.gov.sg](https://data.gov.sg).

## Project structure

```
Resale-DataSg/
├── resale-datasg-backend/            # Spring Boot REST API (Java, Maven)
│   ├── src/main/java/sg/datasg/resale/
│   │   ├── common/                   # Global exception handling (ProblemDetail), shared exceptions
│   │   ├── config/                   # Cache, CORS/web, OpenAPI, ingestion, REST client config
│   │   ├── ingestion/                # data.gov.sg client, startup + on-demand ingestion
│   │   ├── insights/                 # Aggregate/chart endpoints (repository, service, cache names, DTOs)
│   │   └── transaction/              # Transaction listing, filtering, sorting
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/             # Flyway schema + index migrations
│   └── Dockerfile
├── resale-datasg-frontend/           # React + TypeScript SPA (Vite)
│   ├── src/
│   │   ├── api/                      # fetch wrappers + response types
│   │   ├── components/               # Explore/Insights/Map/common presentational components
│   │   ├── data/                     # Static town-centroid coordinates for the map
│   │   ├── hooks/                    # TanStack Query hooks
│   │   ├── pages/                    # ExplorePage, InsightsPage, MapPage
│   │   ├── state/                    # In-memory filter state (not URL-persisted)
│   │   └── styles/                   # Design tokens
│   └── Dockerfile
├── infra/terraform/                  # AWS infrastructure as code (never applied — see its README)
├── docker-compose.yml                # Local Postgres + Redis, plus an optional full-stack container profile
└── .github/workflows/ci.yml          # Build + test both projects, validate Terraform
```

## Architecture

```
 data.gov.sg (datastore_search API)
        │  one-time bulk pull on first startup
        ▼
 ┌─────────────────────┐        ┌──────────────────────┐
 │  Spring Boot REST    │◄──────►│  PostgreSQL           │
 │  API (backend)        │        │  (resale_transaction)│
 └──────────▲───────────┘        └──────────────────────┘
            │ REST/JSON            │
            │                      ▼
            │               ┌──────────────────────┐
            │               │  Redis                │
            │               │  (Insights chart      │
            │               │   response cache)     │
            │               └──────────────────────┘
 ┌────────────┴────────────┐
 │  React SPA (frontend)    │
 │  Explore / Insights / Map │
 └──────────────────────────┘
```

The backend ingests the dataset once (see [How data gets in](#how-data-gets-in)),
stores it in Postgres, and serves it through a REST API. The frontend is a
client-side SPA that queries that API — it never talks to data.gov.sg directly.
The Insights chart endpoints are additionally cached in Redis (see
[Caching](#caching)), since that data only changes on a manual re-ingest.

## Frontend pages

- **Explore** (`/`) — the full transaction listing: multi-select town/flat-type
  filters, a comma-formatted price range, a month range picker, a table sortable
  on all 9 relevant columns (click a header to sort, click again to reverse), a
  page-size selector, and a "go to page" input alongside standard pagination.
- **Insights** (`/insights`) — a left-hand nav across six comparison
  dimensions: **Towns** (Average/Highest/Lowest/Median Price, Transaction Count,
  and Price per SQM, toggled via a pill control, each rendered as one line per
  town with a click-to-show/hide legend), **Flat Types** (Average Price /
  Transaction Count), **Remain Lease** (average price by remaining-lease-year
  bucket), **Storey Range** (average price by storey-range bucket, e.g. "01 TO
  03"), **Town × Flat Type** (a heatmap grid of average price across both
  dimensions at once, sequential-blue color scale, sorted by each town's
  overall average so the priciest towns lead), and **Area** (median floor area
  by month). Every chart shows highest/lowest/average summary stat tiles above
  it, and the line/area charts have a cursor-following tooltip while the
  heatmap has a per-cell hover tooltip.
- **Map** (`/map`) — a Leaflet map with a marker per town (positioned at
  approximate real-world centroids, see `src/data/townCoordinates.ts`); clicking
  a town (or picking one from the dropdown) reveals its blocks, and picking a
  block loads that block's transactions in the same sortable/paginated table
  used on Explore.

## Tech stack & why

| Layer | Choice | Why |
|---|---|---|
| Backend | Spring Boot 3 (Java 21) | Mature REST + JPA + testing ecosystem; easy to containerize for ECS |
| Database | PostgreSQL | `percentile_cont`/`date_trunc` power the insights queries; matches the RDS target in Terraform |
| Schema migrations | Flyway | Versioned, repeatable schema setup |
| Cache | Redis (Spring Cache abstraction) | Insights chart data changes only on re-ingest, not per-request — caching avoids re-running the same aggregate SQL on every page load |
| API docs | springdoc-openapi | Swagger UI generated from the code, always in sync |
| Frontend | React + TypeScript + Vite | Fast dev loop; already scaffolded |
| Server state | TanStack Query | Caching, loading/error states, refetch-on-filter-change, without hand-rolled `useEffect` fetching |
| Routing | react-router-dom | Three pages (Explore, Insights, Map); filter/selection state is kept in memory, not the URL — picking a filter re-fetches and updates in place instead of navigating |
| Backend tests | JUnit 5, Mockito, Testcontainers (Postgres, Redis) | Real Postgres-specific SQL and real cache behaviour are exercised, not simulated against H2 or an in-memory cache |
| Frontend tests | Vitest, React Testing Library, MSW | Component behaviour and API-mocked integration paths |
| IaC | Terraform | Industry-standard, declarative, reviewable without applying |

## Dataset

[**HDB Resale Flat Prices**](https://data.gov.sg/collections/189/view) — specifically
the *"Resale flat prices based on registration date from Jan-2017 onwards"* dataset
(`d_8b84c4ee58e3cfc0ece0d773c8ca6abc`), ~230k+ rows and growing monthly. Columns:
`month`, `town`, `flat_type`, `block`, `street_name`, `storey_range`,
`floor_area_sqm`, `flat_model`, `lease_commence_date`, `remaining_lease`,
`resale_price`.

### How data gets in

The backend calls data.gov.sg's `datastore_search` API in pages of 10,000 rows
(`IngestionService`) and bulk-inserts them into `resale_transaction`. This runs
**automatically on first startup only** — `StartupIngestionRunner` checks if the
table is empty and, if so, pulls the full dataset before the app finishes starting.
Every subsequent restart is instant since the table is already populated. A manual
re-pull is available via `POST /api/admin/ingest` (runs asynchronously, replaces all
rows).

> Note: an earlier version of this ingestion path was designed around data.gov.sg's
> documented `initiate-download`/`poll-download` CSV export endpoints, but both
> returned 404 against the live API — they appear to have been retired. The
> `datastore_search` JSON endpoint (confirmed live, supports `limit=10000` pages)
> is what's actually implemented.

## Running locally

### Option A — dev mode (hot reload, needs local JDK 21 + Node 22)

```bash
docker compose up postgres redis    # wait for both to report healthy

cd resale-datasg-backend
mvn spring-boot:run                 # http://localhost:9090

cd resale-datasg-frontend
npm install
npm run dev                         # http://localhost:5173
```

Postgres is published on host port **5434** (not the default 5432) and Redis on
**6380** (not the default 6379), to avoid clashing with instances you might
already have running locally. `application.yml`'s defaults already point at
`localhost:5434` / `localhost:6380`, so `mvn spring-boot:run` connects out of the
box — override `DB_URL` / `REDIS_HOST` / `REDIS_PORT` if you've changed the port
mappings in `docker-compose.yml`.

First backend startup will take a little while (a few minutes) while it pulls
~230k rows from data.gov.sg — watch the logs for ingestion progress.

### Option B — one command, fully containerized

```bash
docker compose --profile full up --build
```

This builds and runs Postgres, Redis, the backend, and the frontend (served by
nginx, which proxies `/api/*` to the backend) — no local JDK or Node needed. Open
`http://localhost:8081`.

## API documentation

With the backend running, Swagger UI is at **`http://localhost:9090/swagger-ui.html`**
(OpenAPI JSON at `/v3/api-docs`) — always in sync with the code, and the primary
reference. Summary:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/transactions` | Paginated, filterable transaction listing (town, flat type, price range, month range, sort) |
| GET | `/api/transactions/towns` | Distinct towns, for filter dropdowns |
| GET | `/api/transactions/flat-types` | Distinct flat types, for filter dropdowns |
| GET | `/api/transactions/blocks` | Distinct blocks (+ street name) for a given town |
| GET | `/api/insights/summary` | Total count, average/median/min/max price |
| GET | `/api/insights/price-trend` | Average price over time, grouped by month or year |
| GET | `/api/insights/price-trend-by-town` | Average price per year (or month), grouped by town — powers the Insights page's town comparison chart |
| GET | `/api/insights/price-trend-by-flat-type` | Average price per year (or month), grouped by flat type — powers the Insights page's flat type comparison chart |
| GET | `/api/insights/max-price-trend-by-town` | Highest resale price per year (or month), grouped by town — powers the Insights page's "Highest Price" view under Towns |
| GET | `/api/insights/min-price-trend-by-town` | Lowest resale price per year (or month), grouped by town — powers the Insights page's "Lowest Price" view under Towns |
| GET | `/api/insights/median-price-trend-by-town` | Median resale price per year (or month), grouped by town — powers the Insights page's "Median Price" view under Towns |
| GET | `/api/insights/price-per-sqm-trend-by-town` | Average price per square metre per year (or month), grouped by town — powers the Insights page's "Price per SQM" view under Towns |
| GET | `/api/insights/area-trend` | Median floor area (sqm) per year (or month), overall — powers the Insights page's "Area" chart |
| GET | `/api/insights/average-price-by-remaining-lease` | Average price grouped by remaining lease (whole years) — powers the Insights page's remaining lease chart |
| GET | `/api/insights/average-price-by-storey-range` | Average price grouped by storey range — powers the Insights page's storey range chart |
| GET | `/api/insights/average-price-by-town-and-flat-type` | Average price grouped by town and flat type — powers the Insights page's Town × Flat Type heatmap |
| GET | `/api/insights/by-town` | Average price and count, grouped by town |
| GET | `/api/insights/by-flat-type` | Average price and count, grouped by flat type |
| POST | `/api/admin/ingest` | Manually trigger a full re-ingest from data.gov.sg |

## How insights are computed

All aggregation happens in SQL, not application code — `AVG`, `MIN`, `MAX`, and
Postgres's `percentile_cont` for the median, with optional filters pushed down as
`WHERE` predicates and grouping done via `GROUP BY` / `date_trunc`. At ~230k+ rows
this is both faster and more correct than pulling rows into the JVM to aggregate.
`V2__add_missing_indexes.sql` adds a `(flat_type, month)` composite (mirroring
the existing `(town, month)` one), an expression index on the parsed
remaining-lease years, and a `block` index — each targets a specific
`WHERE`/`GROUP BY` shape one of these queries actually uses. Caching (below) and
indexing are complementary here, not redundant: indexing keeps a cache *miss*
cheap, caching means most requests skip the query entirely.

## Caching

Every `/api/insights/*` endpoint is wrapped in `@Cacheable` (`InsightsService`),
backed by Redis via Spring's cache abstraction. This data only changes when
someone explicitly re-ingests — normal usage is read-only — so caching the
aggregate query results is safe and avoids re-running the same `GROUP BY` /
`percentile_cont` SQL on every page load or chart-metric toggle.

- **Invalidation**: `POST /api/admin/ingest` explicitly clears every Insights
  cache (and the existing `towns`/`flatTypes`/`blocks` filter-option caches) once
  the reload finishes — see `IngestionService.evictInsightsCaches()` and the
  single source of truth for cache names, `InsightsCacheNames`. A 6-hour TTL
  (`CacheConfig`) is a safety net in case an eviction is ever missed, not the
  primary invalidation path.
- **Serialization**: cached values are Java records, which the default
  JDK-serialization `RedisCacheManager` can't handle — `CacheConfig` swaps in
  `GenericJackson2JsonRedisSerializer` so responses are stored as JSON (also
  easier to inspect directly in Redis, e.g. `redis-cli --scan --pattern
  'insights-*'`). One real gotcha this surfaced: `Stream.toList()`'s concrete
  return type doesn't get a type marker on write but a cache *read* still
  expects to find one, so every cached list silently failed to round-trip.
  Every `@Cacheable` method collects into a plain `ArrayList` instead (which
  does round-trip correctly) — see the note on `InsightsService`, and
  `CacheConfigSerializationTest` for a regression test that doesn't need
  Docker to run.
- **Resilience**: a Redis entry `CacheConfig`'s serializer can't read back
  (e.g. left over from before this config existed) is logged and treated as a
  cache miss (`CachingConfigurer.errorHandler()`) rather than failing the
  request — the fallthrough recompute overwrites the bad entry, so it
  self-heals.
- **What's *not* cached**: `/api/transactions` — its arbitrary combination of
  filters, sort field, and page number means near-every request is a distinct
  cache key, unlike the Insights endpoints which only vary by a `groupBy` (or
  no) parameter. The filter-option endpoints (`towns`/`flatTypes`/`blocks`) were
  already cached before this change, using the same eviction-on-reingest
  pattern.

## Error handling

**Backend**: `ApiExceptionHandler` (`@RestControllerAdvice`) returns
[RFC 7807](https://www.rfc-editor.org/rfc/rfc7807) `ProblemDetail` bodies for
every error, not a generic stack trace — specific handlers map
`ResourceNotFoundException` → 404, an in-flight re-ingest → 409,
`IllegalArgumentException` (invalid `groupBy`, etc.) and bean validation
failures → 400, and a catch-all `Exception` handler logs and returns a clean
500 for anything unanticipated (e.g. the Redis deserialization bug above,
before it was fixed at the source) instead of leaking the servlet container's
default HTML error page.

**Frontend**: every page handles its own loading/error/empty states inline
(`LoadingState`/`ErrorState`/`EmptyState`, with retry buttons wired to
TanStack Query's `refetch`), and a top-level `ErrorBoundary` around the routed
page content catches unexpected rendering errors so one broken component
shows a "Reload" fallback instead of white-screening the whole app.

## Testing

**Backend** (`resale-datasg-backend`):
```bash
mvn verify
```
Unit tests (CSV/record mapping, the data.gov.sg client, `CacheConfigSerializationTest`'s
serializer round-trip check) need nothing extra. Controller slice tests
(`@WebMvcTest`) need nothing extra. Repository tests use a Testcontainers
Postgres; the end-to-end smoke test and `InsightsCachingTest` (proves a
repeated call is actually served from cache and that eviction works, not just
that the app starts with Redis present) additionally spin up a Testcontainers
Redis — these need Docker running.

**Frontend** (`resale-datasg-frontend`):
```bash
npm run lint
npm run test -- --run
npm run build
```

Both run in CI on every push (`.github/workflows/ci.yml`), along with
`terraform fmt`/`validate` on the IaC.

## AWS architecture (not deployed)

`infra/terraform/` defines the target AWS architecture — CloudFront + S3 for the
frontend, ECS Fargate + ALB for the backend, RDS Postgres, ElastiCache Redis,
Secrets Manager for credentials — but is **intentionally never applied**
(deployment isn't required for this assessment, and `apply` would incur real
cost). See [`infra/terraform/README.md`](infra/terraform/README.md) for the
full design, variables, and what's deliberately out of scope.

## Assumptions & trade-offs

- **Single dataset, single table.** Only the "Jan-2017 onwards" resale dataset is
  ingested — the older 1990–2016 datasets (separate resources on data.gov.sg)
  aren't merged in. Scoped this way to keep ingestion, schema, and insights
  logic simple; see Future improvements.
- **Ingestion is a one-time full pull**, not incremental/scheduled. New monthly
  data.gov.sg releases require a manual `POST /api/admin/ingest` (which replaces
  the whole table) rather than being picked up automatically.
- **No auth.** The data is public and read-only from the user's perspective; the
  one write-ish endpoint (`/api/admin/ingest`) has no auth in front of it, which
  would need addressing before this went anywhere near the public internet.
- **Some early Insights endpoints are no longer called by the frontend.**
  `/api/insights/summary`, `/api/insights/price-trend`, and
  `/api/insights/by-flat-type` predate the current Insights page design (a
  left-nav across Towns/Flat Types/Remain Lease/Storey Range/Town × Flat Type/Area, each rendered as its own
  chart) and accept a single `town`/`flatType` filter rather than the
  multi-select lists the transaction listing supports. Kept rather than
  deleted — they're still correct, tested, general-purpose aggregate
  endpoints, just not wired into the current UI.
- **Local dev Postgres credentials are intentionally simple** (`resale_datasg` /
  `resale_datasg`) — fine for a local `docker-compose`, not meant to represent a
  real secret; Terraform generates a real random password for RDS instead.
- **Redis has no auth / encryption**, locally or in the Terraform target
  architecture — it only ever holds derived, non-sensitive chart aggregates
  (never credentials or PII), so the RDS-grade hardening wasn't warranted.
- **AWS resources are demo-sized** (single Fargate task, `db.t4g.micro`,
  single-AZ) — see the Terraform README's "deliberately out of scope" section.

## Future improvements

- Scheduled re-ingestion (cron/EventBridge) to pick up new monthly data.gov.sg
  releases automatically, and merge in the pre-2017 historical datasets.
- Auth on the admin re-ingest endpoint.
- Real geocoded block-level pins on the Map page (currently town-level only,
  using static approximate centroids in `townCoordinates.ts`) — per-block
  geocoding via OneMap was prototyped and works unauthenticated, but was
  reverted since reliable use requires an account.
- Server-side CSV export of the current filtered result set.
- Autoscaling, Multi-AZ RDS, and a custom domain if this were actually deployed.
- Cursor-based pagination if the dataset grows large enough for offset pagination
  to become a real cost.
