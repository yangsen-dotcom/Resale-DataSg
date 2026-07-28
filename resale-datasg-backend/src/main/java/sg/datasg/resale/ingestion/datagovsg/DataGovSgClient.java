package sg.datasg.resale.ingestion.datagovsg;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Thin wrapper around the data.gov.sg {@code datastore_search} API used to bulk-load a
 * dataset page by page. See https://guide.data.gov.sg for API details.
 */
@Component
public class DataGovSgClient {

    private final RestClient restClient;

    public DataGovSgClient(RestClient dataGovSgRestClient) {
        this.restClient = dataGovSgRestClient;
    }

    public DatastoreSearchResponse fetchPage(String resourceId, int limit, long offset) {
        return restClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/api/action/datastore_search")
                .queryParam("resource_id", resourceId)
                .queryParam("limit", limit)
                .queryParam("offset", offset)
                .build())
            .retrieve()
            .body(DatastoreSearchResponse.class);
    }
}
