package learn.java.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VariantRequest {
    private String sku;
    private BigDecimal basePrice;
    private Map<String, String> attributes;
    private Integer initialStock;
}
