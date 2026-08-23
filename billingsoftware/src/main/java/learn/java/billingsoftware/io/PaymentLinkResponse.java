package learn.java.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentLinkResponse {
    private String orderId;      // Mã đơn hàng nội bộ, ví dụ: ORD1720614038123
    private Long orderCode;      // orderCode gửi cho payOS (= id của đơn hàng trong DB)
    private Long amount;
    private String checkoutUrl;  // Link thanh toán đầy đủ của payOS (mở được trên điện thoại)
    private String qrCode;       // Chuỗi dữ liệu VietQR - FE dùng thư viện QR để vẽ ra hình ảnh
    private String status;       // Trạng thái link thanh toán phía payOS
}