# 03: End-to-End In-Flight Switch to Cash

**What to build:** An in-place payment method switch allowing cashiers to immediately convert a pending PayOS QR order to cash when a customer cannot complete the bank transfer. Clicking Chuyển sang tiền mặt on the QR modal completes the order as CASH, cancels the PayOS payment link to prevent duplicate payments, preserves the already deducted inventory without double-counting, automatically displays the printable receipt modal, and resets the POS cart for the next customer.

**Blocked by:** 02: End-to-End In-Flight Order Cancellation.

**Status:** resolved

- [x] A dedicated switch-to-cash endpoint accepts a pending order ID, transitions its payment method to CASH, and marks its payment status as COMPLETED.
- [x] Attempts to switch non-pending orders are rejected with appropriate error responses.
- [x] The remote PayOS payment link is cancelled via the gateway SDK to ensure the QR code can no longer receive funds.
- [x] No duplicate inventory transactions are recorded; the stock deducted at order creation remains valid and untouched.
- [x] An audit log record is created capturing the payment method switch to CASH.
- [x] The QR payment modal features a distinct Chuyển sang tiền mặt button with clear cashier feedback.
- [x] Upon successful cash conversion, the QR modal closes, the POS cart clears, and the receipt printing popup opens automatically displaying the completed CASH invoice.