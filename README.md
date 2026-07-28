# Resale-DataSg

A full-stack web app for exploring and analysing Singapore HDB resale flat
transactions, sourced live from [data.gov.sg](https://data.gov.sg).

## Project structure

```
Resale-DataSg/
├── resale-datasg-backend/   # Spring Boot REST API (Java, Maven)
├── resale-datasg-frontend/  # React + TypeScript SPA (Vite)
├── infra/terraform/         # AWS infrastructure as code (never applied — see its README)
├── docker-compose.yml       # Local Postgres, plus an optional full-stack container profile
└── .github/workflows/ci.yml # Build + test both projects, validate Terraform
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
            │ REST/JSON
 ┌──────────┴───────────┐
 │  React SPA (frontend) │
 │  Explore / Insights   │
 └───────────────────────┘
```

The backend ingests the dataset once (see [How data gets in](#how-data-gets-in)),
stores it in Postgres, and serves it through a REST API. The frontend is a
client-side SPA that queries that API — it never talks to data.gov.sg directly.

## Tech stack & why

| Layer | Choice | Why |
|---|---|---|
| Backend | Spring Boot 3 (Java 21) | Mature REST + JPA + testing ecosystem; easy to containerize for ECS |
| Database | PostgreSQL | `percentile_cont`/`date_trunc` power the insights queries; matches the RDS target in Terraform |
| Schema migrations | Flyway | Versioned, repeatable schema setup |
| API docs | springdoc-openapi | Swagger UI generated from the code, always in sync |
| Frontend | React + TypeScript + Vite | Fast dev loop; already scaffolded |
| Server state | TanStack Query | Caching, loading/error states, refetch-on-filter-change, without hand-rolled `useEffect` fetching |
| Routing | react-router-dom | Two views (Explore, Insights) with shared, URL-persisted filter state |
| Backend tests | JUnit 5, Mockito, Testcontainers (Postgres) | Real Postgres-specific SQL is exercised, not simulated against H2 |
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
docker compose up postgres          # wait for it to report healthy

cd resale-datasg-backend
mvn spring-boot:run                 # http://localhost:9090

cd resale-datasg-frontend
npm install
npm run dev                         # http://localhost:5173
```

Postgres is published on host port **5434** (not the default 5432), to avoid
clashing with a Postgres instance you might already have running locally.
`application.yml`'s default `DB_URL` already points at `localhost:5434`, so
`mvn spring-boot:run` connects out of the box — override `DB_URL` if you've
changed the port mapping in `docker-compose.yml`.

First backend startup will take a little while (a few minutes) while it pulls
~230k rows from data.gov.sg — watch the logs for ingestion progress.

### Option B — one command, fully containerized

```bash
docker compose --profile full up --build
```

This builds and runs Postgres, the backend, and the frontend (served by nginx,
which proxies `/api/*` to the backend) — no local JDK or Node needed. Open
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
| GET | `/api/insights/summary` | Total count, average/median/min/max price |
| GET | `/api/insights/price-trend` | Average price over time, grouped by month or year |
| GET | `/api/insights/by-town` | Average price and count, grouped by town |
| GET | `/api/insights/by-flat-type` | Average price and count, grouped by flat type |
| POST | `/api/admin/ingest` | Manually trigger a full re-ingest from data.gov.sg |

## How insights are computed

All aggregation happens in SQL, not application code — `AVG`, `MIN`, `MAX`, and
Postgres's `percentile_cont` for the median, with optional filters pushed down as
`WHERE` predicates and grouping done via `GROUP BY` / `date_trunc`. At ~230k+ rows
this is both faster and more correct than pulling rows into the JVM to aggregate.

## Testing

**Backend** (`resale-datasg-backend`):
```bash
mvn verify
```
Unit tests (CSV/record mapping, the data.gov.sg client) need nothing extra.
Controller slice tests (`@WebMvcTest`) need nothing extra. Repository and
end-to-end tests use Testcontainers and need Docker running.

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
frontend, ECS Fargate + ALB for the backend, RDS Postgres, Secrets Manager for
credentials — but is **intentionally never applied** (deployment isn't required
for this assessment, and `apply` would incur real cost). See
[`infra/terraform/README.md`](infra/terraform/README.md) for the full design,
variables, and what's deliberately out of scope.

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
- **Insights endpoints accept a single `town`/`flatType` filter**, not the same
  multi-select lists the transaction listing supports — the frontend's Insights
  page reuses the same filter panel for a consistent UI but only sends the first
  selected value of each to those endpoints.
- **Local dev Postgres credentials are intentionally simple** (`resale_datasg` /
  `resale_datasg`) — fine for a local `docker-compose`, not meant to represent a
  real secret; Terraform generates a real random password for RDS instead.
- **AWS resources are demo-sized** (single Fargate task, `db.t4g.micro`,
  single-AZ) — see the Terraform README's "deliberately out of scope" section.

## Future improvements

- Scheduled re-ingestion (cron/EventBridge) to pick up new monthly data.gov.sg
  releases automatically, and merge in the pre-2017 historical datasets.
- Auth on the admin re-ingest endpoint.
- Map-based visualisation of town-level prices.
- Server-side CSV export of the current filtered result set.
- Autoscaling, Multi-AZ RDS, and a custom domain if this were actually deployed.
- Cursor-based pagination if the dataset grows large enough for offset pagination
  to become a real cost.
