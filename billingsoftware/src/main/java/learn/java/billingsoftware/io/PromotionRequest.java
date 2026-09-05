package learn.java.billingsoftware.io;

import learn.java.billingsoftware.entity.DiscountType;
import learn.java.billingsoftware.entity.PromotionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PromotionRequest {
    private String name;
    private String description;
    private PromotionType type;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String daysOfWeek;
    private String buyVariantId;
    private String getVariantId;
    private BigDecimal bogoDiscountPercent;
    private Integer usageLimit;
    private Boolean isActive;
}
