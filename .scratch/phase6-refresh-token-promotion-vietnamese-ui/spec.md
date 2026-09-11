Status: completed
Documentation mode: retroactive backfill after implementation
Source implementation: commit 0b5b823

# Spec: Phase 6 - Refresh Token, Promotion Feedback, Variant UI, and Vietnamese UX

## Problem Statement

Phiên đăng nhập hiện tại phụ thuộc vào Access Token được lưu ở trình duyệt. Khi token hết hạn hoặc trang được tải lại, người dùng dễ bị đưa về màn hình đăng nhập và cách lưu credential dài hạn làm tăng rủi ro bảo mật. API cũng chưa phân biệt rõ lỗi chưa xác thực với lỗi thiếu quyền.

Khi người dùng nhập mã giảm giá không tồn tại, hết hạn hoặc hết lượt sử dụng, giao diện nhận phản hồi 403 và hiển thị thông tin kỹ thuật từ backend. Cách phản hồi này không trực quan với nhân viên bán hàng và không diễn đạt đúng nguyên nhân nghiệp vụ.

Form tạo `Item` có nhiều `Variant` (SKU) còn bị vỡ bố cục ở hàng nhập thuộc tính biến thể. Ngoài ra, nhiều nhãn, nút, trạng thái, thông báo và validation trên giao diện vẫn dùng tiếng Anh, không phù hợp với người dùng Việt Nam.

## Solution

Thiết lập phiên đăng nhập gồm Access Token JWT ngắn hạn trong bộ nhớ frontend và Refresh Token opaque dài hạn trong cookie HttpOnly. Refresh Token được xoay vòng theo một Refresh Token Family, lưu dưới dạng hash để hỗ trợ đăng xuất, thu hồi phiên và phát hiện replay. Frontend tự khôi phục phiên khi khởi động, tự refresh một lần khi Access Token hết hạn và chỉ chuyển người dùng về đăng nhập khi refresh thất bại.

Chuẩn hóa lỗi đánh giá Promotion thành các mã lỗi nghiệp vụ với HTTP 400. Frontend ánh xạ các mã này thành toast tiếng Việt, ví dụ “Mã giảm giá không tồn tại”, “Mã giảm giá đã hết hạn sử dụng” và “Mã giảm giá đã hết lượt sử dụng”, thay vì hiển thị thông báo thô từ backend.

Điều chỉnh hàng nhập Variant theo lưới responsive để các ô SKU, giá và thuộc tính không bị co, tràn hoặc che khuất. Việt hóa toàn bộ chuỗi tĩnh hướng tới người dùng trên các màn hình xác thực, quản trị, POS, đơn hàng, kho, khuyến mãi, khách hàng và nhật ký hoạt động; các giá trị dữ liệu do người dùng tạo, SKU và mã kỹ thuật vẫn được giữ nguyên.

## User Stories

