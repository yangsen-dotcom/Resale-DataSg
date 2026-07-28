package sg.datasg.resale.ingestion.datagovsg;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class DataGovSgClientTest {

    private MockRestServiceServer mockServer;
    private DataGovSgClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl("https://data.gov.sg");
        mockServer = MockRestServiceServer.bindTo(builder).build();
        client = new DataGovSgClient(builder.build());
    }

    @Test
    void fetchesPageAndParsesResponse() {
        String body = """
            {
              "success": true,
              "result": {
                "records": [
                  {"_id": 1, "month": "2017-01", "town": "ANG MO KIO", "flat_type": "2 ROOM",
                   "block": "406", "street_name": "ANG MO KIO AVE 10", "storey_range": "10 TO 12",
                   "floor_area_sqm": "44", "flat_model": "Improved", "lease_commence_date": "1979",
                   "remaining_lease": "61 years 04 months", "resale_price": "232000"}
                ],
                "total": 236386,
                "limit": 10000
              }
            }
            """;

        mockServer.expect(requestTo(
                "https://data.gov.sg/api/action/datastore_search?resource_id=d_test&limit=10000&offset=0"))
            .andExpect(method(HttpMethod.GET))
            .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        DatastoreSearchResponse response = client.fetchPage("d_test", 10000, 0);

        assertThat(response.success()).isTrue();
        assertThat(response.result().total()).isEqualTo(236386);
        assertThat(response.result().records()).hasSize(1);
        assertThat(response.result().records().get(0).town()).isEqualTo("ANG MO KIO");
        mockServer.verify();
    }
}
