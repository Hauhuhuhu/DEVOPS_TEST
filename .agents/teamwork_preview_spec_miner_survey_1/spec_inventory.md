# Phase 4 Specification Inventory: Activity Logs & Full UX Refinement

## Executive Summary
This document provides the authoritative specification inventory mined for **Phase 4 (Activity Logs & Full UX Refinement)** of the Billing Application. The scope spans 5 core requirement areas:
- **R1. Activity Log Subsystem (Backend & Frontend)**: Complete audit trail infrastructure, non-blocking persistence, role-scoped REST API (`GET /api/v1.0/activity-logs`), and dedicated UI page with date/action filters.
- **R2. Unified Form Validation UX**: 100% adoption of `react-hook-form` across 8 forms with dual-action error feedback (immediate toast via `react-hot-toast` + red border + inline error message).
- **R3. Reusable Delete Confirmation Modal**: `ConfirmDeleteModal` component replacing all 6 raw browser `window.confirm` calls across the application with loading state and double-click prevention.
- **R4. Dashboard Order Metric Synchronization**: Label alignment to "Today's Orders" and property rebinding to backend `todayOrderCount`.
- **R5. Order History Scalability & Table Experience**: Server-side pagination with Spring Data JPA `Pageable`, search, status filter, raw `OrderPageResponse` DTO, and internal scroll container with sticky header (`sticky top-0`).

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R1 Activity Logs | Activity Log Data Model (`tbl_activity_logs`) | Persistent entity recording audit logs of business actions | `id`, `logId` (UUID), `userEmail`, `actionType`, `entityType`, `entityId`, `description`, `createdAt` | Database record in `tbl_activity_logs` | Throws DB exceptions if unhandled | `spec.md`, `issues/05` |
| 2 | R1 Activity Logs | Asynchronous / Non-blocking Log Service | Service method to persist audit events without disrupting caller transactions | `userEmail`, `actionType`, `entityType`, `entityId`, `description` | Void / CompletableFuture | Gracefully catches exceptions, logs warning/error; never rolls back parent business transaction | `spec.md`, `issues/05` |
| 3 | R1 Activity Logs | Role-based REST Query API (`GET /activity-logs`) | Paginated, filtered retrieval of activity logs conforming to `ActivityLogPageResponse` | Query params: `page`, `size`, `userEmail`, `actionType`, `startDate`, `endDate`; Bearer JWT | `ActivityLogPageResponse` JSON (List of `ActivityLogResponse` + page metadata) | 401 Unauthorized if unauthenticated; 400 Bad Request if invalid format; overrides `userEmail` for Staff | `spec.md`, `issues/05`, `ORIGINAL_REQUEST.md` |
| 4 | R1 Activity Logs | Auth & Login Audit Trigger | Audit log entry generated when user authenticates | `email` from login request | Audit record: `actionType=LOGIN`, `entityType=USER`, `userEmail={email}` | Non-blocking catch | `issues/05` |
| 5 | R1 Activity Logs | Order Lifecycle Audit Trigger | Audit log entry generated upon order creation and order deletion | `OrderRequest`, `orderId`, current user | Audit record: `actionType=CREATE/DELETE`, `entityType=ORDER`, `entityId={orderId}` | Non-blocking catch | `issues/05` |
| 6 | R1 Activity Logs | Catalog & Settings CRUD Audit Triggers | Audit log entries for Item, Category, User, Promotion, Customer, Modifier Group mutations | Entity mutation requests, entity IDs | Audit record: `actionType=CREATE/UPDATE/DELETE`, entity types: `ITEM`, `CATEGORY`, `USER`, `PROMOTION`, `CUSTOMER`, `MODIFIER` | Non-blocking catch | `issues/05` |
| 7 | R1 Activity Logs | Inventory Transaction Audit Triggers | Audit log entries for Stock IN/OUT and Stock Check adjustments | `InventoryTransactionRequest`, `StockCheckRequest` | Audit record: `actionType=CREATE/UPDATE`, `entityType=INVENTORY` | Non-blocking catch | `issues/05` |
| 8 | R1 Activity Logs | Frontend Activity Logs Page (`/activity-logs`) | Dedicated management page displaying paginated logs with filter controls | Route `/activity-logs`, query parameters state | Interactive table, filter toolbar, pagination controls | Shows empty state if no logs; displays error toast on network failure | `spec.md`, `issues/06` |
| 9 | R1 Activity Logs | Date Range Quick Presets | Filter buttons: "Hôm nay", "7 ngày qua", "30 ngày qua", "Tất cả" | User click event on preset buttons | Calculates `startDate` and `endDate`, triggers React Query refetch | Resets to current date bounds | `issues/06` |
| 10 | R1 Activity Logs | Action Type & User Filter Dropdowns | Filter dropdowns for Action Type (`LOGIN`, `CREATE`, `UPDATE`, `DELETE`) and User Email (Admin only) | Selected dropdown value | Updates query state, triggers API refetch | Shows all logs if "ALL" selected | `issues/06` |
| 11 | R1 Activity Logs | Menubar Profile Navigation Integration | Profile dropdown option "Activity Log" navigates to `/activity-logs` | Click on "Activity Log" item | Navigates to `/activity-logs`, closes profile dropdown | None | `spec.md`, `issues/06` |
| 12 | R2 Form Validation | Standardized Error UX Protocol | Unified error feedback: toast notification + red input border (`border-red-500`) + inline error text | Form submission with missing/invalid required fields | `toast.error(...)`, `border-red-500 focus:ring-red-500`, `<p className="text-xs text-red-600 mt-1">` | Prevents invalid submission network requests | `spec.md`, `issues/03` |
| 13 | R2 Form Validation | `LoginForm.jsx` Migration | Form converted from `useState` to `react-hook-form` with email & password validation | User credentials input | Validated submission or error feedback | Shows red border and inline error on empty/invalid email; toast on submit | `issues/03` |
| 14 | R2 Form Validation | `CategoryForm.jsx` Error Feedback | Added `formState: { errors }` bindings and inline messages | Name, description, bgColor, imgUrl | Validated submission or error feedback | Highlights missing fields in red with inline error message | `issues/03` |
| 15 | R2 Form Validation | `ItemForm.jsx` & Variant Validation | Required field validation for single items and dynamic physical variants | Name, category, price/variants (sku, basePrice) | Validated submission or error feedback | Nested variant errors show inline under specific SKU/price input | `issues/03` |
| 16 | R2 Form Validation | `UserForm.jsx` Error Feedback | Name, email regex, and password validation with inline feedback | Name, email, password | Validated submission or error feedback | Red border, inline error label, toast alert | `issues/03` |
| 17 | R2 Form Validation | `ModifierGroupForm.jsx` Validation | Group name and dynamic modifier option validation | Group name, option names, price adjustments | Validated submission or error feedback | Red border on empty option name or group name | `issues/03` |
| 18 | R2 Form Validation | `ManageCustomers.jsx` Toast Callback | Form submit error handler wired to display toast | Name, phoneNumber (pattern check) | Validated submission or error feedback | Triggers toast on validation failure alongside existing red inputs | `issues/03` |
| 19 | R2 Form Validation | `ManagePromotions.jsx` Validation & Toast | Required field validation for Coupon, Happy Hour, and BOGO modes | Type-specific promotion fields | Validated submission or error feedback | Displays toast and inline error labels under invalid inputs | `issues/03` |
| 20 | R2 Form Validation | `StockOperationModal.jsx` Validation | Quantity validation for Stock IN/OUT and Physical Count for Stock Check | `quantity` (min 1), `actualCount` (min 0) | Validated submission or error feedback | Triggers toast alert and red border on input | `issues/03` |
| 21 | R3 Confirm Delete | Reusable `ConfirmDeleteModal.jsx` Component | Portal modal with danger alert styling, custom title, descriptive entity warning | Props: `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `entityName`, `isLoading` | Rendered modal overlay and dialog | Closes on backdrop click or ESC unless `isLoading=true` | `spec.md`, `issues/02` |
| 22 | R3 Confirm Delete | Delete Item Migration (`Item.jsx`) | Replaces `window.confirm` when deleting an item | Click delete on item card/row | Opens `ConfirmDeleteModal` with item name | Disables buttons and shows spinner during mutation | `issues/02` |
| 23 | R3 Confirm Delete | Delete Category Migration (`CategoryListItem.jsx`) | Replaces `window.confirm` when deleting a category | Click delete on category item | Opens `ConfirmDeleteModal` with category name | Disables buttons and shows spinner during mutation | `issues/02` |
| 24 | R3 Confirm Delete | Delete User Migration (`UserItem.jsx`) | Replaces `window.confirm` when deleting a user | Click delete on user item | Opens `ConfirmDeleteModal` with user name | Disables buttons and shows spinner during mutation | `issues/02` |
| 25 | R3 Confirm Delete | Delete Customer Migration (`ManageCustomers.jsx`) | Replaces `window.confirm` when deleting a customer | Click delete on customer row | Opens `ConfirmDeleteModal` with customer name | Disables buttons and shows spinner during mutation | `issues/02` |
| 26 | R3 Confirm Delete | Delete Promotion Migration (`ManagePromotions.jsx`) | Replaces `window.confirm` when deleting a promotion | Click delete on promotion row | Opens `ConfirmDeleteModal` with promotion name | Disables buttons and shows spinner during mutation | `issues/02` |
| 27 | R3 Confirm Delete | Delete Modifier Group Migration (`ModifierGroupList.jsx`) | Replaces `window.confirm` when deleting a modifier group | Click delete on modifier group | Opens `ConfirmDeleteModal` with group name | Disables buttons and shows spinner during mutation | `issues/02` |
| 28 | R4 Dashboard Metric | "Today's Orders" Label Update | Changes metric card label from "Total Orders" to "Today's Orders" | Card header render | Renders "Today's Orders" | Matches "Today's Sales" | `spec.md`, `issues/01` |
| 29 | R4 Dashboard Metric | Backend `todayOrderCount` Binding | Binds card value to `dashboardData.todayOrderCount ?? 0` | `dashboardData` response object | Numeric count of orders placed today | Renders 0 if null or loading | `spec.md`, `issues/01` |
| 30 | R5 Order Scalability | `OrderPageResponse` Raw DTO | Raw response DTO for paginated orders | Content list + pagination metadata | JSON `{ content, totalElements, totalPages, currentPage, pageSize }` | Adheres to raw DTO rule in `CONTEXT.md` | `spec.md`, `issues/04` |
| 31 | R5 Order Scalability | Paginated Order Query in Repository | Spring Data JPA query with search (order ID, customer name, phone) and status filter | `Pageable`, `search`, `status` | `Page<OrderEntity>` | Handles empty search, returns ordered by `createdAt DESC` | `issues/04` |
| 32 | R5 Order Scalability | `GET /orders` Paginated Endpoint | REST controller endpoint returning paginated order data | `page`, `size`, `search`, `status`, `sort` | `OrderPageResponse` JSON | 200 OK, 401 if unauthenticated | `issues/04` |
| 33 | R5 Order Scalability | Internal Scroll Table Container | Viewport fixed container (`h-[calc(100vh-4rem)]`) with internal table scroll | Screen size and row count | Table body scrolls internally, page body does not scroll | Preserves clean viewport geometry | `spec.md`, `issues/04` |
| 34 | R5 Order Scalability | Sticky Table Header (`sticky top-0`) | Table header pinned at top of scroll container | Scroll position inside table | Sticky `thead` with `bg-slate-50 z-10` | Header remains visible on deep scroll | `spec.md`, `issues/04` |
| 35 | R5 Order Scalability | Order Search & Status Filter Controls | Search input (ID, name, phone) and status dropdown (All, COMPLETED, PENDING, CANCELLED) | User input string / dropdown selection | Refetches paginated orders, resets page to 0 | Shows empty state if no matches | `issues/04` |
| 36 | R5 Order Scalability | Pagination Toolbar & Page Size Selector | Toolbar with page info, size dropdown (10, 20, 50), Previous/Next and page numbers | User click on page buttons or size selector | Updates page/size state, triggers React Query refetch | Disables buttons at boundary limits | `issues/04` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Activity Logs RBAC | Staff user passes `?userEmail=admin@example.com` | Backend MUST override `userEmail` with authenticated user's email from `SecurityContextHolder` (`Authentication.getName()`), ignoring client query parameter. |
| 2 | Activity Logs RBAC | Admin queries without `userEmail` param | Backend returns activity logs across all users system-wide. |
| 3 | Activity Logs RBAC | Admin queries with specific `?userEmail=staff@example.com` | Backend returns logs only for that specific user. |
| 4 | Activity Logs Failure | Database deadlock or connection drop during audit log insert | Logging service catches exception, logs error, does NOT abort or roll back primary transaction (e.g. order creation completes successfully). |
| 5 | Activity Logs Date Filter | `startDate` is after `endDate` | Backend returns 400 Bad Request or empty list; frontend prevents selecting invalid ranges. |
| 6 | Activity Logs Pagination | Requested page number exceeds `totalPages` | Returns 200 OK with `content: []`, `totalElements: X`, `totalPages: Y`, `currentPage: requestedPage`. |
| 7 | Form Validation | User clicks Submit with empty required fields | Submission blocked before network call; toast notification displayed; all empty fields highlighted with `border-red-500`; inline error message rendered below each field. |
| 8 | Form Validation | User corrects an invalid field | Red border and inline error message disappear dynamically upon field modification/correction. |
| 9 | Form Validation (Item Variants) | Item has `hasVariants=true` and variant SKU is empty | Inline error message "SKU is required" appears under specific variant row; form cannot be submitted. |
| 10 | Form Validation (Item Variants) | Item has `hasVariants=true` but 0 variants added | Toast error "At least one variant is required" displayed; submission blocked. |
| 11 | Confirm Delete Modal | User clicks delete button while request is already pending | Confirm button is disabled with loading spinner, preventing duplicate HTTP DELETE requests. |
| 12 | Confirm Delete Modal | User clicks outside the modal or presses ESC | Modal closes without executing deletion. |
| 13 | Confirm Delete Modal | Backend returns 404 or 409 error on delete | Modal closes or displays error toast, UI does not crash. |
| 14 | Dashboard Metric | Backend database has 0 orders placed today | Card displays "Today's Orders" with value `0` (not `NaN`, `null`, or blank). |
| 15 | Dashboard Metric | `dashboardData` is still loading | Card renders fallback `0` or loading skeleton without throwing undefined errors. |
| 16 | Order History Search | Search term contains special characters (`%`, `_`, `'`, `\`) | Backend repository query escapes characters or uses parameterized binding, preventing SQL injection or syntax error. |
| 17 | Order History Filter | User filters by status "PENDING" while on page 4 | Page resets to 0 (page 1) so user does not land on an empty page beyond the new filtered total. |
| 18 | Order History Scroll | Table contains 50 orders with wide columns | Scroll container scrolls both vertically and horizontally; `thead` remains pinned at `top: 0` vertically; card border remains intact. |
| 19 | Order History Data Mapping | Order has `paymentDetails = null` or `status = null` | Frontend defaults status display to "PENDING" with amber badge without crashing. |

