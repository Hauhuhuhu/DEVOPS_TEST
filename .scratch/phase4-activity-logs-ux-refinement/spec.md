# Spec: Activity Logs & Full UX Refinement (Phase 4)

Status: completed

---

## Problem Statement

Hệ thống quản lý bán hàng (Billing App) hiện đang gặp phải 5 vấn đề về trải nghiệm người dùng, giám sát vận hành và hiệu năng dữ liệu:

1. **Thiếu khả năng giám sát hoạt động người dùng (Activity Log / Audit Trail)**: Nút "Activity Log" trong menu profile của người dùng trên thanh điều hướng không có chức năng; backend chưa có cơ chế lưu trữ lịch sử thao tác quan trọng (đăng nhập, tạo đơn hàng, chỉnh sửa danh mục/sản phẩm/khuyến mãi/tồn kho). Quản trị viên không thể theo dõi nhân viên đã làm gì, vào thời điểm nào.
2. **Trải nghiệm báo lỗi form không đồng nhất**: Các form nhập liệu trong hệ thống sử dụng các cách xử lý lỗi khác nhau (có form chỉ bắn toast mà không báo đỏ tại ô nhập, có form chỉ bôi đỏ mà không có thông báo, có form dùng `useState` thông thường không kiểm soát được lỗi hợp lệ), khiến người dùng bối rối khi nhập sai thông tin.
3. **Hộp thoại xác nhận xóa thô sơ và không an toàn**: Khi xóa bản ghi (sản phẩm, danh mục, nhân viên, khách hàng, khuyến mãi), hệ thống đang dùng hộp thoại `window.confirm` mặc định của trình duyệt, giao diện thiếu tính thẩm mỹ, không thể hiện rõ thông tin đối tượng sắp bị xóa, và không ngăn chặn được việc nhấn liên tiếp khi mạng chậm.
4. **Số liệu Total Orders trên Dashboard bị hiển thị sai (luôn bằng 0)**: Thẻ số liệu "Total Orders" trên bảng điều khiển không liên kết đúng với dữ liệu trả về từ backend, gây hiểu nhầm về hoạt động kinh doanh trong ngày.
5. **Trang Lịch sử đơn hàng (Order History) không đáp ứng dữ liệu lớn**: Backend tải toàn bộ đơn hàng vào bộ nhớ và gửi về client mà không phân trang; giao diện frontend làm cuộn toàn bộ trang thay vì cuộn nội bộ trong bảng, khiến tiêu đề bảng (`thead`) không giữ cố định được (`sticky`), gây khó khăn khi xem và tìm kiếm đơn hàng.

---

## Solution

Triển khai giải pháp toàn diện cho cả 5 hạng mục theo các quyết định kỹ thuật đã thống nhất:

1. **Activity Log System**:
   - Backend: Xây dựng thực thể và dịch vụ lưu trữ nhật ký hoạt động người dùng (Audit Log) ghi nhận các sự kiện chính (Đăng nhập, Tạo đơn hàng, Thao tác quản lý Items, Categories, Users, Modifiers, Promotions, Customers, Inventory). Cung cấp API phân trang và lọc theo thời gian, loại hành động và người dùng.
   - Frontend: Xây dựng trang `/activity-logs` liên kết trực tiếp từ nút "Activity Log" trong profile dropdown, cho phép lọc theo ngày/tháng/khoảng thời gian linh hoạt và loại hành động.
2. **Chuẩn hóa Form Validation**:
   - Đồng bộ 100% các form trong dự án sang `react-hook-form`.
   - Khi có lỗi submit: `react-hot-toast` hiển thị thông báo nhắc nhở ngắn gọn, đồng thời mọi trường bị lỗi lập tức đổi viền đỏ cảnh báo và hiển thị thông điệp lỗi cụ thể ngay dưới ô nhập liệu.
3. **Modal xác nhận xóa chuyên nghiệp**:
   - Xây dựng component `ConfirmDeleteModal` chuẩn hóa dựa trên nền tảng Modal chung của hệ thống.
   - Thay thế toàn bộ 6 vị trí đang dùng `window.confirm`, hiển thị tên thực thể cần xóa, biểu tượng cảnh báo nguy hiểm, nút Hủy và nút Xóa kèm trạng thái chờ xử lý (loading).
4. **Sửa lỗi Dashboard**:
   - Chỉnh sửa thẻ thống kê thành **"Today's Orders"** đi kèm với "Today's Sales" và liên kết chính xác với trường dữ liệu số lượng đơn hàng trong ngày từ backend.
5. **Cải tiến chuyên nghiệp trang Order History**:
   - Backend: Cung cấp API phân trang dữ liệu đơn hàng (`Pageable`) kèm tìm kiếm và lọc trạng thái.
   - Frontend: Đặt bảng trong khung nhìn cố định, cuộn nội bộ với thanh cuộn nằm trong bảng và tiêu đề bảng (`thead`) giữ cố định (`sticky top-0`). Trang bị thanh tìm kiếm, bộ lọc trạng thái và thanh điều khiển phân trang đầy đủ (Previous, Next, số trang, tùy chọn số lượng mỗi trang).

