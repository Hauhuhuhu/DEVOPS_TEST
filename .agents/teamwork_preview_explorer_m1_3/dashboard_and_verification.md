# Milestone 1: Dashboard Metric Synchronization & Verification Strategy

## 1. Executive Summary

This document establishes the exact architectural findings, line-level code specifications, TanStack Query cache dynamics, and comprehensive verification criteria for **Milestone 1** of Phase 4 (Activity Logs & Full UX Refinement).

### Scope Addressed
- **Requirement R4**: Dashboard Order Metric Synchronization
- **Requirement R3**: Reusable Delete Confirmation Modal & elimination of `window.confirm` across all 6 call sites
- **Full Verification Protocol**: Automated and manual test strategies ensuring zero regression, 100% build health, and complete spec compliance.

---

## 2. Dashboard Metric Synchronization (R4 Deep Dive)

### 2.1 File Location
`Front-end/src/pages/Dashboard.jsx`

### 2.2 Exact Line Numbers and Proposed Changes

#### A. Header Label Change
- **Target Line**: Line 46
- **Current Content**:
  ```jsx
  <h3 className="text-sm font-medium text-slate-500">Total Orders</h3>
  ```
- **Replacement Content**:
  ```jsx
  <h3 className="text-sm font-medium text-slate-500">Today's Orders</h3>
  ```
- **Rationale**:
  - Semantic alignment with the sibling card on Line 34 (`Today's Sales`).
  - Correctly communicates that the metric represents orders created *today*, matching the backend calculation.

#### B. Property Binding Change
- **Target Line**: Line 48
- **Current Content**:
  ```jsx
  <p className="text-2xl font-bold text-slate-900 mt-1">
    {dashboardData.totalOrderCount ?? 0}
  </p>
  ```
- **Replacement Content**:
  ```jsx
  <p className="text-2xl font-bold text-slate-900 mt-1">
    {dashboardData.todayOrderCount ?? 0}
  </p>
  ```
- **Rationale**:
  - The backend DTO (`DashboarResponse.java`) contains `todayOrderCount`, NOT `totalOrderCount`.
  - Previously, `dashboardData.totalOrderCount` resolved to `undefined`, silently defaulting to `0` via the nullish coalescing operator `?? 0`.
  - Binding to `dashboardData.todayOrderCount ?? 0` ensures real-time accuracy while preserving fallback safety if data is null or loading.

### 2.3 Contextual Code Snippet (Lines 28–52)

```jsx
// Before:
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Coins size={28} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Today's Sales</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(dashboardData.todaySales || 0)}
            </p>
          </div>
        </div>

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
      </div>

// After:
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Coins size={28} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Today's Sales</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(dashboardData.todaySales || 0)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShoppingCart size={28} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500">Today's Orders</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {dashboardData.todayOrderCount ?? 0}
            </p>
          </div>
        </div>
      </div>
```

---

## 3. Backend Evidence Chain & Data Contract

