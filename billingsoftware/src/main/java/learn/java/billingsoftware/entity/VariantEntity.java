package learn.java.billingsoftware.entity;

import jakarta.persistence.*;
import learn.java.billingsoftware.entity.converter.JsonAttributesConverter;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "tbl_variants")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VariantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String variantId;

    @Column(unique = true, nullable = false)
    private String sku;

    @Column(nullable = false)
    private BigDecimal basePrice;

    @Convert(converter = JsonAttributesConverter.class)
    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private Map<String, String> attributes = new HashMap<>();

    @Column(name = "cached_stock_quantity", nullable = false)
    @Builder.Default
    private Integer cachedStockQuantity = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ItemEntity item;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;
}