---

## Detailed Requirements Breakdown

### R1. Activity Log Subsystem (Backend & Frontend)

#### 1. Functional Requirements & Behavioral Rules
- **Comprehensive Audit Trail**: The system records every key business operation:
  - User Login (`LOGIN`)
  - Order creation and deletion (`CREATE`, `DELETE` on `ORDER`)
  - Item addition and deletion (`CREATE`, `DELETE` on `ITEM`)
  - Category addition and deletion (`CREATE`, `DELETE` on `CATEGORY`)
  - User registration and deletion (`CREATE`, `DELETE` on `USER`)
  - Customer creation, update, and deletion (`CREATE`, `UPDATE`, `DELETE` on `CUSTOMER`)
  - Promotion creation, update, toggle active status, and deletion (`CREATE`, `UPDATE`, `DELETE` on `PROMOTION`)
  - Modifier Group creation, update, and deletion (`CREATE`, `UPDATE`, `DELETE` on `MODIFIER`)
  - Inventory Stock IN/OUT and Stock Check adjustments (`CREATE`, `UPDATE` on `INVENTORY`)
- **Non-blocking Execution**: Writing activity logs must never disrupt or roll back primary business transactions. If an audit write encounters an exception, it is caught and logged as a warning, allowing the core business action to commit normally.
- **Role-Based Visibility**:
  - Staff (`ROLE_USER`): Can only view activity logs associated with their own authenticated email address.
  - Admin (`ROLE_ADMIN`): Can view all system activity logs, or filter by any user's email.

