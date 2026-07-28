package sg.datasg.resale.transaction;

import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;
import sg.datasg.resale.transaction.dto.TransactionFilterRequest;

public final class ResaleTransactionSpecification {

    private ResaleTransactionSpecification() {
    }

    public static Specification<ResaleTransaction> fromFilter(TransactionFilterRequest filter) {
        Specification<ResaleTransaction> spec = Specification.where(null);

        if (filter.towns() != null && !filter.towns().isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("town").in(filter.towns()));
        }
        if (filter.flatTypes() != null && !filter.flatTypes().isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("flatType").in(filter.flatTypes()));
        }
        if (filter.minPrice() != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("resalePrice"), filter.minPrice()));
        }
        if (filter.maxPrice() != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("resalePrice"), filter.maxPrice()));
        }
        if (filter.fromMonth() != null) {
            LocalDate from = filter.fromMonth().atDay(1);
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("month"), from));
        }
        if (filter.toMonth() != null) {
            LocalDate to = filter.toMonth().atEndOfMonth();
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("month"), to));
        }
        return spec;
    }
}
