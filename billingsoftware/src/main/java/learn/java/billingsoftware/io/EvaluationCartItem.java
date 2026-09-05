package learn.java.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EvaluationCartItem {
    private String itemId;
    private String variantId;
    private String name;
    private BigDecimal basePrice;
    private BigDecimal price;
    private Integer quantity;
    private List<SelectedModifier> selectedModifiers;
}
