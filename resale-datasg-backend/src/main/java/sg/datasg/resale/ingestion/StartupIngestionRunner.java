package sg.datasg.resale.ingestion;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import sg.datasg.resale.config.IngestionProperties;
import sg.datasg.resale.transaction.ResaleTransactionRepository;

/**
 * Populates the database from data.gov.sg on first startup only. Subsequent restarts
 * skip ingestion since the table is already populated, so a re-run is instant.
 */
@Component
public class StartupIngestionRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(StartupIngestionRunner.class);

    private final ResaleTransactionRepository repository;
    private final IngestionService ingestionService;
    private final IngestionProperties properties;

    public StartupIngestionRunner(ResaleTransactionRepository repository, IngestionService ingestionService,
        IngestionProperties properties) {
        this.repository = repository;
        this.ingestionService = ingestionService;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!properties.startupIngestionEnabled()) {
            log.info("Startup ingestion disabled via resale.ingestion.startup-ingestion-enabled=false");
            return;
        }
        if (repository.count() > 0) {
            log.info("resale_transaction table already populated, skipping startup ingestion");
            return;
        }
        log.info("resale_transaction table is empty, running initial ingestion from data.gov.sg");
        ingestionService.reingestAll();
    }
}
