package sg.datasg.resale.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties(IngestionProperties.class)
public class WebConfig implements WebMvcConfigurer {

    private final IngestionProperties ingestionProperties;

    public WebConfig(IngestionProperties ingestionProperties) {
        this.ingestionProperties = ingestionProperties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(ingestionProperties.corsAllowedOrigin())
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}
