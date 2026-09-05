package learn.java.billingsoftware.io;

import learn.java.billingsoftware.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InventoryTransactionRequest {
    private String variantId;
    private TransactionType transactionType;
    private Integer quantity;
    private String referenceId;
    private String note;
}
