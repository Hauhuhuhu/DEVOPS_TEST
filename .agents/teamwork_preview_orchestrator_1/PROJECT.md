# Project: Billing App Phase 4 (Activity Logs & Full UX Refinement)

## Architecture
- **Backend**: Java 25, Spring Boot 4.1.0, Spring Data JPA, Spring Security with JWT. Context path: `/api/v1.0`.
- **Frontend**: React 19, Vite, Tailwind CSS with design tokens (Primary Blue-600, Accent Emerald-600, Slate-50 background), TanStack Query v5, React Hook Form, React Hot Toast, Lucide React icons.
- **Architectural Invariants**:
  - Raw DTO convention: APIs return raw DTO / List responses without generic wrapper `{ data, status, message }`.
  - Non-blocking Audit Logging: `@Async` logging service isolated with fail-safe exception handling so audit failures never block or fail core business transactions.
  - Role-based Access Control: Staff (`ROLE_USER`) is restricted to their own data where applicable; Admin (`ROLE_ADMIN`) has global administrative query access.
  - State Management: TanStack React Query for fetching, caching, and server-state invalidation.
  - Unified Validation UX: `react-hook-form` across all 8 target forms with toast notification via `react-hot-toast` + red borders (`border-red-500 focus:ring-red-500 bg-red-50/10`) + inline error messages (`text-xs text-red-600 mt-1`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dashboard Metric Fix | Update label to "Today's Orders" and bind to `dashboardData.todayOrderCount ?? 0` | M1 | Spec Miner / Frontend Survey |
| 2 | ConfirmDeleteModal Component | Reusable modal in `src/ui/ConfirmDeleteModal.jsx` with entity name, danger styling, cancel/delete buttons, and loading spinner | M1 | Spec Miner / Frontend Survey |
| 3 | Delete Item Modal Integration | Replace `window.confirm` in `Item.jsx` with `ConfirmDeleteModal` | M1 | Spec Miner / Frontend Survey |
| 4 | Delete Category Modal Integration | Replace `window.confirm` in `CategoryListItem.jsx` with `ConfirmDeleteModal` | M1 | Spec Miner / Frontend Survey |
| 5 | Delete User Modal Integration | Replace `window.confirm` in `UserItem.jsx` with `ConfirmDeleteModal` | M1 | Spec Miner / Frontend Survey |
| 6 | Delete Customer Modal Integration | Replace `window.confirm` in `ManageCustomers.jsx` with `ConfirmDeleteModal` | M1 | Spec Miner / Frontend Survey |
| 7 | Delete Promotion Modal Integration | Replace `window.confirm` in `ManagePromotions.jsx` with `ConfirmDeleteModal` | M1 | Spec Miner / Frontend Survey |
| 8 | Delete Modifier Group Modal Integration | Replace `window.confirm` in `ModifierGroupList.jsx` with `ConfirmDeleteModal` | M1 | Spec Miner / Frontend Survey |
| 9 | LoginForm react-hook-form Migration | Migrate `LoginForm.jsx` from `useState` to `react-hook-form` with toast on error, red borders, and inline error text | M2 | Spec Miner / Frontend Survey |
| 10 | CategoryForm Validation Standardization | Destructure `errors`, add `border-red-500`, and inline error messages for Category name & description | M2 | Spec Miner / Frontend Survey |
| 11 | ItemForm Validation Standardization | Standardize `ItemForm.jsx` validation (name, category, price, dynamic variant SKU & base price) with red borders and inline messages | M2 | Spec Miner / Frontend Survey |
| 12 | UserForm Validation Standardization | Standardize `UserForm.jsx` validation (name, email, password, role) with red borders and inline messages | M2 | Spec Miner / Frontend Survey |
| 13 | ModifierGroupForm Validation Standardization | Standardize `ModifierGroupForm.jsx` validation (group name, modifier options name & price) with red borders and inline messages | M2 | Spec Miner / Frontend Survey |
| 14 | ManageCustomers Validation Standardization | Add `onError` toast callback to `handleSubmit` in `ManageCustomers.jsx` | M2 | Spec Miner / Frontend Survey |
| 15 | ManagePromotions Validation Standardization | Add `onError` toast callback to `handleSubmit` in `ManagePromotions.jsx` | M2 | Spec Miner / Frontend Survey |
| 16 | StockOperationModal Validation Standardization | Add `onError` toast callbacks and conditional red borders to `StockOperationModal.jsx` | M2 | Spec Miner / Frontend Survey |
| 17 | Order History Pageable API | Add `GET /api/v1.0/orders` with `page`, `size`, `search`, and `status` parameters in `OrderController` | M3 | Spec Miner / Backend Survey |
| 18 | OrderPageResponse DTO | Raw DTO containing `content` (List<OrderResponse>), `totalElements`, `totalPages`, `currentPage`, `pageSize` | M3 | Spec Miner / Backend Survey |
| 19 | OrderRepository Filtering Query | Query in `OrderEntityRepository` supporting search across orderId (code), customerName, phoneNumber, and payment status | M3 | Spec Miner / Backend Survey |
| 20 | Order PaymentStatus Enum Expansion | Ensure `PaymentDetails.PaymentStatus` supports `CANCELLED` status | M3 | Spec Miner / Backend Survey |
| 21 | Frontend Order Service Pagination | Update `OrderService.js` to call `GET /orders` with page, size, search, and status | M3 | Spec Miner / Frontend Survey |
| 22 | useOrders Pagination Hook | Update `useOrders.js` to accept pagination and filter query params and return paginated order data | M3 | Spec Miner / Frontend Survey |
| 23 | OrderHistory Sticky Header Layout | Internal scroll container (`h-[calc(100vh-4rem)]` with `overflow-y-auto`) and `thead sticky top-0 bg-slate-50` | M3 | Spec Miner / Frontend Survey |
| 24 | OrderHistory Search & Status Filter UI | Search input (Order ID, Customer, Phone) and payment status dropdown (All, PENDING, COMPLETED, CANCELLED) | M3 | Spec Miner / Frontend Survey |
| 25 | OrderHistory Pagination Toolbar UI | Bottom pagination bar with current page, total orders, Next/Previous buttons, and page size selector (10, 20, 50) | M3 | Spec Miner / Frontend Survey |
| 26 | ActivityLog Entity & DB Schema | JPA entity `ActivityLogEntity` mapping to table `tbl_activity_logs` | M4 | Spec Miner / Backend Survey |
| 27 | ActivityLog Repository & Specification | Repository with query methods / specification for email, action, date range filtering and `Pageable` | M4 | Spec Miner / Backend Survey |
| 28 | ActivityLog DTOs | `ActivityLogResponse` and `ActivityLogPageResponse` conforming to raw DTO convention | M4 | Spec Miner / Backend Survey |
| 29 | Async Activity Logging Engine | `@EnableAsync` configuration and `ActivityLogService` with `@Async logActivityAsync(...)` with try-catch fail-safety | M4 | Spec Miner / Backend Survey |
| 30 | Activity Logging Instrumentation | Instrument 9 mutation points: Login, Order creation/deletion, Item CRUD, Category CRUD, User CRUD, Modifier CRUD, Customer CRUD, Promotion CRUD, Stock adjustments | M4 | Spec Miner / Backend Survey |
| 31 | ActivityLog REST Controller | `GET /api/v1.0/activity-logs` with role-based visibility (Staff restricted to own email; Admin unconstrained) | M4 | Spec Miner / Backend Survey |
| 32 | SecurityConfig Activity Logs Rule | Configure `/activity-logs/**` in `SecurityConfig.java` for authenticated users (`USER`, `ADMIN`) | M4 | Spec Miner / Backend Survey |
| 33 | Menubar Activity Log Navigation | Update `Menubar.jsx` user profile dropdown with NavLink/navigation to `/activity-logs` | M5 | Spec Miner / Frontend Survey |
| 34 | Activity Log Route Registration | Register `/activity-logs` in `App.jsx` within `ProtectedRoute` and `AppLayout` | M5 | Spec Miner / Frontend Survey |
| 35 | ActivityLog Frontend Service & Hook | Create `ActivityLogService.js` and `useActivityLogs.js` using TanStack Query | M5 | Spec Miner / Frontend Survey |
| 36 | ActivityLogs Page Component | Page at `/activity-logs` with date presets (Today, 7D, 30D, All), action filters, admin user filter, badge styling, and pagination | M5 | Spec Miner / Frontend Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Dashboard Metric & Delete Modal | Features 1–8: "Today's Orders" label & metric fix in Dashboard, reusable `ConfirmDeleteModal`, elimination of all 6 `window.confirm` sites | none | DONE |
| M2 | Unified Form Validation UX | Features 9–16: Standardize all 8 target forms onto `react-hook-form` + toast on invalid submit + red borders + inline messages | none | DONE |
| M3 | Order History Scalability & Table Experience | Features 17–25: Backend `GET /orders` paginated API (`OrderPageResponse`, `Pageable`, search/status) + Frontend internal sticky table with pagination | none | PLANNED |
| M4 | Activity Log Subsystem Backend Engine | Features 26–32: `ActivityLogEntity`, async fail-safe logging service, 9 domain instrumentation points, role-based `GET /activity-logs` API | none | PLANNED |
| M5 | Activity Log Subsystem Frontend Interface | Features 33–36: Navigation link in `Menubar.jsx`, route in `App.jsx`, service, hook, and full `/activity-logs` UI with filtering & pagination | M4 | PLANNED |
| M6 | Dual Track E2E Verification & Forensic Audit | Comprehensive verification of all requirements, full backend test suite, frontend lint/build, and forensic integrity audit | M1, M2, M3, M4, M5 | PLANNED |

## Interface Contracts

### 1. Order History Paginated API
- **Endpoint**: `GET /api/v1.0/orders`
- **Query Parameters**:
  - `page`: int (0-indexed, default 0)
  - `size`: int (default 10)
  - `search`: string (optional, searches orderId, customerName, phoneNumber)
  - `status`: string (optional, matching `PaymentDetails.PaymentStatus`: `PENDING`, `COMPLETED`, `CANCELLED`)
- **Response Schema** (`OrderPageResponse`):
  ```json
  {
    "content": [
      {
        "orderId": "ORD-12345",
        "customerName": "John Doe",
        "phoneNumber": "0912345678",
        "orderDate": "2026-09-07T10:00:00",
        "totalAmount": 150000.0,
        "paymentStatus": "COMPLETED",
        "items": [...]
      }
    ],
    "totalElements": 42,
    "totalPages": 5,
    "currentPage": 0,
    "pageSize": 10
  }
  ```

### 2. Activity Log API
- **Endpoint**: `GET /api/v1.0/activity-logs`
- **Security**: Authenticated (`ROLE_USER`, `ROLE_ADMIN`).
  - If user has `ROLE_USER` (Staff), `userEmail` filter is forced to the authenticated user's email regardless of query parameter.
  - If user has `ROLE_ADMIN`, user can supply any `userEmail` filter or omit for all users.
- **Query Parameters**:
  - `page`: int (0-indexed, default 0)
  - `size`: int (default 20)
  - `userEmail`: string (optional)
  - `action`: string (optional, e.g. `LOGIN`, `CREATE`, `UPDATE`, `DELETE`, `STOCK_ADJUSTMENT`, `STOCK_CHECK`)
  - `startDate`: string (ISO-8601 date, optional)
  - `endDate`: string (ISO-8601 date, optional)
- **Response Schema** (`ActivityLogPageResponse`):
  ```json
  {
    "content": [
      {
        "id": 1,
        "logId": "uuid-string",
        "userEmail": "admin@example.com",
        "action": "CREATE",
        "entityType": "ITEM",
        "entityId": "item-uuid-or-id",
        "description": "Created new item 'Espresso Coffee' in category 'Beverages'",
        "timestamp": "2026-09-07T10:15:30Z"
      }
    ],
    "totalElements": 128,
    "totalPages": 7,
    "currentPage": 0,
    "pageSize": 20
  }
  ```

### 3. Reusable Delete Confirmation Modal (`ConfirmDeleteModal.jsx`)
- **Props Interface**:
  ```jsx
  <ConfirmDeleteModal
    isOpen={boolean}
    onClose={() => void}
    onConfirm={() => void}
    title={string}
    entityName={string}
    message={string}
    isLoading={boolean}
  />
  ```

## Code Layout

### Backend (`billingsoftware/src/main/java/learn/java/billingsoftware/`)
- `entity/`:
  - `ActivityLogEntity.java`
- `repository/`:
  - `ActivityLogRepository.java`
  - `OrderEntityRepository.java` (updated with paginated filter query)
- `service/`:
  - `ActivityLogService.java` & `ActivityLogServiceImpl.java`
  - `OrderService.java` & `OrderServiceImpl.java` (updated with `getOrdersPaginated`)
- `controller/`:
  - `ActivityLogController.java`
  - `OrderController.java` (updated with `GET /orders`)
- `io/`:
  - `ActivityLogResponse.java`
  - `ActivityLogPageResponse.java`
  - `OrderPageResponse.java`
- `config/`:
  - `SecurityConfig.java` (updated for `/activity-logs/**`)
  - `AsyncConfig.java` or `@EnableAsync` on `BillingsoftwareApplication.java`

### Frontend (`Front-end/src/`)
- `ui/`:
  - `ConfirmDeleteModal.jsx` (new component)
  - `Menubar.jsx` (updated with `/activity-logs` navigation)
- `pages/`:
  - `Dashboard.jsx` (updated "Today's Orders" label & binding)
  - `OrderHistory.jsx` (updated with sticky header, internal scroll, pagination)
  - `ActivityLogs.jsx` (new page component)
  - `ManageCustomers.jsx` (updated with ConfirmDeleteModal & form onError toast)
  - `ManagePromotions.jsx` (updated with ConfirmDeleteModal & form onError toast)
- `features/`:
  - `Auth/LoginForm.jsx` (migrated to react-hook-form with red borders/toast)
  - `Category/CategoryForm.jsx` (updated validation styles)
  - `Category/CategoryListItem.jsx` (updated with ConfirmDeleteModal)
  - `Items/ItemForm.jsx` (updated validation styles)
  - `Items/Item.jsx` (updated with ConfirmDeleteModal)
  - `Users/UserForm.jsx` (updated validation styles)
  - `Users/UserItem.jsx` (updated with ConfirmDeleteModal)
  - `Modifiers/ModifierGroupForm.jsx` (updated validation styles)
  - `Modifiers/ModifierGroupList.jsx` (updated with ConfirmDeleteModal)
  - `Inventory/StockOperationModal.jsx` (updated validation styles & onError)
  - `ActivityLogs/` (new components for filters, badges, and log table)
- `services/`:
  - `OrderService.js` (updated with paginated `getOrders`)
  - `ActivityLogService.js` (new service)
- `hooks/`:
  - `useOrders.js` (updated with paginated query)
  - `useActivityLogs.js` (new hook)