### 3.1 Backend Controller
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/controller/DashboardController.java`
- **Method**:
  ```java
  @GetMapping
  public DashboarResponse getDashboardData() {
      LocalDate today = LocalDate.now();
      Double todaySale = orderService.sumSalesByDate(today);
      Long todayOrderCount = orderService.countByOrderDate(today);
      List<OrderResponse> recentOrders = orderService.findRecentOrders(5);
      return new DashboarResponse(
              todaySale != null ? todaySale: 0.0,
              todayOrderCount != null ? todayOrderCount: 0,
              recentOrders
      );
  }
  ```

### 3.2 Backend DTO
- **File**: `billingsoftware/src/main/java/learn/java/billingsoftware/io/DashboarResponse.java`
- **Fields**:
  ```java
  public class DashboarResponse {
      private Double todaySales;
      private Long todayOrderCount;
      private List<OrderResponse> recentOrders;
  }
  ```
- **Finding**: The JSON payload returned from `GET /api/v1.0/dashboard` has exact structure:
  ```json
  {
    "todaySales": 1250000.0,
    "todayOrderCount": 14,
    "recentOrders": [...]
  }
  ```
  Confirming that `todayOrderCount` is the official, real-time property provided by the backend.

---

## 4. TanStack Query Architecture & Cache Invalidation

### 4.1 Data Fetching Hook
- **File**: `Front-end/src/features/Dashboard/useDashboard.js`
- **Code**:
  ```javascript
  import { useQuery } from "@tanstack/react-query";
  import { fetchDashboardData } from "../../services/DashboardService";

  export function useDashboard() {
    const {
      isPending: isLoading,
      data: dashboardData,
      error,
    } = useQuery({
      queryKey: ["orders", "dashboard"],
      queryFn: fetchDashboardData,
    });

    return { isLoading, error, dashboardData };
  }
  ```
- **Service**: `Front-end/src/services/DashboardService.js` makes `api.get("/dashboard")`.

### 4.2 Cache Invalidation Dynamics
TanStack Query matches query keys **hierarchically by prefix** unless `{ exact: true }` is specified.
Therefore, any query key starting with `["orders"]` is invalidated whenever:
```javascript
queryClient.invalidateQueries({ queryKey: ["orders"] });
```
is called.

### 4.3 Verified Invalidation Trigger Sites
1. `Front-end/src/features/Orders/useCreateOrder.js` (Line 16):
   Triggered on `onSuccess` when a new order is created via the POS/Cart workflow.
2. `Front-end/src/features/Explore/CartSummary.jsx` (Line 169):
   Triggered on `createOrder` success callback.
3. `Front-end/src/features/Payment/PaymentQRCode.jsx` (Line 23):
   Triggered in `useEffect` when PayOS webhook/polling confirms `COMPLETED` payment status.

### 4.4 Stale Time Analysis
- In `Front-end/src/utils/queryClient.js`, default query `staleTime` is `60 * 60 * 1000` (1 hour).
- Because `invalidateQueries({ queryKey: ["orders"] })` is dispatched on every order mutation, active Dashboard subscribers immediately refetch, and unmounted Dashboard components are marked stale so they refetch on the next mount.
- **Architectural Observation**: In a multi-cashier environment where orders may be placed on other terminals, setting `staleTime: 30 * 1000` or `refetchOnWindowFocus: true` in `useDashboard.js` can optionally guarantee background freshness even when no local mutations occur.

---

## 5. Delete Confirmation Modal Call Sites (R3 Overview)

All 6 call sites of `window.confirm` across `Front-end/src/` must be replaced with `ConfirmDeleteModal`:

| # | File Path | Line | Entity Name Binding | Mutation Hook & Invalidation |
|---|-----------|------|---------------------|------------------------------|
| 1 | `Front-end/src/features/Items/Item.jsx` | 62 | `item.name` | `useDeleteItem` -> `deleteItem(item.itemId)` (`isDeleting`) |
| 2 | `Front-end/src/features/Category/CategoryListItem.jsx` | 33 | `category.name` | `useDeleteCategory` -> `deleteCategory(category.categoryId)` (`isDeleting`) |
| 3 | `Front-end/src/features/Users/UserItem.jsx` | 24 | `user.name` | `useDeleteUser` -> `deleteUser(user.userId)` (`isDeleting`) |
| 4 | `Front-end/src/pages/ManageCustomers.jsx` | 248 | `customer.name` | `useDeleteCustomer` -> `removeCustomer(customer.customerId)` (`isDeleting`) |
| 5 | `Front-end/src/pages/ManagePromotions.jsx` | 604 | `promo.name` | `useDeletePromotion` -> `removePromotion(promo.promotionId)` (`isDeleting`) |
| 6 | `Front-end/src/features/Modifiers/ModifierGroupList.jsx` | 70 | `group.name` | `useDeleteModifierGroup` -> `deleteModifierGroup(group.groupId)` (`isDeleting`) |

---

## 6. Milestone 1 Verification Protocol & Acceptance Criteria

Milestone 1 verification is organized into 4 strict gates:

### Gate 1: Static Code Invariants
- **Command 1 (Zero `window.confirm`)**:
  ```powershell
  Get-ChildItem -Path "Front-end/src" -Recurse -Include *.jsx,*.js | Select-String "window\.confirm"
  ```
  - **Pass condition**: 0 matching lines returned.
  - **Fail condition**: Any match found.

- **Command 2 (ESLint Verification)**:
  ```powershell
  npm --prefix Front-end run lint
  ```
  - **Pass condition**: Exit code 0, no errors, no warnings.
  - **Fail condition**: Any ESLint error or unhandled variable.

### Gate 2: Production Bundle Compilation
- **Command 3 (Vite Build)**:
  ```powershell
  npm --prefix Front-end run build
  ```
  - **Pass condition**: Exit code 0, `vite build` generates `dist/index.html` and assets cleanly without syntax or import errors.
  - **Fail condition**: Any compilation or module resolution failure.

### Gate 3: Dashboard Metric Verification
- **Code Inspection**:
  - Line 46 in `Front-end/src/pages/Dashboard.jsx` contains `"Today's Orders"`.
  - Line 48 in `Front-end/src/pages/Dashboard.jsx` contains `{dashboardData.todayOrderCount ?? 0}`.
- **Behavioral Check**:
  - When `dashboardData` returns `{ todayOrderCount: 12 }`, the UI displays `12`.
  - When `todayOrderCount` is `0`, the UI displays `0`.
  - When `dashboardData` is null or `todayOrderCount` is undefined, the UI displays `0`.

### Gate 4: Modal & UX Functional Verification
- **Component**: `Front-end/src/ui/ConfirmDeleteModal.jsx` must be mounted when delete button is clicked in each of the 6 modules.
- **Visual Checks**:
  - Modal title clearly indicates the action (e.g. "Xác nhận xóa" or "Confirm Delete").
  - Entity name (e.g. item name, user email/name, promo title) is prominently displayed in the dialog body.
  - Red danger styling on the confirm/delete button.
  - Cancel button closes the modal without executing deletion.
  - Confirm button initiates the mutation and displays a loading spinner.
  - Both Cancel and Confirm buttons are disabled (`disabled={isLoading}`) while deletion is in-flight to prevent duplicate requests.
  - On successful deletion, modal closes automatically and toast notification appears.

---

## 7. Automated Milestone 1 Verification Script

The implementer and reviewer can run this PowerShell one-liner to verify all static and build gates simultaneously:

```powershell
# Run from repository root:
$confirms = Get-ChildItem -Path "Front-end/src" -Recurse -Include *.jsx,*.js | Select-String "window\.confirm"
if ($confirms.Count -gt 0) {
    Write-Error "FAILED: $($confirms.Count) occurrences of window.confirm remain!"
    $confirms | ForEach-Object { Write-Host "$($_.Path):$($_.LineNumber)" }
    exit 1
} else {
    Write-Host "PASS: Zero occurrences of window.confirm in Front-end/src" -ForegroundColor Green
}

