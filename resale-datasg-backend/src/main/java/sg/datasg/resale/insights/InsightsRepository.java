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
        WHERE (CAST(:town AS varchar) IS NULL OR town = :town)
          AND (CAST(:flatType AS varchar) IS NULL OR flat_type = :flatType)
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
          WHERE (CAST(:town AS varchar) IS NULL OR town = :town)
            AND (CAST(:flatType AS varchar) IS NULL OR flat_type = :flatType)
        ) bucketed
        GROUP BY bucket
        ORDER BY bucket
        """)
    List<PriceTrendProjection> priceTrend(@Param("unit") String unit, @Param("town") String town,
        @Param("flatType") String flatType);

    @Query(nativeQuery = true, value = """
        SELECT
          town AS town,
          CASE WHEN :unit = 'year' THEN to_char(bucket, 'YYYY')
               ELSE to_char(bucket, 'YYYY-MM') END AS period,
          avg(resale_price) AS averagePrice,
          count(*) AS transactionCount
        FROM (
          SELECT town, date_trunc(:unit, month) AS bucket, resale_price
          FROM resale_transaction
        ) bucketed
        GROUP BY town, bucket
        ORDER BY town, bucket
        """)
    List<TownPriceTrendProjection> priceTrendByTown(@Param("unit") String unit);

    @Query(nativeQuery = true, value = """
        SELECT
          town AS town,
          CASE WHEN :unit = 'year' THEN to_char(bucket, 'YYYY')
               ELSE to_char(bucket, 'YYYY-MM') END AS period,
          max(resale_price) AS maxPrice,
          count(*) AS transactionCount
        FROM (
          SELECT town, date_trunc(:unit, month) AS bucket, resale_price
          FROM resale_transaction
        ) bucketed
        GROUP BY town, bucket
        ORDER BY town, bucket
        """)
    List<TownMaxPriceTrendProjection> maxPriceTrendByTown(@Param("unit") String unit);

    @Query(nativeQuery = true, value = """
        SELECT
          town AS town,
          CASE WHEN :unit = 'year' THEN to_char(bucket, 'YYYY')
               ELSE to_char(bucket, 'YYYY-MM') END AS period,
          min(resale_price) AS minPrice,
          count(*) AS transactionCount
        FROM (
          SELECT town, date_trunc(:unit, month) AS bucket, resale_price
          FROM resale_transaction
        ) bucketed
        GROUP BY town, bucket
        ORDER BY town, bucket
        """)
    List<TownMinPriceTrendProjection> minPriceTrendByTown(@Param("unit") String unit);

    @Query(nativeQuery = true, value = """
        SELECT
          town AS town,
          CASE WHEN :unit = 'year' THEN to_char(bucket, 'YYYY')
               ELSE to_char(bucket, 'YYYY-MM') END AS period,
          percentile_cont(0.5) WITHIN GROUP (ORDER BY resale_price) AS medianPrice,
          count(*) AS transactionCount
        FROM (
          SELECT town, date_trunc(:unit, month) AS bucket, resale_price
          FROM resale_transaction
        ) bucketed
        GROUP BY town, bucket
        ORDER BY town, bucket
        """)
    List<TownMedianPriceTrendProjection> medianPriceTrendByTown(@Param("unit") String unit);

    @Query(nativeQuery = true, value = """
        SELECT
          town AS town,
          CASE WHEN :unit = 'year' THEN to_char(bucket, 'YYYY')
               ELSE to_char(bucket, 'YYYY-MM') END AS period,
          avg(resale_price / floor_area_sqm) AS pricePerSqm,
          count(*) AS transactionCount
        FROM (
          SELECT town, date_trunc(:unit, month) AS bucket, resale_price, floor_area_sqm
          FROM resale_transaction
        ) bucketed
        GROUP BY town, bucket
        ORDER BY town, bucket
        """)
    List<TownPricePerSqmTrendProjection> pricePerSqmTrendByTown(@Param("unit") String unit);

    @Query(nativeQuery = true, value = """
        SELECT
          flat_type AS flatType,
          CASE WHEN :unit = 'year' THEN to_char(bucket, 'YYYY')
               ELSE to_char(bucket, 'YYYY-MM') END AS period,
          avg(resale_price) AS averagePrice,
          count(*) AS transactionCount
        FROM (
          SELECT flat_type, date_trunc(:unit, month) AS bucket, resale_price
          FROM resale_transaction
        ) bucketed
        GROUP BY flat_type, bucket
        ORDER BY flat_type, bucket
        """)
    List<FlatTypePriceTrendProjection> priceTrendByFlatType(@Param("unit") String unit);

    @Query(nativeQuery = true, value = """
        SELECT
          CASE WHEN :unit = 'year' THEN to_char(bucket, 'YYYY')
               ELSE to_char(bucket, 'YYYY-MM') END AS period,
          percentile_cont(0.5) WITHIN GROUP (ORDER BY floor_area_sqm) AS medianArea,
          count(*) AS transactionCount
        FROM (
          SELECT date_trunc(:unit, month) AS bucket, floor_area_sqm
          FROM resale_transaction
        ) bucketed
        GROUP BY bucket
        ORDER BY bucket
        """)
    List<AreaTrendProjection> areaTrend(@Param("unit") String unit);

    @Query(nativeQuery = true, value = """
        SELECT
          split_part(remaining_lease, ' ', 1)::int AS remainingLeaseYears,
          avg(resale_price) AS averagePrice,
          count(*) AS transactionCount
        FROM resale_transaction
        GROUP BY remainingLeaseYears
        ORDER BY remainingLeaseYears
        """)
    List<RemainingLeaseProjection> averagePriceByRemainingLease();

    @Query(nativeQuery = true, value = """
        SELECT
          storey_range AS storeyRange,
          avg(resale_price) AS averagePrice,
          count(*) AS transactionCount
        FROM resale_transaction
        GROUP BY storey_range
        ORDER BY storey_range
        """)
    List<StoreyRangeProjection> averagePriceByStoreyRange();

    @Query(nativeQuery = true, value = """
        SELECT
          town AS town,
          avg(resale_price) AS averagePrice,
          count(*) AS transactionCount
        FROM resale_transaction
        WHERE (CAST(:flatType AS varchar) IS NULL OR flat_type = :flatType)
          AND (CAST(:fromMonth AS date) IS NULL OR month >= :fromMonth)
          AND (CAST(:toMonth AS date) IS NULL OR month <= :toMonth)
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
        WHERE (CAST(:town AS varchar) IS NULL OR town = :town)
          AND (CAST(:fromMonth AS date) IS NULL OR month >= :fromMonth)
          AND (CAST(:toMonth AS date) IS NULL OR month <= :toMonth)
        GROUP BY flat_type
        ORDER BY avg(resale_price) DESC
        """)
    List<FlatTypeAverageProjection> averagePriceByFlatType(@Param("town") String town,
        @Param("fromMonth") LocalDate fromMonth, @Param("toMonth") LocalDate toMonth);
}
