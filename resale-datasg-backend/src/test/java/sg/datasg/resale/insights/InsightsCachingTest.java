package sg.datasg.resale.insights;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import sg.datasg.resale.insights.dto.TownPriceTrendPointResponse;
import sg.datasg.resale.transaction.ResaleTransaction;
import sg.datasg.resale.transaction.ResaleTransactionRepository;

/**
 * Proves the observable contract of the {@code @Cacheable} Insights endpoints -
 * a repeated call is served from Redis until evicted - rather than just that the
 * app can start with Redis present (which {@code ResaleDataSgApplicationSmokeTest}
 * already covers).
 */
@Testcontainers
@SpringBootTest(properties = "resale.ingestion.startup-ingestion-enabled=false")
class InsightsCachingTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @Container
    static final GenericContainer<?> REDIS = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
        .withExposedPorts(6379);

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
    }

    @Autowired
    private InsightsService insightsService;

    @Autowired
    private ResaleTransactionRepository transactionRepository;

    @Autowired
    private CacheManager cacheManager;

    @BeforeEach
    void seed() {
        transactionRepository.deleteAllInBatch();
        transactionRepository.save(row("2023-01", "100000"));
        cacheManager.getCacheNames().forEach(name -> {
            Cache cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.clear();
            }
        });
    }

    @Test
    void repeatedCallIsServedFromCacheUntilEvicted() {
        List<TownPriceTrendPointResponse> first = insightsService.priceTrendByTown("year");
        assertThat(first).hasSize(1);
        assertThat(first.get(0).averagePrice()).isEqualByComparingTo(new BigDecimal("100000.00"));

        // Insert another row directly (bypassing the ingestion eviction path) -
        // a cached response should NOT reflect it.
        transactionRepository.save(row("2023-02", "300000"));
        List<TownPriceTrendPointResponse> stillCached = insightsService.priceTrendByTown("year");
        assertThat(stillCached.get(0).averagePrice()).isEqualByComparingTo(new BigDecimal("100000.00"));

        Cache cache = cacheManager.getCache(InsightsCacheNames.PRICE_TREND_BY_TOWN);
        assertThat(cache).isNotNull();
        cache.clear();

        List<TownPriceTrendPointResponse> afterEvict = insightsService.priceTrendByTown("year");
        assertThat(afterEvict.get(0).averagePrice()).isEqualByComparingTo(new BigDecimal("200000.00"));
    }

    @Test
    void evictingAllInsightsCachesClearsAKnownEntry() {
        insightsService.priceTrendByTown("year");
        Cache cache = cacheManager.getCache(InsightsCacheNames.PRICE_TREND_BY_TOWN);
        assertThat(cache).isNotNull();
        assertThat(cache.get("year")).isNotNull();

        // Mirrors IngestionService.evictInsightsCaches() without running a full re-ingest.
        for (String cacheName : InsightsCacheNames.ALL) {
            Cache toEvict = cacheManager.getCache(cacheName);
            if (toEvict != null) {
                toEvict.clear();
            }
        }

        assertThat(cache.get("year")).isNull();
    }

    private ResaleTransaction row(String month, String price) {
        return new ResaleTransaction(YearMonth.parse(month).atDay(1), "BEDOK", "4 ROOM", "123", "SOME ST",
            "01 TO 03", new BigDecimal("90.0"), "Model A", (short) 1990, "65 years", new BigDecimal(price));
    }
}
