package learn.java.billingsoftware.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tbl_order_items")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String itemId;
    @Column(name = "variant_id")
    private String variantId;
    private String name;
    private Double basePrice;
    private Double price;
    private Integer quantity;

    @Column(name = "selected_modifiers", columnDefinition = "TEXT")
    private String selectedModifiers;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id") // Cột khóa ngoại ở dưới database
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private OrderEntity order;
}
