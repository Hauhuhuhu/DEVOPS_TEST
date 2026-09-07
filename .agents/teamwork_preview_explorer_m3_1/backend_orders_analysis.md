# Backend Order History Scalability Analysis (Features 17-20)

**Author**: `teamwork_preview_explorer_m3_1`  
**Date**: 2026-09-07  
**Scope**: Milestone 3 - Order History Scalability & Table Experience (Backend Engine)  
**Target Files**:
- `billingsoftware/src/main/java/learn/java/billingsoftware/io/OrderPageResponse.java` (NEW)
- `billingsoftware/src/main/java/learn/java/billingsoftware/io/PaymentDetails.java` (MODIFY)
- `billingsoftware/src/main/java/learn/java/billingsoftware/repository/OrderEntityRepository.java` (MODIFY)
- `billingsoftware/src/main/java/learn/java/billingsoftware/service/OrderService.java` (MODIFY)
- `billingsoftware/src/main/java/learn/java/billingsoftware/service/impl/OrderServiceImpl.java` (MODIFY)
- `billingsoftware/src/main/java/learn/java/billingsoftware/controller/OrderController.java` (MODIFY)

---

## 1. Executive Summary

In Phase 4 Milestone 3 (Requirement R5), the Order History feature must transition from a non-scalable full-table fetch (`/orders/latest` returning all orders) to an enterprise-grade, server-side paginated API with search across order ID, customer name, and customer phone number, and status filtering.

The integration test suite `OrderPaginationIntegrationTest.java` was already formulated to enforce these requirements. When executed against the baseline codebase (`mvnw.cmd test -Dtest=OrderPaginationIntegrationTest`), **10 of 11 tests failed with HTTP 405 Method Not Allowed** because `OrderController` lacks a `GET /orders` endpoint handler. Furthermore, `OrderPageResponse` does not exist, `PaymentDetails.PaymentStatus` omits `CANCELLED`, and `OrderEntityRepository` lacks a paginated search/filter query.

This document formulates the complete architectural design and production-ready code for the implementer agent.

---

## 2. Baseline Codebase Inspection & Observations

### 2.1. Integration Test Baseline
- **File**: `billingsoftware/src/test/java/learn/java/billingsoftware/OrderPaginationIntegrationTest.java`
- **Observations**:
  - Line 96-98: `GET /orders` without authentication expects HTTP 403 Forbidden. (Passed baseline).
  - Line 103-113 (`testDefaultPaginationReturnsFirstPage`): `GET /orders` with `ROLE_USER` returns 200 OK with JSON structure:
    - `content` (Array of `OrderResponse`)
    - `totalElements` (long >= 3)
    - `totalPages` (int >= 1)
    - `currentPage` (int = 0)
    - `pageSize` (int = 10)
  - Line 118-128 (`testCustomPageAndSizePagination`): `GET /orders?page=0&size=2` returns 2 items in `content`, `currentPage: 0`, `pageSize: 2`, `totalPages >= 2`.
  - Line 134-141 (`testSearchFilterByOrderId`): `GET /orders?search=ORD-ALPHA-...` filters by order code.
  - Line 146-153 (`testSearchFilterByCustomerName`): `GET /orders?search=Beta Tran` filters by customer name (case-insensitive substring).
  - Line 158-165 (`testSearchFilterByPhoneNumber`): `GET /orders?search=0933000003` filters by phone number substring.
  - Line 170-176 (`testFilterByPaymentStatusCompleted`): `GET /orders?status=COMPLETED` returns orders with `paymentDetails.status == "COMPLETED"`.
  - Line 181-187 (`testFilterByPaymentStatusPending`): `GET /orders?status=PENDING` returns orders with `paymentDetails.status == "PENDING"`.
  - Line 192-199 (`testCombinedSearchAndStatusFilter`): `GET /orders?search=Alpha&status=COMPLETED` returns intersection only.
  - Line 204-210 (`testSearchNonMatchingTermReturnsEmptyResult`): Non-matching search returns `content: []`, `totalElements: 0`.
  - Line 215-222 (`testPaginationOutOfBoundsReturnsEmptyContent`): `page=999&size=10` returns `content: []`, `currentPage: 999`.

