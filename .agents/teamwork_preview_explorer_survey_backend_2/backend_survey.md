# Backend Codebase Survey & Architectural Blueprint (Phase 4)

**Milestone**: `phase4-activity-logs-ux-refinement`  
**Working Directory**: `billingsoftware/`  
**Date**: 2026-09-07  
**Build & Test Baseline**: `./mvnw.cmd test` -> 52 tests run, 0 failures, 0 errors, BUILD SUCCESS (Spring Boot 4.1.0, Java 25).

---

## 1. Executive Summary

This survey provides a comprehensive investigation of the backend codebase in `billingsoftware/` to support Phase 4 requirements:
1. **Dashboard Metric**: Verified `DashboardController` and `OrderService`. The backend calculation (`todayOrderCount`) is already implemented and functioning properly; the bug where orders show 0 is purely on the frontend due to property mismatch (`dashboardData.totalOrderCount` vs `dashboardData.todayOrderCount`) and incorrect label ("Total Orders" vs "Today's Orders").
2. **Order History Scalability**: Currently, `OrderController` only provides `GET /orders/latest` returning an unpaginated list. Missing `GET /orders` with Spring Data `Pageable`, search (Order ID, Customer Name, Phone), and payment status filter. A new DTO `OrderPageResponse` and repository query are needed.
3. **Activity Log Subsystem**: No audit logging infrastructure currently exists. Investigated entity schema, security context extraction, all 9 business mutation trigger points, and designed a non-blocking asynchronous event/logging pattern that guarantees core business transactions are never disrupted.
4. **Test & Build Infrastructure**: Baseline confirmed healthy. All 52 integration tests pass against local MySQL (`localhost:3306/billing_app`). Note that in `src/test/resources/application.properties`, `server.servlet.context-path` is blank, meaning `MockMvc` routes in tests do not use `/api/v1.0`.

---

## 2. Item-by-Item Deep Dive Findings

### 2.1 Dashboard Metric (`todayOrderCount`)

#### Code Inspection
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/controller/DashboardController.java`
  - Method: `getDashboardData()` (lines 20-31)
  - Coordinates `orderService.sumSalesByDate(today)`, `orderService.countByOrderDate(today)`, and `orderService.findRecentOrders(5)`.
  - Injects `OrderService` directly; there is **no separate `DashboardService` class**.
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/io/DashboarResponse.java`
  - Note: DTO class and filename have a minor typo (`DashboarResponse` missing final 'd').
  - Fields (lines 14-18):
    ```java
    public class DashboarResponse {
        private Double todaySales;
        private Long todayOrderCount;
        private List<OrderResponse> recentOrders;
    }
    ```
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/repository/OrderEntityRepository.java`
  - Query (lines 21-22):
    ```java
    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE DATE(o.createdAt) = :date")
    Long countByOrderDate(@Param("date") LocalDate date);
    ```
- **File**: `Front-end/src/pages/Dashboard.jsx`
  - Lines 46-49:
    ```jsx
    <h3 className="text-sm font-medium text-slate-500">Total Orders</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">
      {dashboardData.totalOrderCount ?? 0}
    </p>
    ```

#### Finding & Resolution
- **Backend status**: Fully functional. The query accurately counts orders placed today (`DATE(createdAt) = today`) and returns `todayOrderCount`.
- **Root cause of issue 01**: In `Dashboard.jsx`, the card label is "Total Orders" (instead of "Today's Orders") and the value references `dashboardData.totalOrderCount` which is `undefined`. It defaults to `0`.
- **Action for Implementer**: No backend logic changes needed for dashboard metric calculation. Frontend must bind to `dashboardData.todayOrderCount ?? 0` and update the label to "Today's Orders".

---

### 2.2 Order History Scalability & Pagination

#### Current State
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/controller/OrderController.java`
  - Endpoints present:
    - `POST /orders` (line 18)
    - `DELETE /orders/{orderId}` (line 24)
    - `GET /orders/latest` (line 30) -> calls `orderService.getLatestOrders()` which calls `orderEntityRepository.findAllByOrderByCreatedAtDesc()`
    - `GET /orders/{orderId}` (line 35)
  - **No `GET /orders` endpoint currently exists**.
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/entity/OrderEntity.java`
  - Fields for searching/filtering:
    - `orderId`: String (stored in column `order_code`, e.g., "ORD17413184...")
    - `customerName`: String
    - `phoneNumber`: String
    - `paymentDetails`: `@Embedded PaymentDetails`
    - `createdAt`: `LocalDateTime`
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/io/PaymentDetails.java`
  - Status enum definition (lines 29-31):
    ```java
    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED
    }
    ```
  - **Important Note**: Spec mentions `CANCELLED`. In `PaymentDetails.PaymentStatus`, the current enum values are `PENDING, COMPLETED, FAILED`. The implementer should add `CANCELLED` to `PaymentStatus` (or map `CANCELLED` to `FAILED`) to ensure compatibility with frontend filter selections without breaking existing records.

