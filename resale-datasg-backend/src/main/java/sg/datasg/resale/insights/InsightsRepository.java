package sg.datasg.resale.insights;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import sg.datasg.resale.transaction.ResaleTransaction;

public interface InsightsRepository extends Repository<ResaleTransaction, Long> {

    @Query(nativeQuery = true, value = """
        SELECT
          count(*) AS totalTransactions,
          avg(resale_price) AS averagePrice,
          percentile_cont(0.5) WITHIN GROUP (ORDER BY resale_price) AS medianPrice,
          min(resale_price) AS minPrice,
          max(resale_price) AS maxPrice
        FROM resale_transaction
        WHERE (:town IS NULL OR town = :town)
          AND (:flatType IS NULL OR flat_type = :flatType)
        """)
    SummaryStatsProjection summaryStats(@Param("town") String town, @Param("flatType") String flatType);

    @Query(nativeQuery = true, value = """
        SELECT
          CASE WHEN :unit = 'year' THEN to_char(bucket, 'YYYY')
               ELSE to_char(bucket, 'YYYY-MM') END AS period,
          avg(resale_price) AS averagePrice,
          count(*) AS transactionCount
        FROM (
          SELECT date_trunc(:unit, month) AS bucket, resale_price
          FROM resale_transaction
          WHERE (:town IS NULL OR town = :town)
            AND (:flatType IS NULL OR flat_type = :flatType)
        ) bucketed
        GROUP BY bucket
        ORDER BY bucket
        """)
    List<PriceTrendProjection> priceTrend(@Param("unit") String unit, @Param("town") String town,
        @Param("flatType") String flatType);

    @Query(nativeQuery = true, value = """
        SELECT
          town AS town,
          avg(resale_price) AS averagePrice,
          count(*) AS transactionCount
        FROM resale_transaction
        WHERE (:flatType IS NULL OR flat_type = :flatType)
          AND (:fromMonth IS NULL OR month >= :fromMonth)
          AND (:toMonth IS NULL OR month <= :toMonth)
        GROUP BY town
        ORDER BY avg(resale_price) DESC
        """)
    List<TownAverageProjection> averagePriceByTown(@Param("flatType") String flatType,
        @Param("fromMonth") LocalDate fromMonth, @Param("toMonth") LocalDate toMonth);

    @Query(nativeQuery = true, value = """
        SELECT
          flat_type AS flatType,
          avg(resale_price) AS averagePrice,
          count(*) AS transactionCount
        FROM resale_transaction
        WHERE (:town IS NULL OR town = :town)
          AND (:fromMonth IS NULL OR month >= :fromMonth)
          AND (:toMonth IS NULL OR month <= :toMonth)
        GROUP BY flat_type
        ORDER BY avg(resale_price) DESC
        """)
    List<FlatTypeAverageProjection> averagePriceByFlatType(@Param("town") String town,
        @Param("fromMonth") LocalDate fromMonth, @Param("toMonth") LocalDate toMonth);
}