### 2.2. Controller Inspection
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/controller/OrderController.java`
- **Observations**:
  - Class has `@RequestMapping("/orders")`.
  - Only `@PostMapping` (createOrder), `@DeleteMapping("/{orderId}")` (deleteOrder), `@GetMapping("/latest")` (getLatestOrders), and `@GetMapping("/{orderId}")` (getOrderById) are defined.
  - No root `@GetMapping` exists, causing Spring MVC to return `405 Method Not Allowed` when `GET /orders` is requested.

### 2.3. Service Interface & Implementation Inspection
- **Files**:
  - `billingsoftware/src/main/java/learn/java/billingsoftware/service/OrderService.java`
  - `billingsoftware/src/main/java/learn/java/billingsoftware/service/impl/OrderServiceImpl.java`
- **Observations**:
  - `OrderService` lacks pagination method signature `getOrdersPaginated(...)`.
  - In `OrderServiceImpl.java`, `getLatestOrders()` fetches all records with `findAllByOrderByCreatedAtDesc()` (lines 303-308).
  - `convertToResponse` at line 251 converts `items` by doing `newOrder.getItems().stream()`. If `items` is null, it throws an NPE. Null-safe mapping is recommended.

### 2.4. Repository Inspection
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/repository/OrderEntityRepository.java`
- **Observations**:
  - Contains `findByOrderId(String orderId)`, `findAllByOrderByCreatedAtDesc()`, `sumSalesByDate(...)`, `countByOrderDate(...)`, and `findRecentOrders(Pageable pageable)`.
  - Lacks a query method accepting search keyword, status filter, and `Pageable` to produce `Page<OrderEntity>`.

### 2.5. Domain Model & DTO Inspection
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/io/PaymentDetails.java`
  - Enum `PaymentStatus` at line 29 currently only defines `PENDING, COMPLETED, FAILED`.
  - Missing `CANCELLED` status.
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/entity/OrderEntity.java`
  - `id`: `Long` (Primary Key, auto-increment)
  - `orderId`: `String` (Column `order_code`, unique = true, e.g. `ORD-ALPHA-xxx` or `ORD172570...`)
  - `customerName`: `String`
  - `phoneNumber`: `String`
  - `paymentDetails`: `@Embedded PaymentDetails paymentDetails` containing `status` (`PaymentStatus`)
  - `createdAt`: `LocalDateTime`

---

## 3. Design & Architecture Decision Records (ADR)

### ADR-1: Raw DTO Pattern for Paginated Response
- In conformance with `CONTEXT.md` (System Invariants: "API Response Wrapping: Trả về dữ liệu thô (Raw DTO/List), KHÔNG dùng wrapper class chung { data, status, message }"), `OrderPageResponse` directly contains the payload array and pagination metadata at top level.
- Schema:
  ```json
  {
    "content": [ ... ],
    "totalElements": 42,
    "totalPages": 5,
    "currentPage": 0,
    "pageSize": 10
  }
  ```

### ADR-2: Query Engine Strategy (JPQL vs Specification)
Two complementary approaches are evaluated:
1. **JPQL `@Query` with Spring Data JPA**:
   ```sql
   SELECT o FROM OrderEntity o WHERE
   (:search IS NULL OR :search = '' OR
    LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')) OR
    LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR
    o.phoneNumber LIKE CONCAT('%', :search, '%')) AND
   (:status IS NULL OR o.paymentDetails.status = :status)
   ```
   - Pros: Single declarative method on repository, portable across Hibernate dialects, countQuery automatically derived or explicitly supplied.
   - Requirement matching: Directly satisfies "add JPQL/Specification query supporting search across orderId (order_code), customerName, phoneNumber, and status filtering with Spring Data Pageable".