#### Required Architecture & Changes
1. **New DTO: `OrderPageResponse.java`**
   - Location: `billingsoftware/src/main/java/learn/java/billingsoftware/io/OrderPageResponse.java`
   - Following `CONTEXT.md` raw DTO pattern:
     ```java
     package learn.java.billingsoftware.io;

     import lombok.AllArgsConstructor;
     import lombok.Builder;
     import lombok.Data;
     import lombok.NoArgsConstructor;

     import java.util.List;

     @Data
     @Builder
     @NoArgsConstructor
     @AllArgsConstructor
     public class OrderPageResponse {
         private List<OrderResponse> content;
         private long totalElements;
         private int totalPages;
         private int currentPage;
         private int pageSize;
     }
     ```
2. **Repository Enhancement: `OrderEntityRepository.java`**
   - Add query supporting `Pageable` with optional search (matching `orderId`, `customerName`, `phoneNumber`) and optional payment status filter:
     ```java
     @Query("SELECT o FROM OrderEntity o WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            " LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " o.phoneNumber LIKE CONCAT('%', :search, '%')) AND " +
            "(:status IS NULL OR o.paymentDetails.status = :status)")
     Page<OrderEntity> findOrdersWithFilter(
             @Param("search") String search,
             @Param("status") PaymentDetails.PaymentStatus status,
             Pageable pageable);
     ```
3. **Service Interface & Implementation**:
   - `OrderService.java`:
     ```java
     OrderPageResponse getOrdersPaginated(Pageable pageable, String search, String status);
     ```
   - `OrderServiceImpl.java`:
     Parse `status` into `PaymentDetails.PaymentStatus` safely (handling null/blank and invalid values), call repository, map entities to `OrderResponse` via existing `convertToResponse`, and wrap in `OrderPageResponse`.
4. **Controller Endpoint: `OrderController.java`**:
   ```java
   @GetMapping
   public OrderPageResponse getOrders(
           @RequestParam(defaultValue = "0") int page,
           @RequestParam(defaultValue = "10") int size,
           @RequestParam(required = false) String search,
           @RequestParam(required = false) String status) {
       Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
       return orderService.getOrdersPaginated(pageable, search, status);
   }
   ```

---

### 2.3 Activity Log Subsystem (Audit Trail)

#### Entity Model Design
- **Table Name**: `tbl_activity_logs`
- **Entity**: `ActivityLogEntity.java` in `learn.java.billingsoftware.entity`
- **Fields**:
  - `id`: `Long` (`@Id`, `@GeneratedValue(strategy = GenerationType.IDENTITY)`)
  - `logId`: `String` (`@Column(unique = true, nullable = false)`) — UUID
  - `userEmail`: `String` (`@Column(nullable = false)`)
  - `actionType`: `String` or Enum (`LOGIN`, `CREATE`, `UPDATE`, `DELETE`)
  - `entityType`: `String` or Enum (`ORDER`, `ITEM`, `CATEGORY`, `USER`, `CUSTOMER`, `PROMOTION`, `MODIFIER`, `INVENTORY`)
  - `entityId`: `String` (`@Column(nullable = true)`)
  - `description`: `String` (`@Column(length = 1000)`)
  - `createdAt`: `LocalDateTime` (`@CreationTimestamp` or set in `@PrePersist`)

