# CONTEXT.md - Project System Overview

## 1. High-Level Architecture & Tech Stack
- **Monorepo / Multi-folder Structure:**
  - `/Front-end`: Chứa source code giao diện người dùng, cấu trúc dựa trên ReactJS và Vite.
  - `/billingsoftware`: Chứa source code API server, cấu trúc dựa trên Java Spring Boot.
- **Backend Stack:** 
  - **Ngôn ngữ:** Java 25
  - **Framework:** Spring Boot 4.1.0
  - **ORM/Database Driver:** Spring Data JPA / MySQL Connector (mysql-connector-j)
  - **Cổng mặc định:** 8080 (context path: `/api/v1.0`)
  - **Các thư viện khác:** AWS S3 SDK (lưu trữ file), PayOS Java (xử lý thanh toán), JJWT 0.9.1 (cho xác thực).
- **Frontend Stack:** 
  - **Framework/Library:** React 19, Vite
  - **State Management / Data Fetching:** TanStack React Query v5
  - **Styling solution:** Bootstrap 5, Bootstrap Icons
  - **HTTP Client:** Axios
  - **Forms:** React Hook Form
  - **Cổng dev server:** Mặc định của Vite (thường là 5173).
- **Shared / Contract Model:** 
  - Giao tiếp qua **RESTful API** với định dạng JSON.
  - **DTO Sharing:** Không có thư viện chia sẻ type tự động, backend trả về các object DTO (như `ItemResponse`, `OrderResponse`), frontend tự động ánh xạ thông qua các request Axios.
  - **Base URL Frontend:** Trỏ trực tiếp tới backend thông qua biến môi trường `VITE_API_BASE_URL`.

## 2. Developer Workflows & Commands
- **Frontend (`/Front-end`):**
  - Dev mode: `npm run dev`
  - Build code: `npm run build`
  - Lint code: `npm run lint`
- **Backend (`/billingsoftware`):**
  - Dev mode: `./mvnw spring-boot:run`
  - Test suite: `./mvnw test`
  - Build code: `./mvnw clean install` hoặc `./mvnw clean package`
  - Migrate database: Hiện tại hệ thống không dùng tool migration như Flyway/Liquibase, thay vào đó dùng cấu hình JPA auto DDL update (`spring.jpa.hibernate.ddl-auto=update`).

## 3. Core Domain Concepts & Data Models
- **Entities / Aggregates trung tâm:**
  - **User:** Quản lý thông tin đăng nhập, xác thực của nhân viên/quản trị viên hệ thống.
  - **Category:** Danh mục chứa các mặt hàng (ví dụ: Nước uống, Thức ăn).
  - **Item:** Mặt hàng cụ thể trong danh mục, có thông tin giá, hình ảnh (lưu trên AWS S3).
  - **Order:** Hóa đơn/Đơn hàng tổng của khách hàng, liên kết với cổng thanh toán PayOS.
  - **OrderItem:** Chi tiết từng mặt hàng trong một đơn hàng, ánh xạ giữa `Order` và `Item`.
  - **ActivityLog:** Ghi nhận lịch sử hoạt động, thao tác quan trọng (Audit log) của người dùng trong hệ thống (Đăng nhập, Tạo đơn, Thay đổi sản phẩm/danh mục/tồn kho,...).
- **Mối quan hệ cốt lõi:**
  - `Category` 1-N `Item`
  - `Order` 1-N `OrderItem`
  - `OrderItem` N-1 `Item`
  - `User` 1-N `ActivityLog`

## 4. System Invariants & Strict Rules (RẤT QUAN TRỌNG)
- **Auth & Security:** 
  - Dùng **JWT Access Token** ngắn hạn do Spring Security sinh ra; Frontend chỉ giữ Access Token trong memory. Refresh Token dài hạn được backend lưu dưới dạng hash và gửi qua cookie HttpOnly theo ADR-0007.
  - Mọi request từ Frontend được đính kèm header `Authorization: Bearer <token>` thông qua Axios Interceptor (`src/utils/axiosConfig.js`).
- **Error Handling Pattern:** 
  - Backend sử dụng `ResponseStatusException` hoặc subclass/domain handler tương thích để trả HTTP Status code 4xx/5xx; các lỗi nghiệp vụ có thể trả thêm mã lỗi ổn định trong JSON.
  - Frontend tự động bắt lỗi toàn cục 401 qua Axios Interceptor: clear session trong memory, clear cache của TanStack Query và tự động redirect về trang `/login` sau khi refresh thất bại.
- **API Response Wrapping:** 
  - Trả về dữ liệu thô (**Raw DTO/List**), **KHÔNG** dùng wrapper class chung (ví dụ: không có cấu trúc `{ data, status, message }` cố định ở mức global). 
  - Agent cần gọi thẳng `response.data` và lấy array/object JSON trả về từ backend.
