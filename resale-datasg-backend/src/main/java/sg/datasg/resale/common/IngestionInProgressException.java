package sg.datasg.resale.common;

public class IngestionInProgressException extends RuntimeException {

    public IngestionInProgressException() {
        super("An ingestion run is already in progress");
    }
}