#### Repository: `ActivityLogRepository.java`
- Must support Spring Data `JpaRepository<ActivityLogEntity, Long>` and `JpaSpecificationExecutor<ActivityLogEntity>` or custom `@Query`:
  - Lọc theo:
    - `userEmail` (bắt buộc đối với Staff/`ROLE_USER`, tùy chọn đối với Admin/`ROLE_ADMIN`)
    - `actionType` (tùy chọn)
    - Date range: `startDate` & `endDate` (`createdAt BETWEEN :startDate AND :endDate`)
  - Phân trang qua `Pageable`, sắp xếp mặc định `createdAt DESC`.

#### DTOs:
- `ActivityLogResponse.java`:
  - `logId`, `userEmail`, `actionType`, `entityType`, `entityId`, `description`, `createdAt`.
- `ActivityLogPageResponse.java`:
  - `content` (`List<ActivityLogResponse>`), `totalElements`, `totalPages`, `currentPage`, `pageSize`.

#### Security & Authentication Mechanism
- **How User Email and Roles are Stored & Retrieved**:
  - `JwtRequestFilter` sets:
    ```java
    UsernamePasswordAuthenticationToken authenticationToken =
        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    ```
  - `userDetails.getUsername()` contains the **email**.
  - `userDetails.getAuthorities()` contains `SimpleGrantedAuthority("ROLE_USER")` or `SimpleGrantedAuthority("ROLE_ADMIN")`.
  - Helper to get current authenticated user:
    ```java
    public static String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "system";
    }

    public static boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
    }
    ```
- **Access Control for `GET /api/v1.0/activity-logs`**:
  - `SecurityConfig.java`:
    Add `.requestMatchers("/activity-logs", "/activity-logs/**").hasAnyRole("USER", "ADMIN")`
  - In `ActivityLogController`:
    - Check role:
      - If user is NOT admin: enforce `effectiveEmail = currentUserEmail` regardless of what `userEmail` query parameter was passed!
      - If user IS admin: allow passing any `userEmail` (or null for all users).

