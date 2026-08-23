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
    private String name;
    private Double price;
    private Integer quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id") // Cột khóa ngoại ở dưới database
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private OrderEntity order;
}
