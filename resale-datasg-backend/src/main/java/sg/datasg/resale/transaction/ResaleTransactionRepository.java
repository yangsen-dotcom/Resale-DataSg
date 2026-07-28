package sg.datasg.resale.transaction;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ResaleTransactionRepository
    extends JpaRepository<ResaleTransaction, Long>, JpaSpecificationExecutor<ResaleTransaction> {

    @Query("select distinct t.town from ResaleTransaction t order by t.town")
    List<String> findDistinctTowns();

    @Query("select distinct t.flatType from ResaleTransaction t order by t.flatType")
    List<String> findDistinctFlatTypes();
}
