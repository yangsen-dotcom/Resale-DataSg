package sg.datasg.resale.transaction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "resale_transaction")
public class ResaleTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate month;

    @Column(nullable = false)
    private String town;

    @Column(name = "flat_type", nullable = false)
    private String flatType;

    @Column(nullable = false)
    private String block;

    @Column(name = "street_name", nullable = false)
    private String streetName;

    @Column(name = "storey_range", nullable = false)
    private String storeyRange;

    @Column(name = "floor_area_sqm", nullable = false)
    private BigDecimal floorAreaSqm;

    @Column(name = "flat_model", nullable = false)
    private String flatModel;

    @Column(name = "lease_commence_date", nullable = false)
    private Short leaseCommenceDate;

    @Column(name = "remaining_lease", nullable = false)
    private String remainingLease;

    @Column(name = "resale_price", nullable = false)
    private BigDecimal resalePrice;

    protected ResaleTransaction() {
        // JPA
    }

    public ResaleTransaction(LocalDate month, String town, String flatType, String block, String streetName,
        String storeyRange, BigDecimal floorAreaSqm, String flatModel, Short leaseCommenceDate,
        String remainingLease, BigDecimal resalePrice) {
        this.month = month;
        this.town = town;
        this.flatType = flatType;
        this.block = block;
        this.streetName = streetName;
        this.storeyRange = storeyRange;
        this.floorAreaSqm = floorAreaSqm;
        this.flatModel = flatModel;
        this.leaseCommenceDate = leaseCommenceDate;
        this.remainingLease = remainingLease;
        this.resalePrice = resalePrice;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getMonth() {
        return month;
    }

    public String getTown() {
        return town;
    }

    public String getFlatType() {
        return flatType;
    }

    public String getBlock() {
        return block;
    }

    public String getStreetName() {
        return streetName;
    }

    public String getStoreyRange() {
        return storeyRange;
    }

    public BigDecimal getFloorAreaSqm() {
        return floorAreaSqm;
    }

    public String getFlatModel() {
        return flatModel;
    }

    public Short getLeaseCommenceDate() {
        return leaseCommenceDate;
    }

    public String getRemainingLease() {
        return remainingLease;
    }

    public BigDecimal getResalePrice() {
        return resalePrice;
    }
}