npm --prefix Front-end run lint
if ($LASTEXITCODE -ne 0) { Write-Error "FAILED: npm run lint failed"; exit 1 }
Write-Host "PASS: Frontend lint passed" -ForegroundColor Green

npm --prefix Front-end run build
if ($LASTEXITCODE -ne 0) { Write-Error "FAILED: npm run build failed"; exit 1 }
Write-Host "PASS: Frontend build passed" -ForegroundColor Green

Write-Host "ALL MILESTONE 1 STATIC VERIFICATION GATES PASSED!" -ForegroundColor Cyan
```

---

## 8. Summary of Downstream Instructions for Implementer & Reviewer

1. **Implementer**:
   - Create `Front-end/src/ui/ConfirmDeleteModal.jsx` following Explorer M1_1's design.
   - Update `Front-end/src/pages/Dashboard.jsx` lines 46 and 48 with exact text and binding.
   - Refactor the 6 call sites in `Item.jsx`, `CategoryListItem.jsx`, `UserItem.jsx`, `ManageCustomers.jsx`, `ManagePromotions.jsx`, and `ModifierGroupList.jsx`.
   - Run the automated verification script above.
2. **Reviewer / Victory Auditor**:
   - Run Gate 1, Gate 2, and Gate 3 scripts.
   - Inspect diff of `Dashboard.jsx` to confirm zero unintended changes.
   - Perform spot-checks on the 6 call sites for modal prop fidelity and double-click prevention.
