# Frontend Order Service & Hook Pagination Analysis (Features 21-22)

## 1. Executive Summary & Objective

This document details the architectural exploration, exact code designs, and migration plan for the frontend Order Service and TanStack Query hook in the Billing App. This work fulfills **Feature 21** (`Frontend Order Service Pagination`) and **Feature 22** (`useOrders Pagination Hook`) under **Milestone 3 (Order History Scalability & Table Experience)**.

The primary goal is transitioning Order History from an unpaginated `/orders/latest` call to a robust, server-side paginated, searchable, and filterable data stream via `GET /api/v1.0/orders`, while guaranteeing **100% backward compatibility** with existing consumers and retaining the project's **Raw DTO** invariant.

---

## 2. Codebase Inventory & Current State Inspection

### 2.1 File Locations & Dependencies

| File Path | Role | Consumers / Callers |
|-----------|------|---------------------|
| `Front-end/src/services/OrderService.js` | Axios API service layer for orders | `useOrders.js`, `useCreateOrder.js`, `usePolledOrderData.js` |
| `Front-end/src/features/Orders/useOrders.js` | TanStack Query hook for orders | `Front-end/src/pages/OrderHistory.jsx` |
| `Front-end/src/pages/OrderHistory.jsx` | Order list presentation UI | Route `/order-history` |
| `Front-end/src/features/Orders/useCreateOrder.js` | Mutation hook for creating orders | `Front-end/src/features/Explore/CartSummary.jsx` |
| `Front-end/src/features/Payment/PaymentQRCode.jsx` | Payment polling & order status verification | POS PayOS Checkout |
| `Front-end/src/features/Dashboard/useDashboard.js` | Dashboard order metrics & recent orders | `Front-end/src/pages/Dashboard.jsx` |

### 2.2 Current Implementation of `OrderService.js`
```javascript
// Front-end/src/services/OrderService.js (Lines 1-19)
import api from "../utils/axiosConfig";

export const latestOrders = async () => {
  const response = await api.get("/orders/latest");
  return response.data;
};

export const createOrder = async (order) => {
  return await api.post("/orders", order);
};

export const deleteOrder = async (orderId) => {
  return await api.delete(`/orders/${orderId}`);
};

export const getOrderById = async (orderId) => {
  return await api.get(`/orders/${orderId}`);
};
```

**Observations & Limitations:**
1. Only provides `latestOrders()` which calls `GET /orders/latest` returning a flat list of up to 10 recent orders.
2. Lacks any method for querying orders with pagination (`page`, `size`), text search, or status filtering.
3. Does not support passing pagination parameters to `GET /orders`.

### 2.3 Current Implementation of `useOrders.js`
```javascript
// Front-end/src/features/Orders/useOrders.js (Lines 1-16)
import { useQuery } from "@tanstack/react-query";
import { latestOrders } from "../../services/OrderService";

export function useOrders() {
  const {
    isPending: isLoading,
    data: orders,
    error,
  } = useQuery({
    queryKey: ["orders", "list"],
    queryFn: latestOrders,
  });

  return { isLoading, error, orders };
}
```

**Observations & Limitations:**
1. Fixed query key `["orders", "list"]` without parameter variation.
2. Accepts zero parameters; cannot be instructed to fetch page 2 or filter by `COMPLETED` orders.
3. Assumes `orders` is a flat array `List<OrderResponse>`. When backend switches to `OrderPageResponse` (`{ content, totalElements, totalPages, currentPage, pageSize }`), calling `orders.length` or `orders.map()` directly on `orders` would crash with `TypeError: orders.map is not a function`.

### 2.4 Consumer Inspection: `OrderHistory.jsx`
```javascript
// Front-end/src/pages/OrderHistory.jsx (Lines 8-10, 36, 51, 73)
function OrderHistory() {
  const { isLoading, orders } = useOrders();
  ...
  if (!orders || orders.length === 0) { ... }
  ...
  <span className="...">{orders.length} đơn hàng</span>
  ...
  {orders.map((order) => { ... })}
```
Any updated hook **must continue to supply `orders` as an array** (or empty array fallback `[]`) so that existing destructured properties work seamlessly without runtime errors.

---

## 3. Backend API Contract Alignment (Milestone 3.1)

Based on the backend architecture and `PROJECT.md`, the paginated orders endpoint has the following contract:

- **Endpoint**: `GET /api/v1.0/orders`
- **Query Parameters**:
  - `page` (int, default `0`): 0-indexed page number
  - `size` (int, default `10`): Number of orders per page
  - `search` (string, optional): Search term matched across `orderId` (order code), `customerName`, and `phoneNumber`
  - `status` (string, optional): Payment status matching `PaymentStatus` enum (`PENDING`, `COMPLETED`, `CANCELLED`)