2. **Spring Data `JpaSpecificationExecutor`**:
   - Dynamic criteria composition using `cb.or` and `cb.equal`.
   - Extending `JpaSpecificationExecutor<OrderEntity>` on `OrderEntityRepository` provides additional future-proofing for dynamic multi-column queries.
- **Decision**: Provide the JPQL query as the primary query method `findOrdersWithFilter` on `OrderEntityRepository`, while also adding `JpaSpecificationExecutor<OrderEntity>` to the interface.

### ADR-3: Status Filter Validation & Graceful Fallback
- If `status` query parameter is null, blank, or `"ALL"`, the status constraint is bypassed (`:status IS NULL`).
- If `status` is a valid enum value (case-insensitive: "COMPLETED", "completed", "PENDING", "CANCELLED", "FAILED"), it is converted to `PaymentDetails.PaymentStatus`.
- If an invalid/unrecognized status string is passed (e.g. `status=UNKNOWN`), `OrderServiceImpl` catches `IllegalArgumentException` and immediately returns an empty `OrderPageResponse` with `totalElements = 0`, avoiding database query errors and preventing unintended data leaks.

### ADR-4: Default Sorting & Determinism
- Paginated order history should order latest records first: `createdAt DESC`, with secondary tie-breaker `id DESC`.
- Service method applies `Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"))` if the incoming `pageable` does not specify an explicit sort.

---

## 4. Exact Implementation Formulations

### 4.1. File 1: `billingsoftware/src/main/java/learn/java/billingsoftware/io/OrderPageResponse.java` (NEW)

```java
package learn.java.billingsoftware.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderPageResponse {
    private List<OrderResponse> content;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
}
```

### 4.2. File 2: `billingsoftware/src/main/java/learn/java/billingsoftware/io/PaymentDetails.java` (MODIFY)

In `PaymentDetails.java`, update the `PaymentStatus` enum at lines 29-31:

```java
<<<<
    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED
    }
====
    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, CANCELLED
    }
>>>>
```

Complete updated file:
```java
package learn.java.billingsoftware.io;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentDetails {
    private String orderId;
//    private String paymentId;
//    private String signature;
    private PaymentStatus status;
    private String paymentLinkId;

    // Bổ sung 2 trường này để lưu DB
    @Column(length = 1000)
    private String checkoutUrl;

    @Column(columnDefinition = "TEXT")
    private String qrCode;

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, CANCELLED
    }
}
```

### 4.3. File 3: `billingsoftware/src/main/java/learn/java/billingsoftware/repository/OrderEntityRepository.java` (MODIFY)

Add `Page<OrderEntity> findOrdersWithFilter(...)` and extend `JpaSpecificationExecutor<OrderEntity>`:

```java
package learn.java.billingsoftware.repository;

import learn.java.billingsoftware.entity.OrderEntity;
import learn.java.billingsoftware.io.PaymentDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface OrderEntityRepository extends JpaRepository<OrderEntity, Long>, JpaSpecificationExecutor<OrderEntity> {
    Optional<OrderEntity> findByOrderId(String orderId);

    List<OrderEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT SUM(o.grandTotal) FROM OrderEntity o WHERE DATE(o.createdAt) = :date")
    Double sumSalesByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE DATE(o.createdAt) = :date")
    Long countByOrderDate(@Param("date") LocalDate date);

    @Query("SELECT o FROM OrderEntity o order by o.createdAt DESC")
    List<OrderEntity> findRecentOrders(Pageable pageable);

    @Query(value = "SELECT o FROM OrderEntity o WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " o.phoneNumber LIKE CONCAT('%', :search, '%')) AND " +
           "(:status IS NULL OR o.paymentDetails.status = :status)",
           countQuery = "SELECT COUNT(o) FROM OrderEntity o WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " o.phoneNumber LIKE CONCAT('%', :search, '%')) AND " +
           "(:status IS NULL OR o.paymentDetails.status = :status)")
    Page<OrderEntity> findOrdersWithFilter(@Param("search") String search,
                                           @Param("status") PaymentDetails.PaymentStatus status,
                                           Pageable pageable);
}
```

