# 01: Rotating Refresh Session

**What to build:**
Người dùng có thể đăng nhập, tải lại trang, tiếp tục làm việc khi Access Token hết hạn và đăng xuất an toàn. Refresh Token được giữ trong cookie HttpOnly, được xoay vòng theo Refresh Token Family, còn Access Token chỉ nằm trong memory của frontend.

**Blocked by:** None (can start immediately).

**Status:** closed
Completed: true

- [x] Đăng nhập cấp Access Token và Refresh Token cookie với thời hạn có thể cấu hình.
- [x] Khởi động frontend tự khôi phục session bằng refresh; request bị 401 được refresh và retry tối đa một lần.
- [x] Refresh Token cũ bị thu hồi sau khi xoay; logout thu hồi phiên và xóa cookie.
- [x] Token hết hạn, token không hợp lệ hoặc token bị replay bị từ chối; replay thu hồi toàn bộ Refresh Token Family.
- [x] 401 và 403 được phân biệt đúng để không biến lỗi thiếu quyền thành lỗi refresh session.
- [x] Test vòng đời Refresh Token và toàn bộ backend regression suite đạt.

## Comments

- 2026-09-11: Ticket được tạo hồi quy sau commit `0b5b823`; implementation đã hoàn tất trước khi tài liệu được bổ sung.