- **Response Schema** (`OrderPageResponse` DTO):
  ```json
  {
    "content": [
      {
        "orderId": "ORD-12345",
        "customerName": "Nguyen Van A",
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
- **Architectural Invariant**: Raw DTO convention — Axios `response.data` returns the raw JSON object without nested wrappers like `{ data: { content: ... } }`.

---

## 4. Exact Code Specification: `OrderService.js` (Feature 21)

### 4.1 Design Requirements
1. Add `getOrders(page = 0, size = 10, search = "", status = "")` calling `GET /orders` via Axios.
2. Support **both positional arguments** `getOrders(page, size, search, status)` **and options object** `getOrders({ page, size, search, status })` to prevent parameter mismatch bugs across different developer styles.
3. Sanitize parameters:
   - Trim whitespace from `search`. If empty after trimming, omit from query string.
   - Normalize `status`. If empty, whitespace, or `"ALL"`, omit from query string so backend retrieves all orders regardless of status.
4. Preserve all existing exports: `latestOrders`, `createOrder`, `deleteOrder`, `getOrderById`.

### 4.2 Proposed Implementation Code
```javascript
// Target File: Front-end/src/services/OrderService.js
import api from "../utils/axiosConfig";

/**
 * Fetch the latest unpaginated orders (retained for backward compatibility).
 * @returns {Promise<Array>} List of latest OrderResponse items
 */
export const latestOrders = async () => {
  const response = await api.get("/orders/latest");
  return response.data;
};

/**
 * Fetch paginated orders with optional search and payment status filters.
 * Supports both positional parameters and options object:
 *   getOrders(page, size, search, status)
 *   getOrders({ page, size, search, status })
 *
 * @param {number|Object} page - 0-indexed page index (default: 0) or options object
 * @param {number} [size=10] - Number of orders per page (default: 10)
 * @param {string} [search=""] - Optional search query (matches orderId, customerName, phoneNumber)
 * @param {string} [status=""] - Optional payment status (PENDING, COMPLETED, CANCELLED, or ALL)
 * @returns {Promise<Object>} OrderPageResponse { content, totalElements, totalPages, currentPage, pageSize }
 */
export const getOrders = async (page = 0, size = 10, search = "", status = "") => {
  let p = page;
  let s = size;
  let q = search;
  let st = status;

  // Support object parameter style: getOrders({ page, size, search, status })
  if (typeof page === "object" && page !== null) {
    p = page.page ?? 0;
    s = page.size ?? 10;
    q = page.search ?? "";
    st = page.status ?? "";
  }

  const params = {
    page: p,
    size: s,
  };

  if (q && typeof q === "string" && q.trim() !== "") {
    params.search = q.trim();
  }

  if (st && typeof st === "string" && st.trim() !== "" && st.toUpperCase() !== "ALL") {
    params.status = st.trim().toUpperCase();
  }

  const response = await api.get("/orders", { params });
  return response.data;
};

export const createOrder = async (order) => {
  return await api.post("/orders", order);
};

export const deleteOrder = async (orderId) => {
  return await api.delete(`/orders/${orderId}`);
};

export const getOrderById = async (orderId) => {
  return await api.get(`/orders/${orderId}`);
};
```

---

## 5. Exact Code Specification: `useOrders.js` (Feature 22)

### 5.1 Design Requirements
1. Accept `{ page = 0, size = 10, search = "", status = "" } = {}` as input options.
2. Defensively support positional arguments `useOrders(page, size, search, status)` in case a caller passes numeric page index directly.
3. Configure `useQuery`:
   - `queryKey: ["orders", page, size, search, status]` — ensures each combination of pagination and filters has its own cache entry.
   - `queryFn: () => getOrders({ page, size, search, status })`.
   - `placeholderData: keepPreviousData` (imported from `@tanstack/react-query`) — preserves current table rows while fetching the next/previous page, preventing UI flickering and layout jumping.
4. Guarantee **100% Backward Compatibility**:
   - `orders`: `data?.content || (Array.isArray(data) ? data : [])`.
     If an existing component expects `orders` as an array (e.g. `orders.map(...)`, `orders.length`), it receives an array — never `undefined` and never an uniterable object.
   - Expose pagination metadata directly on the return object:
     - `totalElements: data?.totalElements ?? orders.length`
     - `totalPages: data?.totalPages ?? (orders.length > 0 ? 1 : 0)`
     - `currentPage: data?.currentPage ?? page`
     - `pageSize: data?.pageSize ?? size`
   - Expose the complete raw DTO as `data` for callers wanting full object access.
   - Expose query state flags: `isLoading` (`isPending`), `isFetching`, `isPlaceholderData`, `error`, and `refetch`.

### 5.2 Proposed Implementation Code
```javascript
// Target File: Front-end/src/features/Orders/useOrders.js
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getOrders } from "../../services/OrderService";

/**
 * TanStack Query hook for fetching paginated, searchable, and filterable orders.
 *
 * Supports both object options and positional arguments:
 *   useOrders({ page: 0, size: 10, search: "ORD-1", status: "COMPLETED" })
 *   useOrders() // defaults to { page: 0, size: 10, search: "", status: "" }
 *
 * @param {Object|number} [options={}] - Query options or page index
 * @param {number} [options.page=0] - 0-indexed page number
 * @param {number} [options.size=10] - Number of orders per page
 * @param {string} [options.search=""] - Keyword to search orderId, customerName, phoneNumber
 * @param {string} [options.status=""] - Payment status filter (PENDING, COMPLETED, CANCELLED, or ALL)
 * @returns {Object} Query result with backward-compatible array `orders` and pagination metadata
 */
