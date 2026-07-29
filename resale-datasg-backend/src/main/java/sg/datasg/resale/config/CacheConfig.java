package sg.datasg.resale.config;

import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
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
public class CacheConfig implements CachingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);
    private static final Duration CACHE_TTL = Duration.ofHours(6);

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        RedisCacheConfiguration cacheConfiguration = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(CACHE_TTL)
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
        return builder -> builder.cacheDefaults(cacheConfiguration);
    }

    /**
     * A Redis entry Jackson can't deserialize — left over from before this
     * serializer was configured, or after a cached DTO's shape changes in a
     * future deploy — would otherwise turn every request against that key into
     * a 500 (Spring's default error handler rethrows). Logging and treating it
     * as a cache miss instead lets the request fall through to Postgres, and
     * the resulting cache write overwrites the bad entry, so it self-heals.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis cache read failed for cache '{}' key '{}' — falling through to the database: {}",
                    cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Redis cache write failed for cache '{}' key '{}': {}", cache.getName(), key,
                    exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis cache evict failed for cache '{}' key '{}': {}", cache.getName(), key,
                    exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Redis cache clear failed for cache '{}': {}", cache.getName(), exception.getMessage());
            }
        };
    }
}