#### Business Mutation Instrumentation Points
| # | Business Domain | File Path | Method & Line | Action | Entity Type | Details to Capture |
|---|---|---|---|---|---|---|
| 1 | **User Login** | `controller/AuthController.java` | `login()` (line 34) | `LOGIN` | `USER` | Email: `request.getEmail()`, Description: "Người dùng đăng nhập thành công" |
| 2 | **Order Creation** | `service/impl/OrderServiceImpl.java` | `createOrder()` (line 55) | `CREATE` | `ORDER` | Order ID: `newOrder.getOrderId()`, Grand total, Customer name |
| 3 | **Order Deletion** | `service/impl/OrderServiceImpl.java` | `deleteOrder()` (line 296) | `DELETE` | `ORDER` | Order ID: `orderId` |
| 4 | **Item Creation** | `service/impl/ItemServiceImpl.java` | `add()` (line 39) | `CREATE` | `ITEM` | Item ID: `newItem.getItemId()`, Name: `newItem.getName()`, Price |
| 5 | **Item Deletion** | `service/impl/ItemServiceImpl.java` | `deleteItem()` (line 175) | `DELETE` | `ITEM` | Item ID: `id`, Name: `existingItem.getName()` |
| 6 | **Category Creation** | `service/impl/CategoryServiceImpl.java` | `add()` (line 33) | `CREATE` | `CATEGORY` | Category ID: `newCategory.getCategoryId()`, Name: `newCategory.getName()` |
| 7 | **Category Deletion** | `service/impl/CategoryServiceImpl.java` | `delete()` (line 57) | `DELETE` | `CATEGORY` | Category ID: `categoryId`, Name: `existingCategory.getName()` |
| 8 | **User Creation** | `service/impl/UserServiceImpl.java` | `createUser()` (line 24) | `CREATE` | `USER` | User ID: `newUser.getUserId()`, Email: `newUser.getEmail()`, Role |
| 9 | **User Deletion** | `service/impl/UserServiceImpl.java` | `deleteUser()` (line 67) | `DELETE` | `USER` | User ID: `id`, Email: `existingUser.getEmail()` |
| 10 | **Modifier Group Creation** | `service/impl/ModifierGroupServiceImpl.java` | `create()` (line 34) | `CREATE` | `MODIFIER` | Group ID: `saved.getGroupId()`, Name: `saved.getName()` |
| 11 | **Modifier Group Update** | `service/impl/ModifierGroupServiceImpl.java` | `update()` (line 80) | `UPDATE` | `MODIFIER` | Group ID: `groupId`, Name: `entity.getName()` |
| 12 | **Modifier Group Deletion** | `service/impl/ModifierGroupServiceImpl.java` | `delete()` (line 123) | `DELETE` | `MODIFIER` | Group ID: `groupId` |
| 13 | **Customer Creation** | `service/impl/CustomerServiceImpl.java` | `createCustomer()` (line 26) | `CREATE` | `CUSTOMER` | Customer ID: `saved.getCustomerId()`, Name & Phone |
| 14 | **Customer Update** | `service/impl/CustomerServiceImpl.java` | `updateCustomer()` (line 82) | `UPDATE` | `CUSTOMER` | Customer ID: `customerId`, Name & Phone |
| 15 | **Customer Deletion** | `service/impl/CustomerServiceImpl.java` | `deleteCustomer()` (line 106) | `DELETE` | `CUSTOMER` | Customer ID: `customerId` |
| 16 | **Promotion Creation** | `service/impl/PromotionServiceImpl.java` | `createPromotion()` (line 35) | `CREATE` | `PROMOTION` | Promo ID: `saved.getPromotionId()`, Name & Code |
| 17 | **Promotion Update** | `service/impl/PromotionServiceImpl.java` | `updatePromotion()` (line 114) | `UPDATE` | `PROMOTION` | Promo ID: `promotionId`, Name & Code |
| 18 | **Promotion Toggle** | `service/impl/PromotionServiceImpl.java` | `toggleActiveStatus()` (line 169) | `UPDATE` | `PROMOTION` | Promo ID: `promotionId`, Active status |
| 19 | **Promotion Deletion** | `service/impl/PromotionServiceImpl.java` | `deletePromotion()` (line 179) | `DELETE` | `PROMOTION` | Promo ID: `promotionId` |
| 20 | **Inventory Transaction** | `service/impl/InventoryServiceImpl.java` | `recordTransaction()` (line 31) | `UPDATE` | `INVENTORY` | Variant SKU: `variant.getSku()`, Type: `request.getTransactionType()`, Qty |
| 21 | **Inventory Stock Check** | `service/impl/InventoryServiceImpl.java` | `performStockCheck()` (line 78) | `UPDATE` | `INVENTORY` | Variant SKU: `variant.getSku()`, Actual count & Discrepancy |