1. As a cashier, I want my phiên đăng nhập được duy trì khi Access Token hết hạn, so that tôi không bị gián đoạn khi đang bán hàng.
2. As a user, I want the application to restore my session after a page reload, so that tôi không phải đăng nhập lại trong thời gian Refresh Token còn hiệu lực.
3. As a security-conscious operator, I want the long-lived Refresh Token hidden from JavaScript, so that credential dài hạn không nằm trong localStorage.
4. As a user, I want logout to revoke my refresh session, so that phiên đăng nhập không thể tiếp tục được dùng sau khi đăng xuất.
5. As a system owner, I want reused or revoked refresh tokens to revoke their token family, so that replay của credential bị vô hiệu hóa trên toàn bộ phiên liên quan.
6. As a user, I want an unauthenticated request to return a clear authentication failure, so that giao diện có thể đưa tôi về màn hình đăng nhập đúng lúc.
7. As an administrator, I want authorization failures to remain distinct from authentication failures, so that kiểm soát quyền theo vai trò không bị che lấp bởi cơ chế refresh.
8. As a cashier, I want a nonexistent coupon code to show a Vietnamese toast, so that tôi biết ngay cần kiểm tra lại mã.
9. As a cashier, I want an expired coupon code to show a Vietnamese toast, so that tôi hiểu mã không còn trong thời gian áp dụng.
10. As a cashier, I want an exhausted coupon code to show a Vietnamese toast, so that tôi biết mã đã đạt giới hạn sử dụng.
11. As a cashier, I want an order below a promotion's minimum value to show a Vietnamese explanation, so that tôi biết cần điều chỉnh giỏ hàng hoặc bỏ mã.
12. As a system owner, I want promotion evaluation errors to have stable business codes, so that frontend behavior does not depend on backend prose.
13. As a store manager, I want every Variant input in the Item form to remain visible and usable at desktop and narrow widths, so that tôi có thể khai báo SKU, giá và Dynamic Attributes without layout breakage.
14. As a store manager, I want validation and field labels in Vietnamese, so that tôi có thể hoàn thành form mà không cần suy đoán thuật ngữ tiếng Anh.
15. As a cashier, I want POS actions, order states, payment states, and toast messages in Vietnamese, so that thao tác tại quầy nhanh và nhất quán.
16. As an administrator, I want management pages, navigation, modal actions, filters, and audit-log labels in Vietnamese, so that toàn bộ giao diện phục vụ đúng nhóm người dùng mục tiêu.
17. As a system owner, I want technical identifiers and user-created values to remain unchanged, so that SKU, API data, and audit references remain accurate while presentation text is localized.
18. As a maintainer, I want frontend and backend regression checks for these contracts, so that việc nâng cấp phiên, khuyến mãi và bản địa hóa không làm hỏng các flow bán hàng hiện có.

## Implementation Decisions

- **Session model**: Access Token là JWT ngắn hạn, mặc định 15 phút, chỉ nằm trong memory của frontend. Refresh Token là chuỗi opaque ngẫu nhiên, mặc định 7 ngày, nằm trong cookie HttpOnly và không được lưu trong localStorage.
- **Refresh Token persistence**: Backend lưu hash của Refresh Token cùng email người dùng, Refresh Token Family, thời điểm cấp, hết hạn và thu hồi. Mỗi lần refresh thu hồi token cũ và phát hành token mới trong cùng family.
- **Replay handling**: Nếu token đã thu hồi hoặc đã xoay bị dùng lại, toàn bộ Refresh Token Family tương ứng bị thu hồi và request bị từ chối.
- **Cookie policy**: Cookie refresh có các cấu hình Secure, SameSite, Path và thời hạn thông qua application properties để phù hợp với môi trường chạy.
- **Frontend refresh flow**: Axios gửi credential cookie, đính kèm Access Token trong memory, dùng một refresh promise dùng chung để tránh refresh đồng thời, retry request bị 401 một lần, rồi clear session/query cache và redirect về login khi refresh thất bại.
- **Authentication semantics**: Request không có hoặc có Access Token hết hạn nhận 401; người dùng đã xác thực nhưng thiếu quyền vẫn nhận 403. Endpoint refresh và logout được phép đi qua security filter phù hợp.
- **Promotion error contract**: Các lỗi đánh giá Promotion trả HTTP 400 cùng mã nghiệp vụ ổn định. UI ánh xạ mã sang thông báo tiếng Việt và không hiển thị raw backend message cho các lỗi này.
- **Promotion examples**: Hợp đồng bao phủ mã không tồn tại, Promotion không hoạt động, chưa bắt đầu, đã hết hạn, đã hết lượt sử dụng và đơn hàng chưa đạt giá trị tối thiểu. Quy tắc chỉ áp dụng một Promotion tốt nhất vẫn giữ nguyên theo ADR-0003.
- **Variant form layout**: Hàng nhập Variant dùng lưới responsive với các ô có thể co đúng cách, giữ full width trong cột và dành cột riêng cho thao tác xóa. Cấu trúc Variant và Dynamic Attributes vẫn tuân theo ADR-0001 và ADR-0005.
- **Vietnamese UI scope**: Dịch các chuỗi tĩnh hiển thị cho người dùng, bao gồm navigation, tiêu đề, nhãn, nút, modal, filter, status, payment method, validation, loading, empty state và toast. Không dịch SKU, mã Promotion, dữ liệu khách hàng do người dùng nhập, enum/API identifier hoặc nội dung audit cần giữ nguyên.
- **State and API conventions**: Giữ TanStack React Query cho server state, Axios service cho giao tiếp REST và response DTO thô hiện có; không thêm global response wrapper.
- **Documentation status**: Spec và ticket này được lập hồi quy sau khi code đã hoàn thành, không phải là bằng chứng rằng quy trình to-spec/to-tickets đã diễn ra trước commit. Đây là bổ sung tài liệu để khớp lại quyết định, phạm vi và tiêu chí nghiệm thu với phần đã giao.
- **ADR alignment**: Quyết định refresh token thực hiện theo ADR-0007; Variant và Promotion giữ nguyên ADR-0001, ADR-0003 và ADR-0005. Không có xung đột ADR cần mở lại.

