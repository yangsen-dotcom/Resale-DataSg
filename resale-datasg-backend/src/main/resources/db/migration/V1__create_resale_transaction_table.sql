CREATE TABLE resale_transaction (
    id                   BIGSERIAL PRIMARY KEY,
    month                DATE           NOT NULL,
    town                 VARCHAR(64)    NOT NULL,
    flat_type            VARCHAR(32)    NOT NULL,
    block                VARCHAR(16)    NOT NULL,
    street_name          VARCHAR(128)   NOT NULL,
    storey_range         VARCHAR(16)    NOT NULL,
    floor_area_sqm       NUMERIC(6, 2)  NOT NULL,
    flat_model           VARCHAR(64)    NOT NULL,
    lease_commence_date  SMALLINT       NOT NULL,
    remaining_lease      VARCHAR(32)    NOT NULL,
    resale_price         NUMERIC(11, 2) NOT NULL,
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_resale_transaction_month ON resale_transaction (month);
CREATE INDEX idx_resale_transaction_town ON resale_transaction (town);
CREATE INDEX idx_resale_transaction_flat_type ON resale_transaction (flat_type);
CREATE INDEX idx_resale_transaction_price ON resale_transaction (resale_price);
CREATE INDEX idx_resale_transaction_town_month ON resale_transaction (town, month);
