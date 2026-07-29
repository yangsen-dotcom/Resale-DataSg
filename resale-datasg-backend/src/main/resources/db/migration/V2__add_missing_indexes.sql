-- Mirrors the existing (town, month) composite for the flat-type equivalent,
-- used by priceTrendByFlatType, averagePriceByTown, and priceTrend(flatType).
CREATE INDEX idx_resale_transaction_flat_type_month ON resale_transaction (flat_type, month);

-- Expression index matching split_part(remaining_lease, ' ', 1)::int, the
-- GROUP BY key in averagePriceByRemainingLease — a plain column index on
-- remaining_lease wouldn't help since the query groups by the parsed value.
CREATE INDEX idx_resale_transaction_remaining_lease_years
    ON resale_transaction ((split_part(remaining_lease, ' ', 1)::int));

-- block is both an equality filter on /api/transactions and a sortable column.
CREATE INDEX idx_resale_transaction_block ON resale_transaction (block);
