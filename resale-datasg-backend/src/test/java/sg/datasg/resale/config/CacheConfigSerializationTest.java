package sg.datasg.resale.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.SerializationException;

/**
 * Locks in a real bug fix: {@link GenericJackson2JsonRedisSerializer} (as
 * configured in {@link CacheConfig}) embeds a type marker on write only for
 * types it considers ambiguous. {@code Stream.toList()}'s concrete class
 * doesn't get one, but a read (which always targets {@code Object.class})
 * still expects to find one - so every cache read for a cached
 * {@code Stream.toList()} result throws, even though the write succeeded.
 * Plain {@code ArrayList} round-trips correctly. No Redis/Testcontainers
 * needed here - this is pure (de)serialization, nothing network-involved; see
 * {@code InsightsCachingTest} for the higher-level, Redis-backed version of
 * this same guarantee.
 */
class CacheConfigSerializationTest {

    record SamplePoint(String town, BigDecimal price) {
    }

    @Test
    void streamToListDoesNotRoundTripThroughTheConfiguredSerializer() {
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer();
        List<SamplePoint> value = Stream.of(new SamplePoint("BEDOK", new BigDecimal("100000.00"))).toList();

        byte[] bytes = serializer.serialize(value);

        assertThatThrownBy(() -> serializer.deserialize(bytes)).isInstanceOf(SerializationException.class);
    }

    @Test
    void arrayListRoundTripsThroughTheConfiguredSerializer() {
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer();
        List<SamplePoint> value = Stream.of(new SamplePoint("BEDOK", new BigDecimal("100000.00")))
            .collect(Collectors.toCollection(ArrayList::new));

        byte[] bytes = serializer.serialize(value);
        Object result = serializer.deserialize(bytes);

        assertThat(result).isEqualTo(value);
    }
}