export function useOrders(options = {}, maybeSize, maybeSearch, maybeStatus) {
  let page = 0;
  let size = 10;
  let search = "";
  let status = "";

  if (typeof options === "number") {
    // Positional style: useOrders(page, size, search, status)
    page = options;
    size = maybeSize ?? 10;
    search = maybeSearch ?? "";
    status = maybeStatus ?? "";
  } else if (typeof options === "object" && options !== null) {
    // Object style: useOrders({ page, size, search, status })
    page = options.page ?? 0;
    size = options.size ?? 10;
    search = options.search ?? "";
    status = options.status ?? "";
  }

  const {
    isPending: isLoading,
    isFetching,
    isPlaceholderData,
    data,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders", page, size, search, status],
    queryFn: () => getOrders({ page, size, search, status }),
    placeholderData: keepPreviousData,
  });

  // Extract order list while guaranteeing array type for 100% backward compatibility
  const orders = data?.content || (Array.isArray(data) ? data : []);

  return {
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
    orders,
    data,
    totalElements: data?.totalElements ?? orders.length,
    totalPages: data?.totalPages ?? (orders.length > 0 ? 1 : 0),
    currentPage: data?.currentPage ?? page,
    pageSize: data?.pageSize ?? size,
    refetch,
  };
}
```

---

## 6. Query Invalidation & React Query Ecosystem Alignment

### 6.1 Prefix-Based Invalidation Behavior
In TanStack Query v5, `queryClient.invalidateQueries({ queryKey: ["orders"] })` performs fuzzy/prefix matching:
- Every query key that starts with `["orders"]` is invalidated.
- Active query keys matching this prefix:
  1. Paginated order history: `["orders", page, size, search, status]`
  2. Dashboard order stats: `["orders", "dashboard"]` (defined in `useDashboard.js`)
  3. Legacy query keys: `["orders", "list"]`

### 6.2 Mutation Traceability
1. **Order Creation (`CartSummary.jsx` -> `useCreateOrder.js`)**:
   ```javascript
   // Front-end/src/features/Orders/useCreateOrder.js (Line 16)
   onSuccess: () => {
     toast.success("New order successfully created");
     queryClient.invalidateQueries({ queryKey: ["orders"] });
   }
   ```
   **Effect**: When a POS order is created, the paginated orders cache is immediately marked stale, causing the active page in `OrderHistory` to refetch the fresh order list.

2. **Order Payment Polling (`PaymentQRCode.jsx`)**:
   ```javascript
   // Front-end/src/features/Payment/PaymentQRCode.jsx (Line 23)
   useEffect(() => {
     if (isFinalCompleted) {
       queryClient.invalidateQueries({ queryKey: ["orders"] });
     }
   }, [isFinalCompleted, queryClient]);
   ```
   **Effect**: When PayOS webhook or polling confirms an order has completed, `["orders"]` is invalidated, and `OrderHistory` table refreshes the order status from `PENDING` to `COMPLETED`.

---

## 7. Downstream Contract for M3.3 (`OrderHistory.jsx`)

When the UI implementer builds Feature 23-25 in `OrderHistory.jsx`, the component connects to `useOrders` as follows:

```jsx
import { useState } from "react";
import { useOrders } from "../features/Orders/useOrders";

function OrderHistory() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const {
    isLoading,
    isFetching,
    isPlaceholderData,
    orders,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
  } = useOrders({ page, size, search, status });

  // Reset page to 0 when search or status filter changes
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(0);
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(0);
  };

  const handlePageSizeChange = (newSize) => {
    setSize(Number(newSize));
    setPage(0);
  };
  ...
}
```

This contract gives the UI full control over:
- Dynamic page indices (`page`)
- Dynamic page sizes (`size`: 10, 20, 50)
- Real-time search terms (`search`)
- Status filtering (`status`: ALL, PENDING, COMPLETED, CANCELLED)
- Rendering table rows (`orders.map(...)`)
- Displaying total items (`totalElements`)
- Pagination button states (`disabled={page === 0}`, `disabled={page >= totalPages - 1 || isPlaceholderData}`)

---

## 8. Verification Strategy

1. **Static Analysis & Linting**:
   - Run `npm run lint` in `Front-end/` to ensure zero ESLint errors or unused imports.
2. **Build Bundling**:
   - Run `npm run build` in `Front-end/` to confirm Vite production bundle completes with code 0.
3. **Behavioral Edge Cases**:
   - `useOrders()` without arguments: returns `{ isLoading, orders: [], totalElements: 0, ... }`.
   - `useOrders({ page: 0, size: 10 })`: generates queryKey `["orders", 0, 10, "", ""]`.
   - Backward compatibility: legacy components calling `const { orders } = useOrders()` receive an array where `orders.length` and `orders.map` work without modification.