#### 2. Exact Contract Definitions

##### Database Entity: `tbl_activity_logs`
- Class: `learn.java.billingsoftware.entity.ActivityLogEntity`
- Columns:
  - `id`: `BIGINT AUTO_INCREMENT PRIMARY KEY`
  - `log_id`: `VARCHAR(255) NOT NULL UNIQUE` (UUID string)
  - `user_email`: `VARCHAR(255) NOT NULL` (indexed)
  - `action_type`: `VARCHAR(50) NOT NULL` (`LOGIN`, `CREATE`, `UPDATE`, `DELETE`)
  - `entity_type`: `VARCHAR(50) NOT NULL` (`ORDER`, `ITEM`, `CATEGORY`, `USER`, `CUSTOMER`, `PROMOTION`, `MODIFIER`, `INVENTORY`)
  - `entity_id`: `VARCHAR(255)` (Nullable, e.g. orderId, itemId, etc.)
  - `description`: `VARCHAR(1000)` (Human-readable summary)
  - `created_at`: `DATETIME / TIMESTAMP NOT NULL` (`@CreationTimestamp`, updatable = false)

##### Endpoint: `GET /api/v1.0/activity-logs`
- Controller mapping: `@GetMapping` on `@RequestMapping("/activity-logs")` or within `ActivityLogController`
- Query Parameters:
  - `page`: `int` (default: 0)
  - `size`: `int` (default: 10)
  - `userEmail`: `String` (optional; Admin-only filter. Ignored or overridden for Staff)
  - `actionType`: `String` (optional; values: `LOGIN`, `CREATE`, `UPDATE`, `DELETE`)
  - `startDate`: `String` (optional; format: `YYYY-MM-DD` or ISO date-time)
  - `endDate`: `String` (optional; format: `YYYY-MM-DD` or ISO date-time)