## Testing Decisions

- Test phải kiểm tra hành vi bên ngoài: vòng đời session, status code, mã lỗi JSON, toast, bố cục có thể sử dụng và chuỗi hiển thị; không khóa vào tên class, interceptor nội bộ hay chi tiết lưu trữ không tạo ra hành vi observable.
- Backend test seam là service/integration boundary: kiểm tra issue, rotate, revoke, expiry và replay của Refresh Token; kiểm tra hợp đồng 401/403; kiểm tra mã và message của các lỗi đánh giá Promotion.
- Frontend test seam là flow/component/pure-contract boundary: kiểm tra session memory, policy retry sau 401, mapping Promotion error thành toast và factory dữ liệu Variant; các kiểm tra lint/build là regression gate cho toàn bộ chuỗi giao diện. Kiểm thử render trực tiếp ở nhiều viewport vẫn là việc cần bổ sung nếu repo thêm browser test runner.
- Prior art là các integration test hiện có cho authentication, order checkout, promotion evaluation, activity log và dashboard; test unit mới cho RefreshTokenService bổ sung coverage cho vòng đời session.
- Kết quả hồi quy đã ghi nhận: `npm test` (8 test), `npm run lint`, `npm run build`, backend compile, `PromotionEvaluationIntegrationTest`, `RefreshTokenServiceTest` và toàn bộ `mvn test` (88 test) đều đạt; build frontend chỉ còn cảnh báo chunk lớn của Vite.

## Out of Scope

- OAuth, SSO, password reset, quản lý nhiều thiết bị hoặc giao diện quản lý các Refresh Token đang hoạt động.
- Thay thế chiến lược schema `ddl-auto=update` bằng Flyway/Liquibase.
- Dịch dữ liệu do người dùng tạo, SKU, mã Promotion, enum kỹ thuật hoặc nội dung cần giữ nguyên để đối soát.
- Thay đổi quy tắc chọn một Promotion tốt nhất, cho phép cộng dồn Promotion hoặc thay đổi nghiệp vụ quota.
- Redesign toàn bộ design system, PWA/offline-first, hoặc thay đổi các flow bán hàng không liên quan.

## Further Notes

- Cần cấu hình cookie `Secure`/`SameSite` phù hợp khi triển khai production và bảo đảm frontend/backend cùng chính sách credential.
- Thay đổi 401/403 là chủ ý: 401 dành cho session không hợp lệ để frontend refresh hoặc đăng nhập lại; 403 dành cho authorization failure sau khi đã xác thực.
- Tài liệu này được tạo sau commit `0b5b823` theo yêu cầu hồi quy quy trình; các ticket bên dưới phản ánh các vertical slice đã hoàn thành và được đánh dấu đóng.
