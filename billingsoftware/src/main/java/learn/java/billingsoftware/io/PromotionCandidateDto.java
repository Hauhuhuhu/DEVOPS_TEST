package learn.java.billingsoftware.io;

import learn.java.billingsoftware.entity.PromotionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PromotionCandidateDto {
    private String promotionId;
    private String name;
    private PromotionType type;
    private BigDecimal discountAmount;
    private String description;
}
