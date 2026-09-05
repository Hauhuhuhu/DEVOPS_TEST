package learn.java.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VariantResponse {
    private String variantId;
    private String sku;
    private BigDecimal basePrice;
    private Map<String, String> attributes;
    private Integer cachedStockQuantity;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
