# 03: Responsive Variant Form Input

**What to build:**
Store manager có thể thêm nhiều Variant vào Item form với các ô SKU, giá và Dynamic Attributes luôn nhìn thấy, nhập được và không bị tràn hoặc làm vỡ hàng thao tác ở desktop cũng như màn hình hẹp.

**Blocked by:** None (can start immediately).

**Status:** closed
Completed: true

- [x] Hàng Variant chuyển sang bố cục responsive, không làm co hoặc che khuất các ô nhập.
- [x] Các ô SKU, giá và thuộc tính biến thể chiếm đúng chiều rộng cột và vẫn sử dụng được ở viewport hẹp.
- [x] Nhãn, placeholder, validation và thao tác xóa Variant hiển thị nhất quán bằng tiếng Việt.
- [x] Cấu trúc Variant, SKU và Dynamic Attributes không thay đổi so với ADR-0001 và ADR-0005.
- [x] Item form không làm hỏng luồng tạo Item/Variant hiện có.

## Comments

- 2026-09-11: Ticket được tạo hồi quy sau commit `0b5b823`; implementation đã hoàn tất trước khi tài liệu được bổ sung.
