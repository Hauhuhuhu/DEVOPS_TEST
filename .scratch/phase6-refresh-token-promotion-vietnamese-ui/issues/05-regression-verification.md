# 05: Regression Verification for Session and Vietnamese UX

**What to build:**
Xác nhận các vertical slice của Phase 6 cùng tồn tại mà không làm hỏng các flow bán hàng, khuyến mãi, quyền truy cập, Item/Variant và giao diện hiện có.

**Blocked by:** 01: Rotating Refresh Session; 02: Promotion Error Contract and Vietnamese Toast; 03: Responsive Variant Form Input; 04: Vietnamese User Interface Consistency.

**Status:** closed
Completed: true

- [x] Frontend lint đạt.
- [x] Frontend production build đạt; chỉ còn cảnh báo kích thước chunk của Vite.
- [x] Backend compile đạt.
- [x] Test vòng đời Refresh Token, Promotion evaluation và order checkout đạt.
- [x] Toàn bộ backend `mvn test` đạt sau khi cập nhật kỳ vọng 401/403 và hợp đồng lỗi Promotion.
- [x] `git diff --check` đạt cho thay đổi đã kiểm tra.

## Comments

- 2026-09-11: Ticket được tạo hồi quy sau commit `0b5b823`; implementation và verification đã hoàn tất trước khi tài liệu được bổ sung.
