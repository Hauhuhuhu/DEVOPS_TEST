# Frontend Survey: Phase 4 Activity Logs & Full UX Refinement

**Date**: 2026-09-07  
**Author**: teamwork_preview_explorer  
**Working Directory**: `e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\teamwork_preview_explorer_survey_frontend_3`  
**Target Codebase**: `Front-end/src/`  

---

## Executive Summary

This survey examines the React 19 frontend codebase in `Front-end/` to establish exact current baselines and concrete implementation roadmaps for Phase 4. All 5 required focus areas have been audited down to exact line numbers and code structures:
1. **Form Validation (R2)**: Audited all 8 target forms (`LoginForm`, `CategoryForm`, `ItemForm`, `UserForm`, `ModifierGroupForm`, `ManageCustomers`, `ManagePromotions`, and `StockOperationModal`). Most forms currently use `react-hook-form` partially or inconsistently; `LoginForm` still relies on `useState` with silent returns; 6 forms lack inline error messages and red borders; several lack toast notifications on invalid submission.
2. **Delete Confirmation Modal (R3)**: Exactly 6 occurrences of `window.confirm` exist across the application (`Item.jsx`, `CategoryListItem.jsx`, `UserItem.jsx`, `ManageCustomers.jsx`, `ManagePromotions.jsx`, and `ModifierGroupList.jsx`). An accessible, standardized `ConfirmDeleteModal` built with React Portal and Tailwind design tokens is designed to replace all 6.
3. **Dashboard Metric (R4)**: In `Dashboard.jsx`, the order metric card is mislabeled "Total Orders" and queries `dashboardData.totalOrderCount ?? 0`. The backend DTO (`DashboarResponse.java`) returns `todayOrderCount`, causing the dashboard to permanently render 0. Updating the label to "Today's Orders" and binding to `dashboardData.todayOrderCount ?? 0` immediately fixes this.
4. **Order History Scalability (R5)**: `OrderHistory.jsx` renders all orders without pagination via `/orders/latest` inside a full-page scroll layout without internal scroll boundaries. Redesigning this view into a fixed-height layout (`h-[calc(100vh-4rem)]`) with an internal scroll container, sticky `thead`, search bar, status filter, and pagination controls aligns it with Phase 4 scalability goals.
5. **Activity Log Navigation & UI (R1)**: `Menubar.jsx` possesses a dormant "Activity Log" button that only closes the menu without navigation. `App.jsx` lacks a route for `/activity-logs`. Building `ActivityLogService.js`, `useActivityLogs.js`, and `ActivityLogs.jsx` with date presets, action filters, and user filtering will complete the end-to-end audit system.

---

## 1. Form Validation Audit (R2)

### Target Scope
Standardize all 8 target forms onto `react-hook-form` + `react-hot-toast` dual error UX:
- **Error state styling**: `border-red-500 focus:ring-red-500 bg-red-50/10`
- **Inline message**: `<p className="text-xs text-red-600 mt-1">{errors[field]?.message}</p>`
- **Submission error notification**: Trigger a toast error on invalid submission via `onError` callback in `handleSubmit(onSubmit, onError)` (e.g., `toast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc")` or the first error message).
- **Clearing error**: Immediate clearing of red border and inline message upon correction.

### Detailed Findings per Form

