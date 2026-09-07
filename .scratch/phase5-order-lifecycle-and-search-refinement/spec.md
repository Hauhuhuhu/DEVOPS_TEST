# Spec: Order History Smooth Search & In-Flight QR Order Lifecycle (Phase 5)

Status: ready-for-agent

---

## Problem Statement

Hệ thống thanh toán và quản trị đơn hàng (Billing POS) hiện đang gặp hai vấn đề nghiêm trọng ảnh hưởng trực tiếp đến trải nghiệm của thu ngân và tính toàn vẹn của dữ liệu:

1. **Giật khung hình và chớp nháy toàn trang khi tìm kiếm trên Order History**:
   Tại màn hình Lịch sử đơn hàng, mỗi khi người dùng gõ từ khóa tìm kiếm (mã đơn hàng, tên khách, số điện thoại) hoặc xóa tìm kiếm, giao diện bị hủy bỏ hoàn toàn (unmount) và thay thế bằng Spinner toàn màn hình trong 200-400ms trước khi hiển thị lại bảng. Hiện tượng này gây giật khung hình ("chớp/lag"), làm mất trạng thái focus của ô nhập liệu và tạo cảm giác ứng dụng bị đơ giật.

2. **Bế tắc nghiệp vụ khi khách hàng muốn đổi phương thức thanh toán hoặc hủy đơn tại bước quét mã QR**:
   Khi thu ngân chọn phương thức Chuyển khoản (PayOS), hệ thống đã lập tức tạo một đơn hàng ở trạng thái `PENDING`, trừ tồn kho ngay lập tức (`OUT`), tăng số lượt sử dụng khuyến mãi và tạo link thanh toán PayOS. Nếu khách hàng đổi ý muốn chuyển sang trả Tiền mặt (do lỗi mạng, lỗi ngân hàng) hoặc muốn hủy đơn hàng:
   - Thu ngân không có nút thao tác để chuyển đổi phương thức hoặc hủy đơn ngay trên màn hình QR.
   - Nếu đóng modal và chọn thanh toán Tiền mặt, hệ thống sẽ tạo một đơn hàng mới toanh, dẫn đến đơn hàng cũ bị bỏ rơi ở trạng thái `PENDING`, hàng tồn kho bị trừ gấp đôi và mã giảm giá bị tiêu tốn lãng phí.
   - Nếu khách hàng hủy mua hàng, đơn hàng PENDING vẫn tồn tại, hàng hóa không được hoàn trả vào kho, và link thanh toán PayOS vẫn còn mở dẫn đến nguy cơ khách quét nhầm sau đó.

---

## Solution

Triển khai giải pháp toàn diện cho cả hai bài toán theo các nguyên tắc thiết kế và chuẩn mực kiến trúc đã thống nhất:

1. **Khắc phục triệt để giật khung hình tại Order History**:
   - Sử dụng cơ chế giữ dữ liệu phiên trước (`keepPreviousData` / placeholder data) trong hệ thống data fetching của frontend.
   - Loại bỏ logic unmount toàn bộ giao diện bảng khi dữ liệu đang được làm mới. Thay vào đó, giữ nguyên bảng dữ liệu hiện tại, giữ nguyên tiêu đề và ô nhập liệu, chỉ hiển thị chỉ báo tải trạng thái nhẹ (non-blocking fetching indicator) ở góc bảng hoặc overlay mờ.
   - Bổ sung nút thao tác "Hủy đơn" ngay trong bảng danh sách đơn hàng cho các đơn đang ở trạng thái `PENDING` để thu ngân và quản trị viên có thể dọn dẹp các đơn bị treo.

