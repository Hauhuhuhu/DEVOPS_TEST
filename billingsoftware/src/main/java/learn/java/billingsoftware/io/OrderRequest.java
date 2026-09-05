package learn.java.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderRequest {

    private String customerId;
    private String customerName;
    private String phoneNumber;
    private List<OrderItemRequest> cartItems;
    private String couponCode;
    private String appliedPromotionId;
    private Double subtotal;
    private Double discountAmount;
    private Double tax;
    private Double grandTotal;
    private String paymentMethod;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private String itemId;
        private String variantId;
        private String name;
        private Double basePrice;
        private Double price;
        private Integer quantity;
        private List<SelectedModifier> selectedModifiers;
    }

}
