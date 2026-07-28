package sg.datasg.resale.ingestion.datagovsg;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DatastoreSearchResult(List<RawResaleTransactionRecord> records, long total, int limit) {
}