2. **Hoàn thiện vòng đời đơn hàng QR PayOS (In-Flight Order Lifecycle)**:
   - **Chuyển sang tiền mặt trực tiếp (`Switch to Cash`)**:
     - Bổ sung nút "Chuyển sang tiền mặt" nổi bật ngay trên hộp thoại quét mã QR.
     - Cung cấp API cập nhật nguyên tử (atomic) trên chính đơn hàng PENDING hiện tại: chuyển phương thức thành `CASH`, trạng thái thành `COMPLETED`, và hủy liên kết thanh toán trên cổng PayOS.
     - Giữ nguyên tồn kho đã xuất từ trước, không xuất kho lần hai, lập tức mở popup hóa đơn thanh toán thành công và làm mới dữ liệu hệ thống.
   - **Hủy đơn hàng (`Cancel Order`) với cơ chế bù trừ dữ liệu toàn diện**:
     - Bổ sung nút "Hủy đơn hàng" trên hộp thoại quét mã QR kèm hộp thoại xác nhận an toàn.
     - Khi hủy đơn PENDING:
       - Cập nhật trạng thái thanh toán thành `CANCELLED` (không xóa cứng để bảo đảm tính kiểm toán).
       - Phát sinh giao dịch sổ cái tồn kho bù trừ (Compensating Ledger Transaction - loại `IN`) để hoàn trả số lượng hàng vào kho và cập nhật số dư tồn kho cache.
       - Hoàn lại số lượt sử dụng mã khuyến mãi (`timesUsed`) nếu có áp dụng ưu đãi.
       - Trừ lại số lượng đơn và tổng chi tiêu lũy kế của khách hàng trong hệ thống CRM nếu đã ghi nhận.
       - Gọi cổng PayOS để hủy bỏ liên kết thanh toán, vô hiệu hóa mã QR.
       - Ghi nhận nhật ký kiểm toán (Activity Log) cho hành động hủy đơn.

---

## User Stories

### Order History Search & UI Stability
1. As a cashier or admin, when I type characters into the Order History search box, I want the table to update smoothly without the entire screen flashing or remounting, so that I can keep typing without losing focus or experiencing frame drops.
2. As a cashier or admin, while search results are being fetched, I want to see the previous orders dimmed or with a subtle fetching spinner, so that I know the system is actively retrieving the new data.
3. As a cashier or admin, when I clear the search box, I want the full order list to reload seamlessly without screen flicker.
4. As a cashier or admin, when viewing an order with `PENDING` status in the history table, I want to see a distinct "Hủy đơn" action button, so that I can resolve abandoned pending transactions from earlier in the day.
5. As a cashier or admin, when I click "Hủy đơn" on a pending order in the table, I want a confirmation prompt asking for confirmation before the order is cancelled.

### In-Flight Payment Method Switching (QR to Cash)
6. As a cashier at the checkout counter, when a customer attempts to pay via PayOS QR but experiences a banking app glitch, I want to click a single "Chuyển sang tiền mặt" button in the QR modal, so that the transaction can immediately complete with cash.
7. As a cashier, when switching a pending QR order to cash, I want the system to cancel the external PayOS payment link, so that the customer cannot accidentally pay the QR later after handing over cash.
8. As a cashier, when switching to cash, I want the order to retain the same Order ID and all line items, so that our records remain clean and consistent.
9. As a cashier, when switching to cash, I want the system to avoid deducting inventory a second time, so that physical stock counts match the inventory ledger.
10. As a cashier, upon successfully switching to cash, I want the QR modal to close automatically and the receipt printing popup to display immediately, so that I can hand the printed invoice to the customer.

### In-Flight Order Cancellation
11. As a cashier at the checkout counter, if a customer decides not to purchase after the QR code is generated, I want to click a "Hủy đơn hàng" button inside the QR modal, so that the transaction is cleanly aborted.
12. As a cashier, when I click "Hủy đơn hàng" in the QR modal, I want to see a confirmation dialog to prevent accidental cancellations.
13. As an inventory manager, when a pending QR order is cancelled, I want the exact quantities of all reserved items to be restored to stock via an `IN` ledger transaction, so that accurate stock levels are available for other customers.
14. As a marketing manager, when an order with a coupon code is cancelled before completion, I want the promotion's usage count to be decremented, so that the customer or other shoppers can still utilize the discount within its quota.
15. As a store manager, when a registered customer's pending order is cancelled, I want their CRM lifetime spending and order count to be decremented by the cancelled amounts, so that customer loyalty metrics reflect only genuine fulfilled purchases.
16. As a cashier, when a pending order is cancelled, I want the PayOS payment link to be invalidated remotely, preventing any subsequent scan from capturing funds for a cancelled transaction.
17. As an auditor, when an order is cancelled or switched to cash, I want an Activity Log entry recorded with timestamp, operator email, order ID, and clear description, so that all transactional changes are traceable.

---

## Implementation Decisions

### 1. Frontend Data Fetching & Non-Destructive Search
- **TanStack Query Cache Retention**: The order pagination hook must utilize placeholder data retention (`placeholderData: keepPreviousData`). This ensures that changing query keys (due to page index, status filter, or debounced search term) preserves the existing dataset in memory while the next page loads, preventing `data` from dropping to `undefined`.
- **Render Hierarchy Preservation**: The full-page loading spinner must only appear during the very first cold load when no cached orders exist. All subsequent fetches must preserve the DOM structure and display an inline, non-blocking loading state.
- **Order History Cancellation Action**: In the table action column, if an order's status is `PENDING`, a red action button ("Hủy đơn") is rendered alongside the receipt button.