| # | Form Component | Location | Current State | Missing Requirements / Deficiencies | Action Required |
|---|---|---|---|---|---|
| 1 | `LoginForm` | `src/features/Auth/LoginForm.jsx` (lines 1-76) | Uses `useState` for `email` and `password`. Native HTML `required`. `if (!email \|\| !password) return;` silently rejects submit without toast. | • Does NOT use `react-hook-form`<br>• No error toast on invalid submit<br>• No red border on empty/invalid inputs<br>• No inline error messages beneath inputs | Refactor to `useForm()`, bind inputs with `register()`, add email pattern validation, add `onError` with `toast.error`, apply error border classes and inline `<p className="text-xs text-red-600 mt-1">`. |
| 2 | `CategoryForm` | `src/features/Category/CategoryForm.jsx` (lines 1-184) | Uses `useForm()`. Has `onError(errors)` toast for first error. File validation is manual imperative check. | • Does NOT destructure `formState: { errors }`<br>• No red border classes applied on `name`, `description`, `bgColor`, or file upload area<br>• Zero inline error messages rendered beneath inputs | Destructure `errors` from `formState`. Add conditional `border-red-500` classes to `name`, `description`, and color picker. Render `<p className="text-xs text-red-600 mt-1">` for validation errors. |
| 3 | `ItemForm` | `src/features/Items/ItemForm.jsx` (lines 1-496) | Uses `useForm()` and `useFieldArray`. Has `onError` toast. Imperative loops in `onSubmit` check variant SKU and base price. Manual check for image file. | • Does NOT destructure `formState: { errors }`<br>• No red border classes on `name`, `categoryId`, `description`, `price`<br>• Zero inline error messages beneath main inputs<br>• Dynamic variant inputs (`variants.${vIndex}.sku`, `variants.${vIndex}.basePrice`) lack inline error messages and red borders | Destructure `errors`. Register `variants.${vIndex}.sku` and `basePrice` with validation rules (`required`, `min: 0`). Apply red border classes and inline error labels beneath all invalid fields (both top-level item fields and dynamic variant fields). |
| 4 | `UserForm` | `src/features/Users/UserForm.jsx` (lines 1-108) | Uses `useForm()`. Inputs have `required` and `pattern` validation rules in `register()`. Has `onError` toast. | • Does NOT destructure `formState: { errors }`<br>• No red border classes on `name`, `email`, `password`<br>• Zero inline error messages rendered beneath inputs | Destructure `errors` from `formState`. Apply `border-red-500` classes on active errors. Render `<p className="text-xs text-red-600 mt-1">{errors[field]?.message}</p>` beneath each field. |
| 5 | `ModifierGroupForm` | `src/features/Modifiers/ModifierGroupForm.jsx` (lines 1-203) | Uses `useForm()` and `useFieldArray`. Has `onError` toast. `modifiers.${index}.name` has `required` rule. | • Does NOT destructure `formState: { errors }`<br>• No red border classes on `name` or modifier options<br>• Zero inline error messages beneath group name or modifier option inputs | Destructure `errors` from `formState`. Apply red border classes to invalid `name` and `modifiers.${index}.name`. Render inline error messages. |
| 6 | `ManageCustomers` | `src/pages/ManageCustomers.jsx` (lines 1-272) | Uses `useForm()`. Destructures `errors`. HAS red border classes and inline error messages for `name` and `phoneNumber`. | • `handleSubmit(onSubmit)` is called WITHOUT `onError` callback!<br>• Submitting invalid fields does NOT trigger a toast notification | Add `onError` callback to `handleSubmit(onSubmit, onError)`: `const onError = () => toast.error("Vui lòng kiểm tra lại thông tin khách hàng");` |
| 7 | `ManagePromotions` | `src/pages/ManagePromotions.jsx` (lines 1-629) | Uses `useForm()`. Destructures `errors`. Has red border classes and inline error messages for `name` and `code`. | • `handleSubmit(onSubmit)` is called WITHOUT `onError` callback!<br>• Submitting invalid fields does NOT trigger a toast notification<br>• Missing red borders and inline messages for other conditional fields (e.g. `discountValue`, `startDate`, `endDate`) | Add `onError` callback to `handleSubmit`. Standardize error classes across all promotion type fields (`discountValue`, `startTime`, `endTime`, etc.). |
| 8 | `StockOperationModal` | `src/features/Inventory/StockOperationModal.jsx` (lines 1-524) | Uses two `useForm()` instances (`Quick` and `Check`). Renders inline error message `{errors.quantity.message}` and `{errorsCheck.actualCount.message}`. | • Inputs do NOT have red border classes (`border-red-500`) applied<br>• Neither form passes `onError` callback to `handleSubmit`<br>• No toast error notification on invalid submit | Add `onError` callbacks displaying error toasts. Apply conditional `border-red-500 focus:ring-red-500` classes to `quantity` and `actualCount` inputs when errors exist. |

---

## 2. Delete Confirmation Modal Audit (R3)

### Current Occurrences of `window.confirm`
A ripgrep search (`grep_search`) for `window.confirm` across `Front-end/src/` returned **exactly 6 occurrences**:

1. **`Front-end/src/features/Items/Item.jsx:62`**:
   ```javascript
   if (window.confirm(`Delete item "${item.name}"?`)) {
     deleteItem(item.itemId);
   }
   ```
2. **`Front-end/src/features/Category/CategoryListItem.jsx:33`**:
   ```javascript
   if (window.confirm(`Delete category "${category.name}"?`)) {
     deleteCategory(category.categoryId);
   }
   ```
3. **`Front-end/src/features/Users/UserItem.jsx:24`**:
   ```javascript
   if (window.confirm(`Delete user "${user.name}"?`)) {
     deleteUser(user.userId);
   }
   ```
4. **`Front-end/src/pages/ManageCustomers.jsx:248`**:
   ```javascript
   if (window.confirm(`Delete customer "${customer.name}"?`)) {
     removeCustomer(customer.customerId);
   }
   ```