### 4.4. File 4: `billingsoftware/src/main/java/learn/java/billingsoftware/service/OrderService.java` (MODIFY)

Add pagination signatures:

```java
package learn.java.billingsoftware.service;

import learn.java.billingsoftware.io.OrderPageResponse;
import learn.java.billingsoftware.io.OrderRequest;
import learn.java.billingsoftware.io.OrderResponse;

import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request);
    void deleteOrder(String orderId);
    List<OrderResponse> getLatestOrders();
    OrderResponse getOrderById(String orderId);

    Double sumSalesByDate(LocalDate date);
    Long countByOrderDate(LocalDate date);
    List<OrderResponse> findRecentOrders(int limit);

    OrderPageResponse getOrdersPaginated(int page, int size, String search, String status);
    OrderPageResponse getOrdersPaginated(Pageable pageable, String search, String status);
}
```

### 4.5. File 5: `billingsoftware/src/main/java/learn/java/billingsoftware/service/impl/OrderServiceImpl.java` (MODIFY)

Add imports and implementations for `getOrdersPaginated`:

```java
import learn.java.billingsoftware.io.OrderPageResponse;
import org.springframework.data.domain.Page;
import java.util.Collections;
```

Implementation methods to append to `OrderServiceImpl`:

```java
    @Override
    @Transactional(readOnly = true)
    public OrderPageResponse getOrdersPaginated(int page, int size, String search, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
        return getOrdersPaginated(pageable, search, status);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderPageResponse getOrdersPaginated(Pageable pageable, String search, String status) {
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        PaymentDetails.PaymentStatus paymentStatus = null;
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
            try {
                paymentStatus = PaymentDetails.PaymentStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // If unrecognized status string is provided, return empty paginated result
                return OrderPageResponse.builder()
                        .content(Collections.emptyList())
                        .totalElements(0L)
                        .totalPages(0)
                        .currentPage(pageable.getPageNumber())
                        .pageSize(pageable.getPageSize())
                        .build();
            }
        }

        Page<OrderEntity> orderPage = orderEntityRepository.findOrdersWithFilter(trimmedSearch, paymentStatus, pageable);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return OrderPageResponse.builder()
                .content(content)
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .currentPage(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .build();
    }
```

Also improve `convertToResponse` (line 251) to guard against null `items`:
```java
<<<<
                .items(newOrder.getItems().stream()
                        .map(this::convertToItemResponse)
                        .collect(Collectors.toList()))
====
                .items(newOrder.getItems() != null ? newOrder.getItems().stream()
                        .map(this::convertToItemResponse)
                        .collect(Collectors.toList()) : Collections.emptyList())
>>>>
```

### 4.6. File 6: `billingsoftware/src/main/java/learn/java/billingsoftware/controller/OrderController.java` (MODIFY)

Add import and root `@GetMapping`:

```java
package learn.java.billingsoftware.controller;

import learn.java.billingsoftware.io.OrderPageResponse;
import learn.java.billingsoftware.io.OrderRequest;
import learn.java.billingsoftware.io.OrderResponse;
import learn.java.billingsoftware.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@RequestBody OrderRequest request) {
        return orderService.createOrder(request);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{orderId}")
    public void deleteOrder(@PathVariable String orderId) {
        orderService.deleteOrder(orderId);
    }

    @GetMapping("/latest")
    public List<OrderResponse> getLatestOrders() {
        return orderService.getLatestOrders();
    }
    
    @GetMapping("/{orderId}")
    public OrderResponse getOrderById(@PathVariable String orderId) {
        return orderService.getOrderById(orderId);
    }

    @GetMapping
    public OrderPageResponse getOrders(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status) {
        return orderService.getOrdersPaginated(page, size, search, status);
    }
}
```

---

## 5. Security Configuration Verification

