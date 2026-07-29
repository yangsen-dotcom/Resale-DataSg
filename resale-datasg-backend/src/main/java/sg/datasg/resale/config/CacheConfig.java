package sg.datasg.resale.config;

import java.time.Duration;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

/**
 * Cached Insights responses are Java records, which the default JDK-serialization
 * RedisCacheManager can't handle without implementing Serializable everywhere — this
 * swaps the value serializer to JSON instead (also easier to inspect directly in
 * Redis). The TTL here is a safety net, not the primary invalidation path: chart data
 * only changes on a manual re-ingest, which explicitly evicts these caches (see
 * IngestionService / InsightsCacheNames).
 */
@Configuration
public class CacheConfig {

    private static final Duration CACHE_TTL = Duration.ofHours(6);

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        RedisCacheConfiguration cacheConfiguration = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(CACHE_TTL)
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
        return builder -> builder.cacheDefaults(cacheConfiguration);
    }
}