- Security: Authenticated only (`@PreAuthorize("isAuthenticated()")` or `hasAnyRole("USER", "ADMIN")`).
- HTTP Status Codes:
  - `200 OK`: Successful query returning `ActivityLogPageResponse`.
  - `401 Unauthorized`: Missing or invalid Bearer JWT.
  - `400 Bad Request`: Malformed parameters (e.g. invalid date format).
- DTO Schemas (Raw DTO, no global generic wrapper):
  - `ActivityLogResponse`:
    ```json
    {
      "logId": "string (uuid)",
      "userEmail": "string",
      "actionType": "string",
      "entityType": "string",
      "entityId": "string",
      "description": "string",
      "createdAt": "2026-09-07T10:30:00"
    }
    ```
  - `ActivityLogPageResponse`:
    ```json
    {
      "content": [ ...ActivityLogResponse... ],
      "totalElements": 150,
      "totalPages": 15,
      "currentPage": 0,
      "pageSize": 10
    }
    ```

#### 3. Frontend Specifications
- **Route**: `/activity-logs` in `App.jsx`, nested under `<ProtectedRoute>` and `<AppLayout>`.
- **Menubar Navigation**: In `Menubar.jsx`, "Activity Log" option in profile dropdown triggers navigation to `/activity-logs` and closes the dropdown.
- **Page Components (`ActivityLogs.jsx`)**:
  - Header with title, `Activity` icon, total record counter badge.
  - Date Preset Pills: "Hôm nay", "7 ngày qua", "30 ngày qua", "Tất cả".
  - Action Filter Dropdown: "Tất cả", "LOGIN", "CREATE", "UPDATE", "DELETE".
  - User Filter Dropdown: Displayed only when `isAdmin === true`. Allows selecting a specific user email or "Tất cả nhân viên".
  - Table Columns:
    - Thời gian (`createdAt` formatted with date and time).
    - Người thực hiện (`userEmail`).
    - Hành động (Color-coded badge: `LOGIN` = blue, `CREATE` = emerald, `UPDATE` = amber, `DELETE` = red).
    - Thực thể (`entityType` badge: `ORDER`, `ITEM`, `CATEGORY`, `USER`, `CUSTOMER`, `PROMOTION`, `MODIFIER`, `INVENTORY`).
    - Chi tiết (`description`).
  - Pagination Toolbar: Page info, page size dropdown (10, 20, 50), Previous/Next controls, page numbers.

