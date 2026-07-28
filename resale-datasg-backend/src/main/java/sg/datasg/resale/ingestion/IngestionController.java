package sg.datasg.resale.ingestion;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sg.datasg.resale.common.IngestionInProgressException;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Manual data ingestion controls")
public class IngestionController {

    private final IngestionService ingestionService;

    public IngestionController(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping("/ingest")
    public ResponseEntity<IngestStatusResponse> ingest() {
        if (ingestionService.isIngestionInProgress()) {
            throw new IngestionInProgressException();
        }
        ingestionService.reingestAllAsync();
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(new IngestStatusResponse("STARTED"));
    }
}