5. **`Front-end/src/pages/ManagePromotions.jsx:604`**:
   ```javascript
   if (window.confirm(`Delete promotion "${promo.name}"?`)) {
     removePromotion(promo.promotionId);
   }
   ```
6. **`Front-end/src/features/Modifiers/ModifierGroupList.jsx:70`**:
   ```javascript
   if (window.confirm(`Delete modifier group "${group.name}"?`)) {
     deleteModifierGroup(group.groupId);
   }
   ```

### Modal Architecture & New Component Specification
- Existing modal infrastructure: `src/ui/Modal.jsx` provides a portal overlay using `createPortal(..., document.body)` and `useOutsideClick`.
- Proposed component: `Front-end/src/ui/ConfirmDeleteModal.jsx`
  - **Props**:
    - `isOpen`: boolean
    - `onClose`: function
    - `onConfirm`: function
    - `title`: string (e.g., "Xác nhận xóa sản phẩm", "Delete Customer")
    - `itemName`: string (e.g., entity name)
    - `message`: optional string
    - `isLoading`: boolean (mutation pending state)
  - **Visual Elements**:
    - Danger icon: `AlertTriangle` or `Trash2` inside a rounded red badge (`w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center`).
    - Clear confirmation text: "Bạn có chắc chắn muốn xóa **[itemName]**? Thao tác này không thể hoàn tác."
    - Action buttons:
      - Cancel: `button` with `border border-slate-300 text-slate-700 hover:bg-slate-50`
      - Confirm: `button` with `bg-red-600 hover:bg-red-700 text-white font-medium`
    - Loading behavior: When `isLoading` is true, both buttons are disabled, confirm button shows `<Spinner size={16} className="text-white" />` and prevents multiple clicks.
    - Dismissal: Supports closing via backdrop click, Escape key, or Cancel button.

---

## 3. Dashboard Metric Audit (R4)

### Component Inspected
- `Front-end/src/pages/Dashboard.jsx` (lines 41-51)
- Backend Controller: `billingsoftware/src/main/java/learn/java/billingsoftware/controller/DashboardController.java`
- Backend DTO: `billingsoftware/src/main/java/learn/java/billingsoftware/io/DashboarResponse.java`

### Observation
In `Dashboard.jsx`:
```jsx
<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
    <ShoppingCart size={28} />
  </div>
  <div>
    <h3 className="text-sm font-medium text-slate-500">Total Orders</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">
      {dashboardData.totalOrderCount ?? 0}
    </p>
  </div>
</div>
```

In `DashboarResponse.java`:
```java
public class DashboarResponse {
    private Double todaySales;
    private Long todayOrderCount;
    private List<OrderResponse> recentOrders;
}
```

### Cause of Bug & Required Fix
1. **Name Mismatch**: The backend calculates `orderService.countByOrderDate(today)` and exposes it as `todayOrderCount`. The frontend attempts to read `dashboardData.totalOrderCount`, which is `undefined`, causing it to always fallback to `0`.
2. **Semantic Mismatch**: The metric next to it is "Today's Sales". The card header should read "Today's Orders".
3. **Fix**:
   - Change line 46: `<h3 className="text-sm font-medium text-slate-500">Today's Orders</h3>`
   - Change line 48: `{dashboardData.todayOrderCount ?? 0}`

---

## 4. Order History Scalability & Table Audit (R5)

### Component Inspected
- `Front-end/src/pages/OrderHistory.jsx` (lines 1-161)
- `Front-end/src/features/Orders/useOrders.js` (lines 1-16)
- `Front-end/src/services/OrderService.js` (lines 1-19)

### Current Deficiencies
1. **No Pagination**:
   - Currently calls `latestOrders` which hits `GET /orders/latest` without parameters.
   - All orders in database are fetched in a single JSON list and rendered at once.
2. **No Search or Filter**:
   - Zero search input for Order ID, Customer Name, or Phone Number.
   - Zero status filter (All, COMPLETED, PENDING, CANCELLED).
3. **No Internal Scroll Container**:
   - Wrapper is `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">`.
   - The entire browser window scrolls vertically. The `sticky top-0` on `thead` does not stay pinned relative to the viewport because the table container expands infinitely.

### Implementation Plan for R5
1. **Backend Integration**:
   - Backend endpoint `GET /orders` accepting `page`, `size`, `search`, `status` returning `OrderPageResponse` (`content`, `totalElements`, `totalPages`, `currentPage`, `pageSize`).