---

### R2. Unified Form Validation UX

#### 1. Functional Requirements & Behavioral Rules
- **100% `react-hook-form` Adoption**: Every user-submitting form must use `react-hook-form`.
- **The Dual-Action Feedback Protocol**:
  1. **Toast Notification**: On invalid submit, display a brief `react-hot-toast` error message (e.g. `"Vui lòng kiểm tra lại các trường thông tin bắt buộc"` or the first validation error).
  2. **Input Highlighting**: Every field with an active validation error receives red styling:
     `border-red-500 focus:ring-red-500 bg-red-50/10 text-red-900`
  3. **Inline Error Label**: Directly below each invalid field, render:
     `<p className="text-xs text-red-600 mt-1">{errors[fieldName]?.message}</p>`
  4. **Dynamic Recovery**: When the user edits or corrects an invalid field, the red border and error message clear immediately.

#### 2. Form-by-Form Inventory & Audit

| Form Component | Current Implementation | Migration Actions Required | Target Validated Fields |
|----------------|------------------------|----------------------------|-------------------------|
| `LoginForm.jsx` | `useState`, HTML `required` | Convert to `react-hook-form` with `register`, `handleSubmit`, `formState: { errors }` | `email` (required, email regex pattern), `password` (required) |
| `CategoryForm.jsx` | `useForm`, `onError` toast only | Destructure `errors` from `formState`; add conditional `border-red-500` classes and inline `<p className="text-xs text-red-600 mt-1">` | `name` (required), `description` (required), `bgColor` (required), `imgUrl` (image file required) |
| `ItemForm.jsx` | `useForm`, manual for-loop validation | Destructure `errors` from `formState`; add inline errors for single item and dynamic variants (`variants.${vIndex}.sku`, `variants.${vIndex}.basePrice`) | `name` (required), `categoryId` (required), `description` (required), `price` (required if no variants), `variants` (at least 1 required if enabled; each SKU and Base Price required) |
| `UserForm.jsx` | `useForm`, toast only | Destructure `errors`; add conditional red borders and inline `<p>` error labels | `name` (required), `email` (required, regex format), `password` (required) |
| `ModifierGroupForm.jsx` | `useForm`, toast only | Destructure `errors`; add conditional red borders and inline `<p>` error labels for group and nested modifier options | `name` (required), `modifiers.${index}.name` (required) |
| `ManageCustomers.jsx` | `useForm`, inline errors present, but `handleSubmit` missing `onError` | Add `onError` callback in `handleSubmit(onSubmit, onError)` to trigger `toast.error(...)` | `name` (required), `phoneNumber` (required, phone regex pattern) |
| `ManagePromotions.jsx` | `useForm`, partial inline checks, `handleSubmit` missing `onError` | Add `onError` callback to trigger toast; add missing inline error display for `discountValue` and type-specific fields | `name` (required), `code` (required for COUPON), `discountValue` (required, min 0) |
| `StockOperationModal.jsx` | Two forms (`quick` and `check`), inline errors present, but both `handleSubmit` calls omit `onError` | Add `onErrorQuick` and `onErrorCheck` callbacks to trigger toast alerts; add conditional `border-red-500` classes to inputs | `quantity` (required, min 1), `actualCount` (required, min 0) |