---

## User Stories

### Activity Logs
1. As an Admin, I want to view all user activity logs across the entire system, so that I can audit staff actions and maintain security.
2. As an Admin, I want to filter activity logs by a specific user or staff email, so that I can inspect the actions performed by a particular person.
3. As an Admin, I want to filter activity logs by date ranges (Today, Last 7 Days, Last 30 Days, All time, or Custom Range), so that I can quickly investigate incidents in specific time windows.
4. As an Admin, I want to filter activity logs by action types (e.g., LOGIN, ORDER, ITEM, CATEGORY, INVENTORY), so that I can focus on specific business events.
5. As a Staff user, I want to view my own activity logs from my profile menu, so that I can verify my recent actions and submitted orders.
6. As any user, I want clicking the "Activity Log" option in the Menubar profile dropdown to navigate directly to the activity logs screen.
7. As a user, I want activity logs to display clear timestamps, badges for action types, and descriptive summaries, so that I can understand what occurred without technical knowledge.
8. As a developer, I want activity logging to execute asynchronously without blocking critical transactions or slowing down user operations.

### Form Validation UX
9. As a user, when I submit a form with missing or invalid fields, I want a toast notification to appear immediately, so that I am alerted that the submission was rejected.
10. As a user, when validation fails, I want every invalid input field to be highlighted with a red border, so that I can immediately spot which inputs need correction.
11. As a user, when validation fails, I want to see a clear, concise error message directly beneath each invalid input, so that I know exactly how to correct the input.
12. As a user on the Login page, I want invalid email format or empty fields to show red error feedback and a toast alert, so that I can enter valid credentials before submitting.
13. As an Admin creating or editing an Item, I want required fields (Name, Category, Price) to be validated with inline red messages and a toast alert.
14. As an Admin managing Item Variants, I want variant SKU and Base Price to be validated when variants are enabled, showing inline errors if left blank.
15. As an Admin managing Categories, I want missing category names or descriptions to show inline red warnings and a toast alert.
16. As an Admin managing Users, I want user name, email, and password to validate on submit with inline red feedback.
17. As an Admin managing Modifiers, I want group names and modifier names/prices to validate with inline red errors.
18. As an Admin managing Customers, I want phone number and name validations to trigger both a toast alert and inline red field feedback.
19. As an Admin performing stock adjustments, I want quantity and notes to validate before submitting the transaction.

### Delete Confirmation Modal
20. As an Admin, when I click to delete an Item, I want a styled confirmation modal to appear instead of a browser alert, so that the experience feels modern and consistent.
21. As an Admin, I want the delete confirmation modal to clearly state the name of the entity being deleted, so that I do not accidentally delete the wrong record.
22. As an Admin, I want to be able to cancel the deletion by clicking "Cancel" or clicking outside the modal or pressing close.
23. As an Admin, when I confirm deletion, I want the confirm button to show a loading state and be disabled, so that I cannot double-click and submit duplicate delete requests.
24. As an Admin, I want the delete confirmation modal to be used across all 6 management entities (Items, Categories, Users, Customers, Promotions, Modifier Groups).

### Dashboard Metrics
25. As a manager viewing the Dashboard, I want to see "Today's Orders" reflecting the exact number of orders placed today, so that I have accurate real-time business insight.
26. As a user viewing the Dashboard, I want the order count and today's sales to update automatically whenever new orders are completed.

### Order History Overhaul
27. As a user viewing Order History, I want the table to scroll internally within its card container, so that the main browser page does not scroll uncomfortably.
28. As a user viewing Order History, I want the table header to remain sticky at the top while I scroll through orders, so that I always know what each column represents.
29. As a user viewing Order History, I want orders to be paginated from the server, so that opening the page remains fast even when tens of thousands of orders exist in the database.
30. As a user, I want to change the number of orders displayed per page (e.g., 10, 20, 50 orders), so that I can control my viewing density.
31. As a user, I want to see the total number of orders and current page number, and be able to navigate to Next, Previous, or specific pages easily.
32. As a user, I want to search orders by Order ID, Customer Name, or Phone Number, so that I can quickly locate a specific transaction.
33. As a user, I want to filter orders by Payment Status (COMPLETED, PENDING, CANCELLED), so that I can identify unfulfilled or pending transactions.

---

## Implementation Decisions

