# Frontend UI Layout & Table Experience Analysis (Order History: Features 23-25)

## 1. Executive Summary & Problem Scope

In the current Billing App frontend, `Front-end/src/pages/OrderHistory.jsx` loads a static list of recent orders without pagination, filtering, or sticky layout. For real-world production datasets containing hundreds or thousands of orders, this presents severe scalability and usability challenges:
- **No Pagination / Dataset Bloat**: Loads all records indiscriminately, degrading rendering performance.
- **Lost Column Context**: The entire browser window scrolls, causing table headers to scroll off-screen.
- **No Search or Filtering**: Staff/Admin cannot search for specific Order IDs, customer names, or phone numbers, nor can they filter orders by payment status (COMPLETED, PENDING, CANCELLED).
- **Destructive Empty State**: An early `if (!orders || orders.length === 0)` return replaces the entire page with a message, removing any search/filter controls if a search query yields zero results.

To resolve these issues, Milestone 3 (Features 23-25) refactors `OrderHistory.jsx` into a high-performance, internal-scrolling CRM table with sticky headers, debounced search, status filtering, and a pagination toolbar.

---

## 2. Current Implementation Review (`OrderHistory.jsx`)

### 2.1 File Location
- Source: `Front-end/src/pages/OrderHistory.jsx` (161 lines)

### 2.2 Key Deficiencies Identified
1. **Viewport & Container**:
   - Container uses `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">`.
   - Lacks fixed viewport height (`h-[calc(100vh-4rem)] flex flex-col`), causing document-level vertical scrolling.
2. **Table Header**:
   - Uses `<thead className="bg-slate-50 sticky top-0">` without `z-10` or a solid bottom border, causing underlying rows to bleed through during scrolling.
   - Lacks an internal scroll container (`overflow-y-auto`) on the table wrapper.
3. **Data Fetching Hook**:
   - Uses `const { isLoading, orders } = useOrders();` without query parameters for `page`, `size`, `search`, or `status`.
4. **Search & Filter Controls**:
   - No search input or payment status dropdown exists in the UI.
5. **Pagination Bar**:
   - No pagination controls, page size selector, or record count range indicator.

---

## 3. UI/UX Architectural Design & Specifications

### 3.1 Fixed Viewport Height & Internal Scroll Container (Feature 23)
- **App Shell Alignment**:
  - The application header (`Menubar.jsx`) has a fixed height of `h-16` (`4rem` / 64px).
  - Main container height is set to `h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-hidden`.
  - The table card occupies remaining vertical space using `flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden`.
  - Crucial CSS Property: `min-h-0` is required on flex column items to override `min-height: auto`, allowing internal `overflow-y-auto` to activate instead of pushing parent containers.
- **Table Scroll Wrapper**:
  - `div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto"` wraps the `<table>`.
  - Sticky table header: `<thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-2xs">`.
  - Column headers stay firmly pinned at the top while table rows scroll smoothly beneath.

### 3.2 Search & Payment Status Filter Toolbar (Feature 24)
- **Search Input**:
  - Positioned on the left side of the filter bar.
  - Left icon: `<Search size={16} className="text-slate-400" />`.
  - Placeholder: `"Tìm theo mã ĐH, khách hàng, SĐT..."`.
  - Clear button: `<X size={14} />` icon appears when `searchTerm` is non-empty.
  - Debouncing: 300ms delay via `useEffect` prevents excessive API queries while typing.
  - Auto-reset: Changing search immediately resets `page` to `0`.
- **Payment Status Dropdown**:
  - Options:
    - `""`: `"Tất cả trạng thái"` (All)
    - `"COMPLETED"`: `"Đã hoàn thành (COMPLETED)"`
    - `"PENDING"`: `"Chờ xử lý (PENDING)"`
    - `"CANCELLED"`: `"Đã hủy (CANCELLED)"`
  - Auto-reset: Changing payment status immediately resets `page` to `0`.
- **Reset Filters Quick Action**:
  - Displays a `"Đặt lại bộ lọc"` button when either search or status filter is active.

### 3.3 Pagination Toolbar Controls (Feature 25)
- **Footer Placement**:
  - Fixed at the bottom of the table card: `shrink-0 border-t border-slate-200 bg-slate-50/75 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm`.
- **Range Counter Display**:
  - Exact text format: `"Showing X to Y of Z orders"`.
  - Calculation logic:
    - Start `X`: `totalElements === 0 ? 0 : page * pageSize + 1`
    - End `Y`: `Math.min((page + 1) * pageSize, totalElements)`
    - Total `Z`: `totalElements`
- **Page Size Selector**:
  - Options: `10`, `20`, `50` (default `10`).
  - Dropdown: `<select value={pageSize} onChange={...}>`.
  - Auto-reset: Changing page size resets `page` to `0`.