---

### R3. Reusable Delete Confirmation Modal

#### 1. Functional Requirements & Behavioral Rules
- **Complete Elimination of `window.confirm`**: Zero calls to `window.confirm` remain in the frontend codebase.
- **Safety & Clarity**: Modal clearly displays the exact name of the entity being deleted (e.g. "Bạn có chắc chắn muốn xóa sản phẩm 'Cà phê sữa đá'?") and a clear danger warning that the action is permanent.
- **Double-Click Prevention**: During the deletion network mutation (`isLoading === true` / `isPending === true`), the confirm button renders a spinner and both the confirm and cancel buttons are disabled.
- **Accessible & Dismissable**: Can be dismissed via Cancel button, close button (X), clicking the backdrop overlay, or pressing ESC.

#### 2. Component Contract: `ConfirmDeleteModal.jsx`
- Location: `Front-end/src/ui/ConfirmDeleteModal.jsx`
- Props Interface:
  ```typescript
  interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string; // Default: "Xác nhận xóa"
    message?: ReactNode | string;
    entityName?: string;
    isLoading?: boolean;
    confirmText?: string; // Default: "Xóa"
    cancelText?: string; // Default: "Hủy"
  }
  ```
- Visual Tokens:
  - Red accent danger icon: `AlertTriangle` or `Trash2` in a `w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center`.
  - Confirm button: `bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg`.
  - Cancel button: `border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg`.
  - Backdrop: `fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4`.

#### 3. Exact 6 Call Sites to Migrate

