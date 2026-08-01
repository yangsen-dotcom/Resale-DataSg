package sg.datasg.resale.insights;

public interface WealthIndexProjection {
    String getTown();

    String getPeriod();

    Long getMillionDollarCount();

    Long getTotalTransactionCount();
}
