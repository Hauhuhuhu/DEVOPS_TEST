package learn.java.billingsoftware.entity;

import jakarta.persistence.*;
import learn.java.billingsoftware.io.PaymentDetails;
import learn.java.billingsoftware.io.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="tbl_orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "order_code", unique = true, nullable = false)
    private String orderId;
    private String customerId;
    private String customerName;
    private String phoneNumber;
    private Double subtotal;
    @Builder.Default
    private Double discountAmount = 0.0;
    private Double tax;
    private Double grandTotal;
    private String promotionId;
    private String promotionName;
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemEntity> items = new ArrayList<>();

    // THỰC HÀNH TỐT (Best practice): Viết thêm một hàm tiện ích để thêm Item
    public void addOrderItem(OrderItemEntity item) {
        items.add(item);
        item.setOrder(this); // RẤT QUAN TRỌNG: Gán order cha cho item con
    }
    @Embedded
    private PaymentDetails paymentDetails;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @PrePersist
    protected void onCreate() {
        this.orderId = "ORD"+System.currentTimeMillis();
        this.createdAt = LocalDateTime.now();
    }
}
