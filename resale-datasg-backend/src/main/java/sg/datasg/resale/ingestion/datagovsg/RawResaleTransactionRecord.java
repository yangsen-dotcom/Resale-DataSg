package sg.datasg.resale.ingestion.datagovsg;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * One row as returned by the data.gov.sg {@code datastore_search} API. All fields are
 * text on the wire (CKAN datastore convention) except {@code _id}, which is ignored.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record RawResaleTransactionRecord(
    String month,
    String town,
    @JsonProperty("flat_type") String flatType,
    String block,
    @JsonProperty("street_name") String streetName,
    @JsonProperty("storey_range") String storeyRange,
    @JsonProperty("floor_area_sqm") String floorAreaSqm,
    @JsonProperty("flat_model") String flatModel,
    @JsonProperty("lease_commence_date") String leaseCommenceDate,
    @JsonProperty("remaining_lease") String remainingLease,
    @JsonProperty("resale_price") String resalePrice) {
}
