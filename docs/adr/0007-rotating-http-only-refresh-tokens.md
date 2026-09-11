# ADR 0007: Rotating HttpOnly Refresh Tokens

Phiên đăng nhập dùng Access Token JWT ngắn hạn trong bộ nhớ trình duyệt và Refresh Token dạng opaque được lưu dưới cookie HttpOnly. Mỗi lần refresh sẽ thu hồi token cũ và phát hành token mới trong cùng một Refresh Token Family; token được lưu dưới dạng hash trong database để hỗ trợ đăng xuất, phát hiện replay và thu hồi phiên mà không để credential dài hạn trong localStorage.

## Consequences

- Access Token không còn được giữ qua reload; frontend phải khôi phục phiên bằng endpoint refresh khi khởi động.
- Refresh Token cần bảng lưu phiên và cookie phải được cấu hình phù hợp với môi trường triển khai (Secure/SameSite).
- Nếu phát hiện một token đã bị xoay được dùng lại, toàn bộ Refresh Token Family tương ứng sẽ bị thu hồi.