| # | File | Line | Current Code | Replacement |
|---|------|------|--------------|-------------|
| 1 | `Front-end/src/features/Items/Item.jsx` | 62 | `if (window.confirm(\`Delete item "${item.name}"?\`))` | State `isDeleteOpen`, opens `<ConfirmDeleteModal entityName={item.name} onConfirm={() => deleteItem(item.itemId)} isLoading={isDeleting} />` |
| 2 | `Front-end/src/features/Category/CategoryListItem.jsx` | 33 | `if (window.confirm(\`Delete category "${category.name}"?\`))` | State `isDeleteOpen`, opens `<ConfirmDeleteModal entityName={category.name} onConfirm={() => deleteCategory(category.categoryId)} isLoading={isDeleting} />` |
| 3 | `Front-end/src/features/Users/UserItem.jsx` | 24 | `if (window.confirm(\`Delete user "${user.name}"?\`))` | State `isDeleteOpen`, opens `<ConfirmDeleteModal entityName={user.name} onConfirm={() => deleteUser(user.userId)} isLoading={isDeleting} />` |
| 4 | `Front-end/src/pages/ManageCustomers.jsx` | 248 | `if (window.confirm(\`Delete customer "${customer.name}"?\`))` | State `customerToDelete`, opens `<ConfirmDeleteModal entityName={customerToDelete?.name} onConfirm={() => removeCustomer(customerToDelete.customerId)} isLoading={isDeleting} />` |
| 5 | `Front-end/src/pages/ManagePromotions.jsx` | 604 | `if (window.confirm(\`Delete promotion "${promo.name}"?\`))` | State `promoToDelete`, opens `<ConfirmDeleteModal entityName={promoToDelete?.name} onConfirm={() => removePromotion(promoToDelete.promotionId)} isLoading={isDeleting} />` |
| 6 | `Front-end/src/features/Modifiers/ModifierGroupList.jsx` | 70 | `if (window.confirm(\`Delete modifier group "${group.name}"?\`))` | State `groupToDelete`, opens `<ConfirmDeleteModal entityName={groupToDelete?.name} onConfirm={() => deleteModifierGroup(groupToDelete.groupId)} isLoading={isDeleting} />` |

---

### R4. Dashboard Order Metric Synchronization

#### 1. Functional Requirements & Behavioral Rules
- **Semantic Pairing**: The stat card label is changed from "Total Orders" to **"Today's Orders"**, directly pairing with **"Today's Sales"**.
- **Real-Time Accuracy**: Displays the real-time count of orders placed on the current day.
- **Null Safety**: Displays `0` if data is loading, null, or zero.

#### 2. Technical Binding Details
- Backend Response: `DashboarResponse` returned from `GET /api/v1.0/dashboard`:
  ```java
  public class DashboarResponse {
      private Double todaySales;
      private Long todayOrderCount; // <-- Backend field name
      private List<OrderResponse> recentOrders;
  }
  ```
- Frontend Defect in `Front-end/src/pages/Dashboard.jsx` (lines 46-49):
  - Current label: `Total Orders` -> Change to `Today's Orders`
  - Current binding: `{dashboardData.totalOrderCount ?? 0}` -> Change to `{dashboardData.todayOrderCount ?? 0}`.

---

### R5. Order History Scalability & Table Experience

#### 1. Functional Requirements & Behavioral Rules
- **Server-Side Scalability**: Order History retrieves data in paginated slices using Spring Data `Pageable` rather than fetching all orders into memory.
- **Multi-Field Search**: Supports searching by Order ID (`orderId`), Customer Name (`customerName`), or Phone Number (`phoneNumber`).
- **Payment Status Filter**: Supports filtering by status: All, `COMPLETED`, `PENDING`, `FAILED` (or `CANCELLED`).
- **Internal Table Scroll & Sticky Header**:
  - The viewport is constrained (`h-[calc(100vh-4rem)]`).
  - The page body does not scroll.
  - The order table is wrapped in an internal scroll container (`overflow-auto`).
  - The table header (`thead`) remains fixed at the top (`sticky top-0 z-10 bg-slate-50`).
- **Pagination Toolbar**:
  - Displays record counts: "Hiển thị X - Y trong tổng số Z đơn hàng".
  - Page size selector: 10, 20, 50 orders per page.
  - Page navigation: First, Previous, Page Numbers, Next, Last.

#### 2. Exact Contract Definitions

##### Endpoint: `GET /api/v1.0/orders`
- Controller mapping: `@GetMapping` on `@RequestMapping("/orders")`
- Query Parameters:
  - `page`: `int` (default: 0)
  - `size`: `int` (default: 10)
  - `search`: `String` (optional, default: `""` or null)
  - `status`: `String` (optional, default: `""` or null)
  - `sort`: `String` (default: `createdAt,desc`)
