# 04: Vietnamese User Interface Consistency

**What to build:**
Người dùng Việt nhìn thấy một giao diện nhất quán bằng tiếng Việt trên các flow xác thực, quản trị, POS, đơn hàng, kho, khuyến mãi, khách hàng và nhật ký hoạt động, bao gồm cả trạng thái, phương thức thanh toán, modal, filter, validation và toast.

**Blocked by:** None (can start immediately).

**Status:** closed
Completed: true

- [x] Navigation, page title, form label, button, modal, loading, empty state và validation chính được Việt hóa.
- [x] Dashboard, Order History, POS/cart/payment, Item/Category/Modifier, Inventory, Promotion, User/Customer và Activity Log dùng nhãn tiếng Việt.
- [x] Status đơn hàng, payment status, action badge và filter hiển thị tiếng Việt dễ hiểu.
- [x] Toast thành công/lỗi phổ biến dùng tiếng Việt và không làm lộ raw backend message.
- [x] SKU, mã Promotion, dữ liệu do người dùng nhập và identifier kỹ thuật được giữ nguyên để tránh sai lệch dữ liệu.

## Comments

- 2026-09-11: Ticket được tạo hồi quy sau commit `0b5b823`; implementation đã hoàn tất trước khi tài liệu được bổ sung.
