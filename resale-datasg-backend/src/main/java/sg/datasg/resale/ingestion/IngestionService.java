package sg.datasg.resale.ingestion;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import sg.datasg.resale.common.IngestionInProgressException;
import sg.datasg.resale.config.IngestionProperties;
import sg.datasg.resale.ingestion.datagovsg.DataGovSgClient;
import sg.datasg.resale.ingestion.datagovsg.DatastoreSearchResponse;
import sg.datasg.resale.ingestion.datagovsg.RawResaleTransactionRecord;
import sg.datasg.resale.insights.InsightsCacheNames;
import sg.datasg.resale.transaction.ResaleTransaction;
import sg.datasg.resale.transaction.ResaleTransactionRepository;

@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final DataGovSgClient client;
    private final TransactionRecordMapper mapper;
    private final ResaleTransactionRepository repository;
    private final IngestionProperties properties;
    private final CacheManager cacheManager;
    private final AtomicBoolean ingestionInProgress = new AtomicBoolean(false);

    public IngestionService(DataGovSgClient client, TransactionRecordMapper mapper,
        ResaleTransactionRepository repository, IngestionProperties properties, CacheManager cacheManager) {
        this.client = client;
        this.mapper = mapper;
        this.repository = repository;
        this.properties = properties;
        this.cacheManager = cacheManager;
    }

    public boolean isIngestionInProgress() {
        return ingestionInProgress.get();
    }

    /**
     * Runs {@link #reingestAll()} on a background thread so callers (e.g. the admin
     * endpoint) can return immediately. {@link #isIngestionInProgress()} should be
     * checked by the caller first to avoid triggering an overlapping run.
     */
    @Async
    public void reingestAllAsync() {
        reingestAll();
    }

    /**
     * Truncates and reloads the full dataset from data.gov.sg, page by page.
     * Throws {@link IngestionInProgressException} if a run is already in flight.
     */
    public void reingestAll() {
        if (!ingestionInProgress.compareAndSet(false, true)) {
            throw new IngestionInProgressException();
        }
        try {
            log.info("Starting ingestion of dataset {}", properties.datasetId());
            repository.deleteAllInBatch();
            long offset = 0;
            long total = Long.MAX_VALUE;
            int pageSize = properties.pageSize();
            int rowsIngested = 0;
            while (offset < total) {
                DatastoreSearchResponse page = client.fetchPage(properties.datasetId(), pageSize, offset);
                if (page == null || !page.success() || page.result() == null) {
                    throw new IllegalStateException("data.gov.sg datastore_search call failed for offset " + offset);
                }
                total = page.result().total();
                List<RawResaleTransactionRecord> rawRecords = page.result().records();
                if (rawRecords.isEmpty()) {
                    break;
                }
                saveBatch(rawRecords);
                rowsIngested += rawRecords.size();
                offset += rawRecords.size();
                log.info("Ingested {}/{} rows", rowsIngested, total);
            }
            log.info("Ingestion complete: {} rows loaded", rowsIngested);
            evictFilterOptionCaches();
            evictInsightsCaches();
        } finally {
            ingestionInProgress.set(false);
        }
    }

    private void saveBatch(List<RawResaleTransactionRecord> rawRecords) {
        List<ResaleTransaction> batch = rawRecords.stream().map(mapper::toEntity).toList();
        repository.saveAll(batch);
    }

    private void evictFilterOptionCaches() {
        for (String cacheName : List.of("towns", "flatTypes", "blocks")) {
            var cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
            }
        }
    }

    private void evictInsightsCaches() {
        for (String cacheName : InsightsCacheNames.ALL) {
            var cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
            }
        }
    }
}
