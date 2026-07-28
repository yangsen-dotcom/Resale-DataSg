package sg.datasg.resale.ingestion.datagovsg;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DatastoreSearchResponse(boolean success, DatastoreSearchResult result) {
}
