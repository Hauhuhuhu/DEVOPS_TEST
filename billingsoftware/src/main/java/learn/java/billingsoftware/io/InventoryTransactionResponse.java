package learn.java.billingsoftware.io;

import learn.java.billingsoftware.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InventoryTransactionResponse {
    private String transactionId;
    private String variantId;
    private String sku;
    private String itemName;
    private TransactionType transactionType;
    private Integer quantity;
    private String referenceId;
    private String note;
    private Integer balanceAfter;
    private Timestamp createdAt;
}
