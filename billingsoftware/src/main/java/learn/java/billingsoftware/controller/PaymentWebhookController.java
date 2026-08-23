package learn.java.billingsoftware.controller;

import learn.java.billingsoftware.entity.OrderEntity;
import learn.java.billingsoftware.io.PaymentDetails;
import learn.java.billingsoftware.repository.OrderEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.PayOS;
import vn.payos.exception.PayOSException;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

@RestController
@RequestMapping("/payos")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PayOS payOS;
    private final OrderEntityRepository orderRepository;

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody Webhook webhookBody) {
        try {
            // Xác thực webhook (SDK sẽ kiểm tra signature)
            WebhookData data = payOS.webhooks().verify(webhookBody);

            // Kiểm tra giao dịch thành công
            if ("00".equals(data.getCode())) {
                Long orderCode = data.getOrderCode();

                if (orderCode == 123L) {
                    System.out.println(">>> Đã kết nối Webhook PayOS thành công (TEST REQUEST)!");
                    return ResponseEntity.ok("success"); // Trả về 200 OK ngay lập tức
                }

                OrderEntity order = orderRepository.findById(orderCode)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với orderCode: " + orderCode));

                // Cập nhật trạng thái
                if (order.getPaymentDetails() != null) {
                    order.getPaymentDetails().setStatus(PaymentDetails.PaymentStatus.COMPLETED);
                } else {
                    // Trường hợp chưa có PaymentDetails
                    PaymentDetails pd = new PaymentDetails();
                    pd.setStatus(PaymentDetails.PaymentStatus.COMPLETED);
                    order.setPaymentDetails(pd);
                }

                orderRepository.save(order);

                return ResponseEntity.ok("success"); // Hoặc Map.of("code", "00")
            }

            return ResponseEntity.badRequest().body("Giao dịch không thành công");

        } catch (PayOSException e) {
            // Lỗi signature hoặc webhook không hợp lệ
            return ResponseEntity.badRequest().body("Webhook verify failed: " + e.getMessage());
        } catch (Exception e) {
            // Lỗi khác (database, ...)
            return ResponseEntity.internalServerError().body("Lỗi xử lý webhook: " + e.getMessage());
        }
    }
}