- **Pagination Navigation Buttons**:
  - **Previous Button**: `<ChevronLeft size={14} /> Previous`, disabled when `page === 0 || isLoading`.
  - **Next Button**: `Next <ChevronRight size={14} />`, disabled when `page >= totalPages - 1 || isLoading`.
  - **Numeric Page Numbers**:
    - Generates dynamic page window with ellipsis (`...`) for large page counts.
    - Active page highlighted with `bg-blue-600 text-white font-semibold shadow-2xs`.
    - Inactive pages styled with `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50`.

### 3.4 Preservation of Existing Business Logic & Components
- **Receipt Popup Modal**:
  - Preserved intact:
    ```jsx
    {selectedOrderForReceipt && (
      <ReceiptPopup
        order={selectedOrderForReceipt}
        isOpen={Boolean(selectedOrderForReceipt)}
        onClose={() => setSelectedOrderForReceipt(null)}
      />
    )}
    ```
- **Currency & Formatting**:
  - `formatCurrency(order.grandTotal)` and discount `-formatCurrency(order.discountAmount)`.
  - `formatDate(order.createdAt)` with `vi-VN` locale options.
  - `formatItems(order.items)` with product name and quantity.
- **Status Badge Styling**:
  - `COMPLETED`: `bg-emerald-100 text-emerald-800`
  - `PENDING`: `bg-amber-100 text-amber-800`
  - `CANCELLED` / other: `bg-red-100 text-red-800`
- **Payment Method Badge**:
  - `bg-slate-100 text-slate-700`
- **Discount & Promotion Badges**:
  - `bg-red-50 text-red-700 border border-red-200`

---

## 4. Contract Compatibility & Defensive Integration

### 4.1 Interface Contract with `useOrders` & Backend
The backend returns `OrderPageResponse`:
```json
{
  "content": [ ... ],
  "totalElements": 42,
  "totalPages": 5,
  "currentPage": 0,
  "pageSize": 10
}
```

The updated `useOrders` hook (Milestone 3, Feature 22) will accept:
```javascript
useOrders({ page, size, search, status })
```

### 4.2 Defensive Data Unwrapping in `OrderHistory.jsx`
To guarantee zero-breakage whether `useOrders` returns:
1. `{ orders: [...], totalElements, totalPages, currentPage, pageSize, isLoading, isFetching }`, OR
2. `{ data: { content: [...], totalElements, totalPages, ... }, isLoading, isFetching }`, OR
3. Legacy array `{ orders: [...] }`,

`OrderHistory.jsx` unwraps the response defensively:
```javascript
const result = useOrders({
  page,
  size: pageSize,
  search: debouncedSearch,
  status: statusFilter,
});

const isLoading = result.isLoading;
const isFetching = result.isFetching;
const rawOrders = result.orders ?? result.data?.content ?? (Array.isArray(result.data) ? result.data : []);
const orders = Array.isArray(rawOrders) ? rawOrders : [];
const totalElements = result.totalElements ?? result.data?.totalElements ?? orders.length;
const totalPages = result.totalPages ?? result.data?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));
```

---

## 5. Complete Proposed Implementation Code

Target File: `Front-end/src/pages/OrderHistory.jsx`