In `billingsoftware/src/main/java/learn/java/billingsoftware/config/SecurityConfig.java`:
Line 44:
```java
.requestMatchers("/categories", "/items/**", "/orders/**", "/dashboard", "/modifier-groups/**", "/inventory/**", "/customers", "/customers/**", "/promotions", "/promotions/**").hasAnyRole("USER", "ADMIN")
```
Notice:
While `/orders/**` matches subpaths, in Spring Security 6/7 it is best practice to include both `/orders` and `/orders/**`:
```java
.requestMatchers("/categories", "/items/**", "/orders", "/orders/**", "/dashboard", "/modifier-groups/**", "/inventory/**", "/customers", "/customers/**", "/promotions", "/promotions/**").hasAnyRole("USER", "ADMIN")
```
This guarantees that both `GET /orders` and `GET /orders/latest` or `GET /orders/{id}` have identical authorization rules.

---

## 6. Frontend Integration Blueprint (Milestone 3 Frontend Scope)

To ensure seamless end-to-end functionality once the backend is implemented:
1. **`Front-end/src/services/OrderService.js`**:
   Add `fetchOrdersPaginated({ page, size, search, status })`:
   ```javascript
   export const fetchOrdersPaginated = async ({ page = 0, size = 10, search = "", status = "" } = {}) => {
     const params = { page, size };
     if (search && search.trim()) params.search = search.trim();
     if (status && status !== "ALL") params.status = status;
     const response = await api.get("/orders", { params });
     return response.data; // OrderPageResponse: { content, totalElements, totalPages, currentPage, pageSize }
   };
   ```
2. **`Front-end/src/features/Orders/useOrders.js`**:
   Accept query parameters and include in queryKey:
   ```javascript
   export function useOrders({ page = 0, size = 10, search = "", status = "" } = {}) {
     const {
       isPending: isLoading,
       data,
       error,
     } = useQuery({
       queryKey: ["orders", "paginated", { page, size, search, status }],
       queryFn: () => fetchOrdersPaginated({ page, size, search, status }),
       keepPreviousData: true,
     });

     return {
       isLoading,
       error,
       orders: data?.content || [],
       pagination: {
         totalElements: data?.totalElements || 0,
         totalPages: data?.totalPages || 0,
         currentPage: data?.currentPage || 0,
         pageSize: data?.pageSize || size,
       },
     };
   }
   ```
3. **`Front-end/src/pages/OrderHistory.jsx`**:
   - Internal scroll container layout: `h-[calc(100vh-4rem)] flex flex-col p-6 bg-slate-50 overflow-hidden`
   - Table container: `flex-1 flex flex-col overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm`
   - Table body: `flex-1 overflow-auto`
   - Table header: `sticky top-0 bg-slate-50 z-10`
   - Filter bar: search input with clear icon + status filter select (`ALL`, `COMPLETED`, `PENDING`, `CANCELLED`)
   - Bottom pagination bar: showing `Showing X to Y of Z orders`, page size dropdown (`10`, `20`, `50`), previous/next buttons.

---

## 7. Verification Method

Once implemented by the implementer agent, the solution can be independently verified via:

1. **Targeted Backend Integration Test**:
   ```powershell
   cmd /c "mvnw.cmd test -Dtest=OrderPaginationIntegrationTest"
   ```
   **Expected Outcome**: All 11 tests pass with zero failures:
   - `testUnauthenticatedAccessToOrdersIsRejected`
   - `testDefaultPaginationReturnsFirstPage`
   - `testCustomPageAndSizePagination`
   - `testSearchFilterByOrderId`
   - `testSearchFilterByCustomerName`
   - `testSearchFilterByPhoneNumber`
   - `testFilterByPaymentStatusCompleted`
   - `testFilterByPaymentStatusPending`
   - `testCombinedSearchAndStatusFilter`
   - `testSearchNonMatchingTermReturnsEmptyResult`
   - `testPaginationOutOfBoundsReturnsEmptyContent`

2. **Full Backend Test Suite**:
   ```powershell
   cmd /c "mvnw.cmd test"
   ```
   Ensures no regressions across existing test suites (`OrderCheckoutIntegrationTest`, `DashboardMetricIntegrationTest`, etc.).