### 2. Order Cancellation Architecture & Ledger Integrity
- **Non-Destructive Status Mutation**: Cancellation mutates `paymentDetails.status` to `CANCELLED`. Hard deletion of orders is strictly forbidden for audit compliance.
- **Compensating Inventory Ledger**: For every item in the cancelled order, an `InventoryTransactionEntity` of type `IN` is appended with a positive quantity corresponding to the sold units, referencing the original order ID. The cached stock quantity on the associated `VariantEntity` is recalculated and synchronized.
- **CRM & Promotion Rollback**:
  - If a promotion ID is present on the order, the promotion's `timesUsed` counter is safely decremented (bounded at zero).
  - If a customer ID is present on the order, the customer's `orderCount` is decremented and `totalSpent` is reduced by the order's grand total (bounded at zero).
- **PayOS Remote Link Cancellation**: For orders originating as `PAYOS`, the backend invokes `payOS.paymentRequests().cancel(orderCode, cancellationReason)`. The call is protected by a graceful exception handler so that network glitches or pre-expired links do not fail the database cancellation transaction.

### 3. In-Flight Cash Switch Architecture
- **In-Place Atomic Transition**: An endpoint `POST /orders/{orderId}/switch-to-cash` is exposed. It verifies that the order exists and is currently in `PENDING` status.
- **Method & Status Update**: The order's `paymentMethod` is transitioned to `CASH`, and its `paymentDetails.status` is set to `COMPLETED`.
- **Inventory Preservation**: Because inventory was already decremented upon order creation, switching to cash requires no inventory ledger mutations.
- **PayOS Remote Cleanup**: The pending PayOS payment link is cancelled to prevent late payments on the abandoned QR code.

### 4. API Contracts
- `POST /orders/{orderId}/switch-to-cash` -> Returns `OrderResponse` with `paymentMethod = CASH` and `status = COMPLETED`.
- `POST /orders/{orderId}/cancel` -> Returns `OrderResponse` with `status = CANCELLED`.

---

## Testing Decisions

### Test Quality Principles
- Test external system behaviors rather than internal implementation details.
- Validate that inventory balances before and after operations strictly conform to ledger calculations.
- Validate that customer metrics and promotion usage quotas reflect accurate post-cancellation counts.

### Test Seams
1. **Backend Integration Seam (`OrderController` & `OrderService`)**:
   - **Primary Seam**: High-level integration test using `@SpringBootTest` / `MockMvc` on the `/orders` endpoints.
   - **Switch to Cash Scenario**: Create an order with `PAYOS`, call `POST /orders/{orderId}/switch-to-cash`, assert HTTP 200, verify DB state is `CASH` + `COMPLETED`, verify no extra inventory transactions were created.
   - **Order Cancellation Scenario**: Create an order with `PAYOS` and a promotion coupon, call `POST /orders/{orderId}/cancel`, assert HTTP 200, verify DB state is `CANCELLED`, verify a compensating `IN` inventory transaction exists, verify variant stock returned to original count, and verify promotion `timesUsed` returned to original count.
2. **Frontend Component & Query Seam**:
   - Verify `useOrders` maintains data continuity during search input changes.
   - Verify modal actions in `PaymentQRCode` dispatch `switchToCash` and `cancelOrder` and transition the UI correctly.

### Prior Art
- `OrderCheckoutIntegrationTest.java`: Existing integration test validating order creation, PayOS checkout flow, and inventory deductions.

---

## Out of Scope
- Automatic scheduled cron jobs to expire orphaned pending orders after a timeout (deferred to future operational phases).
- Partial order cancellation or item-level returns (handled as a separate returns/refunds feature).
- Online customer portal order cancellations (this feature is strictly POS counter and cashier management).

---

## Further Notes
- Architectural decision record: [ADR 0006: In-Flight QR Order Lifecycle and Cancellation Management](file:///e:/Learn%20JavaSpringBoot%20with%20ReactJs/Billing-app/docs/adr/0006-in-flight-qr-order-lifecycle.md).
- Domain terms registered in [CONTEXT.md](file:///e:/Learn%20JavaSpringBoot%20with%20ReactJs/Billing-app/CONTEXT.md#L78-L80).