### 1. Activity Log Architecture
- **Schema & Persistence**: A new relational table `tbl_activity_logs` is created with auto-increment ID, UUID log ID, user email, action type (`LOGIN`, `CREATE`, `UPDATE`, `DELETE`), target entity type (`ORDER`, `ITEM`, `CATEGORY`, `USER`, `CUSTOMER`, `PROMOTION`, `MODIFIER`, `INVENTORY`), target entity ID, human-readable description, and creation timestamp.
- **Asynchronous Execution**: Log entries are written using an asynchronous publisher/listener pattern or dedicated logging service with non-blocking error handling to ensure audit logging never disrupts core business operations.
- **Access Control & API**: The endpoint `GET /activity-logs` checks authentication. Non-admin users are strictly restricted to querying logs matching their own authenticated email. Admin users can query all logs or filter by target email, date range, and action type.
- **Frontend Presentation**: A dedicated page is created at `/activity-logs`, wrapped with navigation guards. Filtering includes preset buttons (Today, Last 7 Days, Last 30 Days, All) and action category selectors.

### 2. Form Validation Standardization
- **Standardized Error Feedback Pattern**: All forms across the application are migrated to use `react-hook-form`. Forms register inputs with validation rules.
- **Dual-Action Error Notification**:
  - `onError` callback displays a concise `react-hot-toast` message to alert the user.
  - Form state `errors` is destructured and applied to input styles: an active error condition adds `border-red-500 focus:ring-red-500 bg-red-50/10` and renders `<p className="text-xs text-red-600 mt-1">{errors[name].message}</p>`.
- **Form Migration Scope**: `LoginForm`, `CategoryForm`, `ItemForm`, `UserForm`, `ModifierGroupForm`, `ManageCustomers`, `ManagePromotions`, and `StockOperationModal`.

### 3. Unified Delete Confirmation Modal
- **Component Architecture**: A reusable `ConfirmDeleteModal` is built on top of the existing compound `Modal` component or rendered as a portal modal.
- **Props Interface**: Accepts `isOpen`, `onClose`, `onConfirm`, `title`, `message`, and `isLoading`.
- **Styling**: Features an alert danger theme (red accent icon, clear warning message, cancel button, and red destructive confirmation button with spinner during deletion).
- **Adoption**: Replaces `window.confirm` in all 6 list components: `Item`, `CategoryListItem`, `UserItem`, `ManageCustomers`, `ManagePromotions`, and `ModifierGroupList`.

### 4. Dashboard Metrics Fix
- **Metric Labeling**: The card label in Dashboard is updated to **"Today's Orders"**.
- **Data Binding**: The component binds to `dashboardData.todayOrderCount ?? 0` matching the existing backend response DTO.

### 5. Order History Server-side Pagination & Internal Scroll
- **Backend API**: The order endpoint supports Spring Data `Pageable` parameters (`page`, `size`, `sort`) and optional query filters (`search`, `status`). Returns a paginated DTO containing `content`, `totalElements`, `totalPages`, `currentPage`, and `pageSize`.
- **Scroll Container**: The table wrapper is styled with a fixed maximum height and `overflow-y-auto`. The table header `thead` has `sticky top-0 z-10 bg-slate-50` with border separation.
- **Pagination Toolbar**: Renders at the bottom of the table card with page info, page size dropdown (10, 20, 50), and pagination controls.

---

## Testing Decisions

### What Makes a Good Test
Tests must evaluate **external observable behaviors and contracts**, rather than internal state:
- Backend: Endpoint contracts (status codes, pagination metadata structure, filter accuracy, role-based authorization).
- Frontend: Form validation triggering visible error classes and toast messages, modal visibility on delete button click, page navigation on pagination click.

### Modules to Test
1. **Activity Log API**: Verify `GET /activity-logs` returns paginated results and enforces role restriction (Staff cannot query other users' logs).
2. **Order Pagination API**: Verify `GET /orders` returns expected page slices, total counts, and respects search filters.
3. **Dashboard API**: Verify `GET /dashboard` returns accurate `todayOrderCount`.
4. **Frontend Form Validation**: Verify invalid submissions prevent API calls and trigger error feedback.
5. **Confirm Delete Modal**: Verify clicking delete opens the modal and confirming triggers the delete mutation.

### Prior Art
- Spring Boot test suite using `spring-boot-starter-test` and `MockMvc`.
- Frontend build and lint verification via Vite and ESLint.

---

## Out of Scope
- Exporting Activity Logs or Orders to Excel/CSV.
- Real-time WebSockets for activity log push notifications.
- Database schema migration tools (Flyway/Liquibase) — noted in Technical Debt.
- Re-architecting JWT storage into HttpOnly cookies — deferred to security phase.

---

## Further Notes
- `CONTEXT.md` has been updated with the domain definition of `ActivityLog`.
- Existing backend DTO patterns (Raw DTO, no global generic wrapper) are strictly followed for `ActivityLogPageResponse` and `OrderPageResponse`.
- All visual styles strictly follow the existing Tailwind CSS design tokens (Blue-600 primary, Emerald accent, Slate-50 background).