- **State Management Pattern (Frontend):** 
  - Fetching, Caching và Server State Sync BẮT BUỘC dùng **TanStack React Query** (`queryClient`). 
  - API call logic được tách riêng ra các file `Service` trong thư mục `src/services/` (VD: `ItemService.js`), sau đó sử dụng trong React Component bằng các custom hooks của React Query (`useQuery`, `useMutation`).

## 5. Known Technical Debt & Fragile Areas
1. **Database Migration Strategy:** Sử dụng `ddl-auto=update` trên production rất nguy hiểm, dễ gây lỗi mất schema/dữ liệu khi refactor cấu trúc DB. (Cần triển khai Flyway hoặc Liquibase).
2. **Cấu hình Refresh Token Cookie:** Cần bảo đảm `Secure`, `SameSite`, `Path` và domain của cookie được cấu hình đúng theo môi trường triển khai; Access Token không được đưa trở lại localStorage.
3. **API Response Standardization:** Việc trả về trực tiếp DTO không qua wrapper có thể gây khó khăn trong tương lai khi cần metadata (như pagination, status messages). Cần chú ý khi mở rộng API mới không làm vỡ logic parse data hiện tại trên FE.
4. **Environment Variables Security:** Config như `AWS_ACCESS`, `PAYOS_API` đang được inject từ `.env`. Cần đảm bảo các file này luôn nằm trong `.gitignore` và không bị vô tình hardcode lên source code trong quá trình thêm tính năng.

## 6. Glossary (Domain Model)

### Authentication & Session

- **Access Token**: JWT ngắn hạn dùng để xác thực từng request tới API.
- **Refresh Token**: Mã phiên dài hạn dùng để cấp lại Access Token khi phiên ngắn hạn hết hạn; không phải thông tin người dùng nhập vào giao diện.
- **Refresh Token Family**: Nhóm các Refresh Token được xoay từ cùng một lần đăng nhập, dùng để phát hiện và thu hồi phiên khi token cũ bị dùng lại.

- **Coupon Code**: Mã do người dùng nhập để yêu cầu áp dụng một Promotion kiểu COUPON cho Order; hệ thống chỉ áp dụng một Promotion tốt nhất và không cộng dồn.

- **Item**: Sản phẩm cha (VD: Áo thun, Trà sữa). Không trực tiếp chứa tồn kho nếu có nhiều biến thể.
- **Variant (SKU)**: Biến thể vật lý của một Item (VD: Áo màu Đỏ size L). Có mã SKU riêng và là đơn vị quản lý tồn kho. Các thuộc tính biến thể (Màu, Size, v.v.) được lưu linh hoạt dưới dạng **Dynamic Attributes (JSON)**.
- **Modifier / ModifierGroup**: Tuỳ chọn thêm (VD: Topping trân châu, Lượng đường). Không có tồn kho, chỉ làm thay đổi giá bán hoặc ghi chú chế biến. Khi order, giá Modifier được tách biệt với giá base của Variant để in hóa đơn chi tiết.
- **InventoryTransaction (Ledger Inventory)**: Sổ cái ghi nhận mọi biến động tồn kho (IN/OUT/ADJUSTMENT) như Nhập kho, Xuất bán, Kiểm kê. Tồn kho hiện tại của một Variant được tính toán On-the-fly hoặc Cached từ tổng các giao dịch này.
- **Negative Stock**: Tình trạng tồn kho ảo bị âm do bán hàng Offline (khi thiết bị không có mạng để check tồn kho thực tế). Chấp nhận bán để không làm gián đoạn doanh thu.
- **Promotion**: Chương trình khuyến mãi. Hệ thống tự động chọn 1 Promotion tốt nhất cho hoá đơn, KHÔNG cho phép xếp chồng (stacking) nhiều khuyến mãi.
- **ActivityLog**: Bản ghi nhật ký hoạt động (Audit Trail) ghi nhận ai (user/email), làm gì (action: LOGIN, CREATE, UPDATE, DELETE), trên thực thể nào (Category, Item, Order, Customer, Promotion, Variant/Inventory), vào thời điểm nào (timestamp) và ghi chú tóm tắt.
- **Order Cancellation**: Quy trình hủy đơn hàng đang ở trạng thái chờ (PENDING) hoặc lỗi thanh toán, bắt buộc thực hiện giao dịch bù trừ kho (Compensating Ledger Transaction - IN), hoàn lại lượt dùng mã khuyến mãi, điều chỉnh lại chỉ số CRM của khách hàng và hủy Payment Link trên cổng PayOS (ADR 0006).
- **Switch Payment Method**: Quy trình chuyển đổi phương thức thanh toán trực tiếp tại quầy từ đơn PENDING (PayOS QR) sang Tiền mặt (CASH), chuyển trạng thái sang COMPLETED và hủy link PayOS mà không tạo mới đơn hay nhân đôi xuất kho (ADR 0006).
