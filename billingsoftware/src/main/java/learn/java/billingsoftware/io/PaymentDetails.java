package learn.java.billingsoftware.io;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentDetails {
    private String orderId;
//    private String paymentId;
//    private String signature;
    private PaymentStatus status;
    private String paymentLinkId;

    // Bổ sung 2 trường này để lưu DB
    @Column(length = 1000)
    private String checkoutUrl;

    @Column(columnDefinition = "TEXT")
    private String qrCode;

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, CANCELLED
    }
}