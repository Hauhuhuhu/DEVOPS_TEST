# TEST INFRASTRUCTURE & ARCHITECTURE SPECIFICATION (PHASE 4)

## 1. Overview & Strategy

The testing infrastructure for Phase 4 (Activity Logs & Full UX Refinement) follows strict Test-Driven Development (TDD) and seam-based public interface verification principles. Testing focuses on external observable contracts at the HTTP REST boundaries (Backend) and static/runtime bundle integrity (Frontend).

Backend tests leverage Spring Boot's testing framework (`@SpringBootTest`, `@AutoConfigureMockMvc`, `@Transactional`) to exercise full request lifecycles without requiring external network dependencies or coupling to private repository implementation details.

---

## 2. Test Architecture Matrix

| Requirement Area | Test Suite / Target | Framework / Tool | Seam / Public Boundary | Status |
|---|---|---|---|---|
| **R1. Activity Logs** | `ActivityLogIntegrationTest.java` | Spring MockMvc / JUnit 5 | `GET /activity-logs`, `POST /categories`, `POST /customers` | Test Created & Compiles (TDD Red -> Ready for M4) |
| **R2. Unified Form Validation** | Frontend Verification | ESLint + Vite Build | React Hook Form `onSubmit` & `onError` hooks | Ready for M2 verification |
| **R3. Delete Modal** | Frontend Verification | ESLint + Vite Build | `ConfirmDeleteModal` component contract | Ready for M1 verification |
| **R4. Dashboard Metrics** | `DashboardMetricIntegrationTest.java` | Spring MockMvc / JUnit 5 | `GET /dashboard` | 6/6 Passing Green |
| **R5. Order Pagination** | `OrderPaginationIntegrationTest.java` | Spring MockMvc / JUnit 5 | `GET /orders` | Test Created & Compiles (TDD Red -> Ready for M3) |

---

## 3. Test Suites & Contract Specifications

### 3.1 `DashboardMetricIntegrationTest.java`
- **Location**: `billingsoftware/src/test/java/learn/java/billingsoftware/DashboardMetricIntegrationTest.java`
- **Coverage**:
  - `testUnauthenticatedAccessToDashboardIsRejected`: Asserts HTTP 403 when no authentication token is provided.
  - `testStaffUserCanAccessDashboard`: Asserts HTTP 200 and schema validity for `ROLE_USER`.
  - `testAdminUserCanAccessDashboard`: Asserts HTTP 200 and schema validity for `ROLE_ADMIN`.
  - `testTodayOrderCountAccuracyWithNewOrders`: Persists a new order created today; asserts `todayOrderCount` increments by 1 and `todaySales` increments by the exact order amount.
  - `testRecentOrdersLimit`: Asserts `recentOrders` list does not exceed 5 items.
  - `testDashboardDefaultMetricsNotNull`: Asserts non-null numeric defaults (`>= 0`) even when no data exists.
- **Verification Result**: All 6 tests execute and pass cleanly (`Tests run: 6, Failures: 0, Errors: 0`).

### 3.2 `OrderPaginationIntegrationTest.java`
- **Location**: `billingsoftware/src/test/java/learn/java/billingsoftware/OrderPaginationIntegrationTest.java`
- **Coverage**:
  - Unauthenticated access returns HTTP 401/403.
  - Default `GET /orders` pagination returns page 0 with default size 10 and `OrderPageResponse` metadata (`content`, `totalElements`, `totalPages`, `currentPage`, `pageSize`).
  - Custom `page` and `size` parameters slice datasets correctly.
  - Server-side search filtering matches Order ID code.
  - Server-side search filtering matches Customer Name.
  - Server-side search filtering matches Phone Number.
  - Payment status filtering matches `COMPLETED` and `PENDING`.
  - Combined search and status filtering returns exact intersection.
  - Non-matching search queries return empty content and 0 total elements.
  - Boundary condition: out-of-bounds page numbers return empty array cleanly.
- **Verification Result**: Compiles cleanly with javac (`mvnw.cmd test-compile`).

### 3.3 `ActivityLogIntegrationTest.java`
- **Location**: `billingsoftware/src/test/java/learn/java/billingsoftware/ActivityLogIntegrationTest.java`
- **Coverage**:
  - Unauthenticated access returns HTTP 401/403.
  - Authenticated staff user (`ROLE_USER`) receives `ActivityLogPageResponse` schema.
  - **RBAC Data Isolation**: Staff users are strictly constrained to records matching their own email address.
  - **RBAC Anti-Tamper**: Staff users cannot query other users' logs even if an explicit `userEmail` query parameter is provided.
  - Admin users (`ROLE_ADMIN`) have global query visibility across all users.
  - Admin users can filter by specific `userEmail`.
  - Filtering by `action` (e.g. `CREATE`, `UPDATE`, `DELETE`, `LOGIN`).
  - Filtering by date range (`startDate`, `endDate`).
  - Pagination parameters `page` and `size` are respected in response metadata.
  - Non-blocking audit log creation triggered upon Category creation mutation (`POST /categories`).
  - Non-blocking audit log creation triggered upon Customer creation mutation (`POST /customers`).
- **Verification Result**: Compiles cleanly with javac (`mvnw.cmd test-compile`).

---

## 4. Execution Commands

### Backend Test Compilation
```powershell
cd billingsoftware
.\mvnw.cmd test-compile
```

### Running Backend Integration Tests
```powershell
# Run all dashboard metric tests
cd billingsoftware
.\mvnw.cmd test -Dtest=DashboardMetricIntegrationTest

# Run order pagination tests (once M3 implemented)
.\mvnw.cmd test -Dtest=OrderPaginationIntegrationTest

# Run activity log tests (once M4 implemented)
.\mvnw.cmd test -Dtest=ActivityLogIntegrationTest

# Run full test suite
.\mvnw.cmd test
```

### Frontend Build & Lint Verification
```powershell
cd Front-end
npm run lint
npm run build
```

---

## 5. Environmental Invariants & Best Practices

1. **Transaction Isolation**: All integration tests use `@Transactional` to ensure that data persisted during test runs is rolled back upon test completion, preventing database pollution.
2. **Stateless Security**: MockMvc requests simulate authentication using `.with(user(...).roles(...))` matching Spring Security's stateless JWT filter context.
3. **Decoupled Contracts**: Test assertions validate raw DTO JSON structures directly using Hamcrest and JSONPath (`$.content`, `$.totalElements`, `$.todayOrderCount`) to prevent brittle coupling to internal repository method signatures.