#### Asynchronous & Non-Blocking Resilience Architecture
- **Constraint**: "Audit logging must run non-blockingly to avoid disrupting primary business transactions" & "Logging calls must catch errors gracefully so audit log failures never break core business transactions."
- **Implementation Strategy**:
  1. Add `@EnableAsync` to `BillingsoftwareApplication.java`.
  2. Implement `ActivityLogService` with `@Async`:
     ```java
     @Async
     public void logActivityAsync(String userEmail, String actionType, String entityType, String entityId, String description) {
         try {
             ActivityLogEntity entity = ActivityLogEntity.builder()
                     .logId(UUID.randomUUID().toString())
                     .userEmail(userEmail != null ? userEmail : "system")
                     .actionType(actionType)
                     .entityType(entityType)
                     .entityId(entityId)
                     .description(description)
                     .createdAt(LocalDateTime.now())
                     .build();
             activityLogRepository.save(entity);
         } catch (Throwable t) {
             log.warn("Failed to persist activity log (non-fatal): {}", t.getMessage());
         }
     }
     ```
  3. **Critical Design Decision regarding `SecurityContext`**:
     Because `@Async` executes on a separate worker thread where `SecurityContextHolder` is not automatically propagated, **the caller must capture `userEmail = SecurityUtils.getCurrentUserEmail()` on the calling request thread** and pass the email string directly into `logActivityAsync`. This completely prevents `NullPointerException` or lost user identity during async logging!

---

## 3. Test Suite & Build Verification

- **Build Tool**: Maven (`./mvnw.cmd`).
- **Java Version**: Java 25 (`<java.version>25</java.version>`).
- **Spring Boot Version**: 4.1.0 (`spring-boot-starter-parent: 4.1.0`).
- **Test Results**:
  - Command: `./mvnw.cmd test`
  - Output: `Tests run: 52, Failures: 0, Errors: 0, Skipped: 0`
  - Build status: **BUILD SUCCESS** in 28.9s.
- **Key Test Characteristics**:
  - Tests use `@SpringBootTest`, `@AutoConfigureMockMvc`, and `@Transactional` (rollback after test).
  - Context path difference: `server.servlet.context-path` is `/api/v1.0` in `main/resources/application.properties`, but empty string in `test/resources/application.properties`. When writing `MockMvc` tests for new endpoints, request paths must be e.g. `mockMvc.perform(get("/activity-logs"))` and `mockMvc.perform(get("/orders"))` (WITHOUT `/api/v1.0` prefix).
  - Authentication in tests: `@WithMockUser(username = "admin", roles = {"ADMIN"})` or `.with(user("cashier").roles("USER"))`.

---

## 4. Proposed Implementation Plan & File Manifest

| File | Status | Description |
|---|---|---|
| `io/OrderPageResponse.java` | NEW | Paginated order response DTO |
| `repository/OrderEntityRepository.java` | MODIFY | Add `findOrdersWithFilter` with `Pageable`, search, status |
| `service/OrderService.java` | MODIFY | Add `getOrdersPaginated` signature |
| `service/impl/OrderServiceImpl.java` | MODIFY | Implement `getOrdersPaginated` |
| `controller/OrderController.java` | MODIFY | Add `GET /orders` endpoint |
| `entity/ActivityLogEntity.java` | NEW | JPA Entity for `tbl_activity_logs` |
| `repository/ActivityLogRepository.java` | NEW | JPA Repository for Activity Logs with date/user/action filters |
| `io/ActivityLogResponse.java` | NEW | DTO for single activity log item |
| `io/ActivityLogPageResponse.java` | NEW | DTO for paginated activity logs |
| `service/ActivityLogService.java` | NEW | Service interface for audit logging & retrieval |
| `service/impl/ActivityLogServiceImpl.java` | NEW | Implementation with `@Async` log writer & safe error swallowing |
| `controller/ActivityLogController.java` | NEW | REST controller `GET /activity-logs` with role-based restriction |
| `BillingsoftwareApplication.java` | MODIFY | Add `@EnableAsync` annotation |
| `config/SecurityConfig.java` | MODIFY | Add route permissions for `/activity-logs/**` |
| Mutation points (Controllers/Services) | MODIFY | Call `activityLogService.logActivityAsync(...)` at mutation sites |
| `src/test/java/.../OrderPaginationIntegrationTest.java` | NEW | Integration test for order search & pagination |
| `src/test/java/.../ActivityLogIntegrationTest.java` | NEW | Integration test for activity logging, role filtering, pagination |
