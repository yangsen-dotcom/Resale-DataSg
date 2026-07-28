package sg.datasg.resale.transaction;

import java.util.List;
import java.util.Set;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import sg.datasg.resale.transaction.dto.TransactionFilterRequest;
import sg.datasg.resale.transaction.dto.TransactionResponse;

@Service
public class TransactionService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
        "month", "town", "flatType", "block", "streetName", "storeyRange",
        "floorAreaSqm", "remainingLease", "resalePrice");

    private final ResaleTransactionRepository repository;

    public TransactionService(ResaleTransactionRepository repository) {
        this.repository = repository;
    }

    public Page<TransactionResponse> list(TransactionFilterRequest filter, Pageable pageable) {
        validateSort(pageable.getSort());
        return repository.findAll(ResaleTransactionSpecification.fromFilter(filter), pageable)
            .map(TransactionResponse::from);
    }

    @Cacheable("towns")
    public List<String> distinctTowns() {
        return repository.findDistinctTowns();
    }

    @Cacheable("flatTypes")
    public List<String> distinctFlatTypes() {
        return repository.findDistinctFlatTypes();
    }

    private void validateSort(Sort sort) {
        for (Sort.Order order : sort) {
            if (!ALLOWED_SORT_FIELDS.contains(order.getProperty())) {
                throw new IllegalArgumentException(
                    "Invalid sort field '" + order.getProperty() + "'. Allowed: " + ALLOWED_SORT_FIELDS);
            }
        }
    }
}