- Response DTO: `OrderPageResponse` (Raw DTO in `learn.java.billingsoftware.io.OrderPageResponse`):
  ```java
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
- HTTP Status Codes:
  - `200 OK`: Successful paginated query.
  - `401 Unauthorized`: Missing or invalid token.

##### Repository Query: `OrderEntityRepository.java`
```java
@Query(value = "SELECT o FROM OrderEntity o WHERE " +
       "(:search IS NULL OR :search = '' OR " +
       " LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
       " LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
       " LOWER(o.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
       "(:status IS NULL OR :status = '' OR o.paymentDetails.status = :status)",
       countQuery = "SELECT COUNT(o) FROM OrderEntity o WHERE " +
       "(:search IS NULL OR :search = '' OR " +
       " LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
       " LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
       " LOWER(o.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
       "(:status IS NULL OR :status = '' OR o.paymentDetails.status = :status)")
Page<OrderEntity> findOrdersPaginated(@Param("search") String search,
                                     @Param("status") PaymentDetails.PaymentStatus status,
                                     Pageable pageable);
```

##### Frontend Hook & Service:
- `OrderService.js`:
  ```javascript
  export const fetchOrdersPaginated = async ({ page = 0, size = 10, search = "", status = "" }) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", size);
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  };
  ```
- `useOrders.js`:
  ```javascript
  export function useOrders({ page = 0, size = 10, search = "", status = "" } = {}) {
    const { isPending: isLoading, data: ordersData, error } = useQuery({
      queryKey: ["orders", { page, size, search, status }],
      queryFn: () => fetchOrdersPaginated({ page, size, search, status }),
      keepPreviousData: true,
    });
    return { isLoading, error, ordersData };
  }
  ```

---

## Cross-Module Dependencies & Shared Architectural Invariants

1. **Strict Raw DTO Pattern**:
   - `ActivityLogPageResponse` and `OrderPageResponse` must strictly follow the system rule in `CONTEXT.md`: return raw DTO objects directly without global generic wrappers (e.g. `{ data, status, message }`).
2. **Spring Security & Authentication Propagation**:
   - Frontend `useLogin` must persist `email` to `localStorage` (alongside `token` and `role`) and `useLogout` must clear it.
   - On the backend, `ActivityLogService` and `ActivityLogController` extract the current user's email via `Authentication.getName()`. For Staff users, this authenticated identity strictly enforces the query filter.
3. **Audit Triggers Coupling**:
   - Domain services (`AuthController`, `OrderServiceImpl`, `ItemServiceImpl`, `CategoryServiceImpl`, `UserServiceImpl`, `PromotionServiceImpl`, `CustomerServiceImpl`, `InventoryServiceImpl`, `ModifierGroupServiceImpl`) take a dependency on `ActivityLogService`.
   - To maintain loose coupling and transaction safety, audit logging must catch all throwables or use Spring Application Events (`@EventListener` / `@Async`).
4. **Tailwind Design System Tokens**:
   - Modals, tables, badges, and form states must strictly adhere to the CRM palette:
     - Primary: Blue-600 (`bg-blue-600`, `text-blue-600`, `focus:ring-blue-500`)
     - Success / Accent: Emerald-600 (`bg-emerald-600`, `text-emerald-600`)
     - Danger / Error: Red-600 (`bg-red-600`, `text-red-600`, `border-red-500`, `bg-red-50/10`)
     - Background: Slate-50 (`bg-slate-50`)
     - Borders: Slate-200 (`border-slate-200`)

---

## Verification & Independent Validation Strategy

1. **Backend Test Suite**:
   - Verify that `./mvnw test-compile` and `./mvnw test` pass cleanly.
   - Add integration tests verifying:
     - `GET /activity-logs`: Staff cannot view other users' logs (returns only their own logs); Admin can view all logs and filter by email and date.
     - `GET /orders`: Returns `OrderPageResponse`, verifies page slices and search filters.
     - `GET /dashboard`: Accurately returns `todayOrderCount`.
     - Non-blocking audit trigger: Logging failures do not abort primary operations.
2. **Frontend Quality Verification**:
   - Verify `npm run lint` in `Front-end/` produces zero ESLint errors or warnings.
   - Verify `npm run build` in `Front-end/` compiles production bundle with zero errors.
   - Zero occurrences of `window.confirm` in `Front-end/src` (verified via `grep`).
   - Manual/Component verification of:
     - Form validation triggering toast notification, red border, and inline error.
     - Confirm delete modal opening and disabling buttons on submit.
     - Order history sticky header behavior during scroll.
