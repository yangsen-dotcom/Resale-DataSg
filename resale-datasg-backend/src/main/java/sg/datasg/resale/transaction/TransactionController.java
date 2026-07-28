package sg.datasg.resale.transaction;

import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Sort;
import sg.datasg.resale.transaction.dto.PagedResponse;
import sg.datasg.resale.transaction.dto.TransactionFilterRequest;
import sg.datasg.resale.transaction.dto.TransactionResponse;

@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transactions", description = "Browse and filter individual HDB resale transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public PagedResponse<TransactionResponse> list(
        @RequestParam(required = false) List<String> town,
        @RequestParam(required = false) List<String> flatType,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) YearMonth fromMonth,
        @RequestParam(required = false) YearMonth toMonth,
        @PageableDefault(size = 20, sort = "month", direction = Sort.Direction.DESC) Pageable pageable) {

        TransactionFilterRequest filter =
            new TransactionFilterRequest(town, flatType, minPrice, maxPrice, fromMonth, toMonth);
        Page<TransactionResponse> page = transactionService.list(filter, pageable);
        return PagedResponse.of(page);
    }

    @GetMapping("/towns")
    public List<String> towns() {
        return transactionService.distinctTowns();
    }

    @GetMapping("/flat-types")
    public List<String> flatTypes() {
        return transactionService.distinctFlatTypes();
    }
}