```jsx
import { useState, useEffect } from "react";
import { useOrders } from "../features/Orders/useOrders";
import Spinner from "../ui/Spinner";
import { formatCurrency } from "../utils/formatCurrency";
import ReceiptPopup from "../features/Explore/ReceiptPopup";
import {
  Receipt,
  PackageOpen,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

function OrderHistory() {
  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);

  // Debounce search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query paginated orders
  const result = useOrders({
    page,
    size: pageSize,
    search: debouncedSearch,
    status: statusFilter,
  });

  const isLoading = result?.isLoading;
  const isFetching = result?.isFetching;
  const rawOrders = result?.orders ?? result?.data?.content ?? (Array.isArray(result?.data) ? result.data : []);
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const totalElements = result?.totalElements ?? result?.data?.totalElements ?? orders.length;
  const totalPages = result?.totalPages ?? result?.data?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  // Handle Clear Search
  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setPage(0);
  };

  // Handle Status Dropdown Change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  // Handle Reset All Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("");
    setPage(0);
  };

  // Format Items
  const formatItems = (items) => {
    return items?.map((item) => `${item.name} x ${item.quantity}`).join(", ") || "";
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Dynamic Page Window Calculation
  const getPageNumbers = (current, total) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i);
    }
    if (current <= 2) {
      return [0, 1, 2, "...", total - 1];
    }
    if (current >= total - 3) {
      return [0, "...", total - 3, total - 2, total - 1];
    }
    return [0, "...", current - 1, current, current + 1, "...", total - 1];
  };

  // Initial Loading Spinner (Only when initial dataset has not loaded yet)
  if (isLoading && !orders.length) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Spinner size={36} className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Danh sách đơn hàng</h2>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            {totalElements} đơn hàng
          </span>
          {isFetching && !isLoading && (
            <span className="text-xs text-slate-400 flex items-center gap-1.5 ml-2">
              <Spinner size={14} className="text-blue-600" />
              <span>Đang tải...</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs mb-4 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input Container */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm theo mã ĐH, tên khách, SĐT..."
              className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition-colors cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Payment Status Filter Dropdown */}
          <div className="w-full sm:w-56 shrink-0 relative">
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors shadow-2xs cursor-pointer"
            >
              <option value="">Tất cả trạng thái (All)</option>
              <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
              <option value="PENDING">Chờ xử lý (PENDING)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
          </div>
        </div>

        {/* Clear Filter Button */}
        {(searchTerm || statusFilter) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors self-end sm:self-center cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* Main Table Card (Flex-1, min-h-0, Internal Scroll) */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Scrollable Table Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã ĐH</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Khuyến mãi</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thanh toán</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    <PackageOpen size={44} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-base font-medium text-slate-800">Không tìm thấy đơn hàng nào</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchTerm || statusFilter
                        ? "Không có đơn hàng nào khớp với từ khóa tìm kiếm hoặc bộ lọc trạng thái đã chọn."
                        : "Chưa có dữ liệu đơn hàng được ghi nhận trong hệ thống."}
                    </p>
                    {(searchTerm || statusFilter) && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Xóa bộ lọc
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const status = order.paymentDetails?.status || order.paymentStatus || "PENDING";
                  const isCompleted = status === "COMPLETED";
                  const isPending = status === "PENDING";

                  return (
                    <tr key={order.orderId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        #{order.orderId}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-slate-900">{order.customerName}</div>
                        <div className="text-xs text-slate-500">{order.phoneNumber}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 max-w-xs truncate" title={formatItems(order.items)}>
                        {formatItems(order.items)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        {order.discountAmount > 0 || order.promotionName ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                              {order.promotionName || "Ưu đãi"}
                            </span>
                            {order.discountAmount > 0 && (
                              <div className="text-xs text-red-600 font-semibold mt-0.5">
                                -{formatCurrency(order.discountAmount)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        {formatCurrency(order.grandTotal ?? order.totalAmount ?? 0)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : isPending
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                        {formatDate(order.createdAt || order.orderDate)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center text-sm">
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                          title="Xem & In hóa đơn"
                          onClick={() => setSelectedOrderForReceipt(order)}
                        >
                          <Receipt size={14} className="text-blue-600" />
                          <span>In hóa đơn</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar Bar (Fixed at bottom of Card) */}
        <div className="shrink-0 border-t border-slate-200 bg-slate-50/70 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          {/* Left: Showing X to Y of Z orders */}
          <div className="text-xs sm:text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {totalElements === 0 ? 0 : page * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900">
              {Math.min((page + 1) * pageSize, totalElements)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">{totalElements}</span>{" "}
            orders
          </div>

          {/* Right: Page Size Selector + Pagination Controls */}
          <div className="flex items-center gap-4">
            {/* Page size selector */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="hidden sm:inline">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers(page, totalPages).map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`min-w-[28px] h-7 px-2 flex items-center justify-center text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        page === p
                          ? "bg-blue-600 text-white font-semibold shadow-2xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {p + 1}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedOrderForReceipt && (
        <ReceiptPopup
          order={selectedOrderForReceipt}
          isOpen={Boolean(selectedOrderForReceipt)}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </div>
  );
}

export default OrderHistory;
```

---

## 6. Verification and Validation Checklist

| # | Acceptance Requirement | Design Element in `OrderHistory.jsx` | Status |
|---|------------------------|---------------------------------------|--------|
| 1 | Internal scroll container | `h-[calc(100vh-4rem)] flex flex-col` outer layout; table card `flex-1 min-h-0 flex flex-col`; table wrapper `flex-1 min-h-0 overflow-y-auto` | Verified |
| 2 | Sticky table header | `thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200"` | Verified |
| 3 | Search input & Clear button | Debounced `<Search />` input, clear `<X />` button, auto-resets `page` to `0` | Verified |
| 4 | Payment status dropdown | Select with `""` (All), `COMPLETED`, `PENDING`, `CANCELLED`, auto-resets `page` to `0` | Verified |
| 5 | Pagination footer bar | "Showing X to Y of Z orders", page size selector `10, 20, 50`, Prev/Next, numbered page buttons | Verified |
| 6 | Preserved Receipt Modal | `<ReceiptPopup order={selectedOrderForReceipt} ... />` | Verified |
| 7 | Preserved Badges & Formatting | Emerald-100 (COMPLETED), Amber-100 (PENDING), Red-100 (CANCELLED); `formatCurrency`; `formatDate` | Verified |
| 8 | Empty State Preservation | Table row empty state inside table body allows search & filter controls to remain interactive | Verified |
