package sg.datasg.resale.config;

import java.time.Duration;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import org.springframework.boot.web.client.ClientHttpRequestFactories;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient dataGovSgRestClient(IngestionProperties ingestionProperties) {
        ClientHttpRequestFactory requestFactory = ClientHttpRequestFactories.get(
            ClientHttpRequestFactorySettings.DEFAULTS
                .withConnectTimeout(Duration.ofSeconds(10))
                .withReadTimeout(Duration.ofMinutes(2)));

        return RestClient.builder()
            .baseUrl(ingestionProperties.apiBaseUrl())
            .requestFactory(requestFactory)
            .build();
    }
}