2. **Service & Hook Update**:
   - `OrderService.js`: Add `fetchOrdersPaginated({ page, size, search, status })` calling `GET /orders`.
   - `useOrders.js`: Update hook to accept `{ page = 0, size = 10, search = "", status = "" }` and include these parameters in the React Query key: `["orders", { page, size, search, status }]`.
3. **UI Layout Refactoring in `OrderHistory.jsx`**:
   - Viewport constraint: `h-[calc(100vh-4rem)] flex flex-col p-6 bg-slate-50 overflow-hidden` (consistent with `ManageCustomers`).
   - Top Toolbar:
     - Search input with search icon, clear button, debouncing or enter-to-search.
     - Payment status selector (`All`, `COMPLETED`, `PENDING`, `CANCELLED`).
     - Total orders counter badge.
   - Table Container: `flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden`.
   - Table Scroll Area: `flex-1 overflow-auto` (scrolling is internal; page never scrolls).
   - Table Header: `bg-slate-50 sticky top-0 z-10`.
   - Bottom Pagination Bar:
     - Record counter: "Showing X to Y of Z orders".
     - Page size dropdown: `10 / page`, `20 / page`, `50 / page`.
     - Navigation controls: `Previous`, page numbers with active indicator, `Next`.

---

## 5. Activity Log Subsystem UI & Navigation Audit (R1)

### Navigation Bar Inspection (`Menubar.jsx`)
- Located in `src/ui/Menubar.jsx`:
  - Lines 139-145:
    ```jsx
    <button
      type="button"
      onClick={() => setIsProfileOpen(false)}
      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <Activity size={16} /> Activity Log
    </button>
    ```
  - **Issue**: Clicking "Activity Log" simply executes `setIsProfileOpen(false)`. It does not navigate anywhere.
  - **Required Change**: Replace with `<NavLink to="/activity-logs" onClick={() => setIsProfileOpen(false)} ...>` or use `useNavigate()` to route to `/activity-logs`.

### Router Configuration (`App.jsx`)
- Located in `src/App.jsx`:
  - Currently contains routes for `/dashboard`, `/explore`, `/orders`, and Admin management routes (`/items`, `/categories`, `/modifiers`, `/users`, `/promotions`, `/customers`).
  - **Issue**: `/activity-logs` is not registered.
  - **Placement**: Must be placed under `ProtectedRoute` > `AppLayout` alongside `/orders` and `/dashboard` (NOT inside `AdminRoute`), because Staff users must also be able to access the page to view their own audit logs.

### Auth Identity Integration
- In `src/features/Auth/useLogin.js`: The backend returns `user.data.email`, but only `token` and `role` are stored in `localStorage` and React Query cache.
- In `src/hooks/useCurrentUser.js`: Only `token` and `role` are exposed.
- **Enhancement**: Save `email` to `localStorage` during login, and expose `email: user?.email` in `useCurrentUser()`. This allows the Activity Log page to know the logged-in user's email for default filtering and role-based UI.

### New Module Requirements for Activity Logs
1. **`src/services/ActivityLogService.js`**:
   - `fetchActivityLogs({ page, size, userEmail, actionType, startDate, endDate })` -> calls `GET /activity-logs` with params.
2. **`src/features/ActivityLogs/useActivityLogs.js`**:
   - TanStack React Query hook with queryKey `["activity-logs", filters]`.
3. **`src/pages/ActivityLogs.jsx`**:
   - Header with `Activity` icon, title "Nhật ký hoạt động", total counter.
   - Date preset buttons: "Hôm nay", "7 ngày qua", "30 ngày qua", "Tất cả", or custom date inputs.
   - Action type dropdown: Tất cả, Đăng nhập (`LOGIN`), Đơn hàng (`ORDER`), Danh mục (`CATEGORY`), Sản phẩm (`ITEM`), v.v.
   - User dropdown (for Admin only, powered by `useUsers()`): Filter by specific user or view all.
   - Paginated table showing:
     - Thời gian (formatted date & time)
     - Người thực hiện (User Email)
     - Hành động (color-coded badge: `LOGIN` = blue, `CREATE` = emerald, `UPDATE` = amber, `DELETE` = red)
     - Đối tượng (Entity type & entity ID)
     - Mô tả chi tiết (Description)
   - Pagination controls matching the Order History pagination bar pattern.

---

## 6. Build and Code Quality Status

A baseline check was conducted in `Front-end/`:
- `npm run lint`: Exited with **code 0** (zero ESLint errors or warnings).
- `npm run build`: Exited with **code 0** (production bundle generated cleanly in ~980ms).

All proposed additions and modifications will maintain this zero-lint, zero-warning standard.
