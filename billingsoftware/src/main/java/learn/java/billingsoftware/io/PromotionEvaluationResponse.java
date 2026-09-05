package learn.java.billingsoftware.io;

import learn.java.billingsoftware.entity.PromotionType;
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
public class PromotionEvaluationResponse {
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal discountedSubtotal;
    private BigDecimal tax;
    private BigDecimal grandTotal;
    private String appliedPromotionId;
    private String appliedPromotionName;
    private PromotionType appliedPromotionType;
    private String message;
    private List<PromotionCandidateDto> candidates;
}
