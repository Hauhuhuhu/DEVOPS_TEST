package learn.java.billingsoftware.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "tbl_promotions")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PromotionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String promotionId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PromotionType type;

    @Column(unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal discountValue = BigDecimal.ZERO;

    private BigDecimal maxDiscountAmount;

    @Builder.Default
    @Column(nullable = false)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    private LocalDate startDate;
    private LocalDate endDate;

    private LocalTime startTime;
    private LocalTime endTime;

    // Comma-separated days of week, e.g. "MONDAY,TUESDAY,WEDNESDAY"
    private String daysOfWeek;

    // For BOGO
    private String buyVariantId;
    private String getVariantId;

    @Builder.Default
    private BigDecimal bogoDiscountPercent = BigDecimal.valueOf(100.0);

    private Integer usageLimit;

    @Builder.Default
    @Column(nullable = false)
    private Integer timesUsed = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;
}
