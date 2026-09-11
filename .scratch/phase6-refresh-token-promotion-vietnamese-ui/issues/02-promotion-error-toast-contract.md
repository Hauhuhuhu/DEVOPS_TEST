# 02: Promotion Error Contract and Vietnamese Toast

**What to build:**
Khi đánh giá mã giảm giá thất bại, nhân viên bán hàng nhận được toast tiếng Việt ngắn gọn, trực quan và đúng nguyên nhân nghiệp vụ. Backend cung cấp mã lỗi ổn định để frontend ánh xạ, không buộc UI hiển thị thông báo kỹ thuật từ backend.

**Blocked by:** None (can start immediately).

**Status:** closed
Completed: true

- [x] Mã giảm giá không tồn tại hiển thị “Mã giảm giá không tồn tại”.
- [x] Mã đã hết hạn hiển thị “Mã giảm giá đã hết hạn sử dụng”.
- [x] Mã đã hết lượt sử dụng hiển thị “Mã giảm giá đã hết lượt sử dụng”.
- [x] Các trường hợp Promotion không hoạt động, chưa bắt đầu hoặc đơn hàng chưa đạt mức tối thiểu có thông báo tiếng Việt tương ứng.
- [x] Lỗi đánh giá Promotion dùng HTTP 400 và mã nghiệp vụ; 403 không còn được dùng cho các lỗi mã giảm giá này.
- [x] Frontend không hiển thị raw backend message cho nhóm lỗi Promotion; test contract và order checkout regression đạt.

## Comments

- 2026-09-11: Ticket được tạo hồi quy sau commit `0b5b823`; implementation đã hoàn tất trước khi tài liệu được bổ sung.
