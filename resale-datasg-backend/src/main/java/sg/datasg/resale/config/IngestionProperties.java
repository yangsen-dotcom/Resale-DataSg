package sg.datasg.resale.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "resale.ingestion")
public record IngestionProperties(
    String datasetId,
    String apiBaseUrl,
    int pageSize,
    String corsAllowedOrigin,
    @DefaultValue("true") boolean startupIngestionEnabled) {
}
