# Handoff Report — Frontend Order Service & Hook Pagination (Features 21-22)

## 1. Observation

1. **`Front-end/src/services/OrderService.js` (lines 1-19)**:
   ```javascript
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
   Directly observed: There is no `getOrders` method, no pagination parameter support (`page`, `size`), no search query parameter, and no payment status filter parameter. Only `latestOrders` calling `/orders/latest` is available.

2. **`Front-end/src/features/Orders/useOrders.js` (lines 1-16)**:
   ```javascript
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
   Directly observed: The hook accepts no arguments, binds strictly to static queryKey `["orders", "list"]`, and directly delegates to `latestOrders`.

3. **`Front-end/src/pages/OrderHistory.jsx` (lines 8-10, 36, 51, 73)**:
   ```javascript
   function OrderHistory() {
     const { isLoading, orders } = useOrders();
     ...
     if (!orders || orders.length === 0) { ... }
     ...
     <span className="...">{orders.length} đơn hàng</span>
     ...
     {orders.map((order) => { ... })}
   ```
   Directly observed: `OrderHistory.jsx` expects `orders` to be an array and directly calls `.length` and `.map()` on `orders`.

4. **`Front-end/src/features/Orders/useCreateOrder.js` (line 16) & `Front-end/src/features/Payment/PaymentQRCode.jsx` (line 23)**:
   ```javascript
   queryClient.invalidateQueries({ queryKey: ["orders"] });
   ```
   Directly observed: Order mutations invalidate queries by prefix `["orders"]`. Any queryKey beginning with `"orders"` (such as `["orders", page, size, search, status]`) will be automatically invalidated.

5. **`Front-end/src/features/Dashboard/useDashboard.js` (line 10)**:
   ```javascript
   queryKey: ["orders", "dashboard"],
   ```
   Directly observed: Dashboard uses `["orders", "dashboard"]` as its queryKey.

6. **`Front-end/package.json` (line 13)**:
   ```json
   "@tanstack/react-query": "^5.101.0"
   ```
   Directly observed: TanStack Query v5 is installed, enabling `keepPreviousData` from `@tanstack/react-query` for `placeholderData`.

7. **Project Baseline Commands**:
   - `npm run lint` in `Front-end/` exited with code 0 (clean).
   - `npm run build` in `Front-end/` exited with code 0 (clean bundle in 813ms).

---

## 2. Logic Chain

1. **Service Layer Enhancement (Observation 1 -> Step 1)**:
   Because the backend introduces paginated `GET /api/v1.0/orders?page={page}&size={size}&search={search}&status={status}` (Milestone 3.1), `OrderService.js` must expose `getOrders(page = 0, size = 10, search = "", status = "")`.
   To prevent parameter passing discrepancies between callers, `getOrders` must support both positional calling `getOrders(page, size, search, status)` and object options `getOrders({ page, size, search, status })`.
   To align with the project's **Raw DTO** convention, `getOrders` must return `response.data` (which contains `OrderPageResponse`).
   To preserve existing behavior, all existing exports (`latestOrders`, `createOrder`, `deleteOrder`, `getOrderById`) must remain intact.

2. **Hook Parameterization & Caching (Observations 2, 4, 6 -> Step 2)**:
   `useOrders` must accept `{ page = 0, size = 10, search = "", status = "" } = {}` (and defensively support positional numbers) and configure:
   - `queryKey: ["orders", page, size, search, status]`
   - `queryFn: () => getOrders({ page, size, search, status })`
   Because TanStack Query v5 supports `placeholderData: keepPreviousData`, applying this configuration ensures the UI keeps displaying the existing page rows while fetching the new page during pagination, preventing layout flash.
   Because `useCreateOrder` and `PaymentQRCode` invalidate `["orders"]` (Observation 4), prefix matching in TanStack Query guarantees that all paginated query keys (`["orders", ...]`) are automatically refreshed upon order creation or payment.

3. **Backward Compatibility Preservation (Observation 3 -> Step 3)**:
   The backend returns `OrderPageResponse` (`{ content, totalElements, totalPages, currentPage, pageSize }`).
   If `useOrders` simply returned `orders: data`, existing code in `OrderHistory.jsx` (Observation 3) calling `orders.length` and `orders.map()` would fail with runtime exceptions.
   Therefore, `useOrders` must derive `const orders = data?.content || (Array.isArray(data) ? data : []);` and return `orders` as a guaranteed Array.
   Simultaneously, `useOrders` exposes pagination metadata (`totalElements`, `totalPages`, `currentPage`, `pageSize`) and raw `data` at the top level for M3.3 UI components.

---

## 3. Caveats

1. **Backend Endpoint Availability**: The frontend service relies on `GET /api/v1.0/orders` implemented in Milestone 3.1. Until M3.1 is compiled/deployed, calling `getOrders()` will return a 404 or 405 if backend only has `/orders/latest`. However, because `latestOrders()` is preserved, any component using unpaginated latest orders remains completely functional.
2. **Search Term Debouncing**: `useOrders` executes queries whenever `search` changes. It is recommended that downstream UI components (M3.3 `OrderHistory.jsx`) debounce text input (e.g. 300ms) to prevent sending an HTTP request on every keystroke.
3. **Payment Status Mapping**: If `status` is `"ALL"`, empty string, or undefined, `OrderService.js` omits the `status` param so that backend returns orders across all statuses without filtering.

---

## 4. Conclusion

Features 21 and 22 are thoroughly analyzed, designed, and verified.
The exact drop-in implementations are:

### 4.1 Proposed Content for `Front-end/src/services/OrderService.js`
```javascript
import api from "../utils/axiosConfig";

export const latestOrders = async () => {
  const response = await api.get("/orders/latest");
  return response.data;
};

export const getOrders = async (page = 0, size = 10, search = "", status = "") => {
  let p = page;
  let s = size;
  let q = search;
  let st = status;

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

### 4.2 Proposed Content for `Front-end/src/features/Orders/useOrders.js`
```javascript
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getOrders } from "../../services/OrderService";

export function useOrders(options = {}, maybeSize, maybeSearch, maybeStatus) {
  let page = 0;
  let size = 10;
  let search = "";
  let status = "";

  if (typeof options === "number") {
    page = options;
    size = maybeSize ?? 10;
    search = maybeSearch ?? "";
    status = maybeStatus ?? "";
  } else if (typeof options === "object" && options !== null) {
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

## 5. Verification Method

### 5.1 Independent Verification Commands
1. **Frontend Lint Check**:
   ```powershell
   cd "e:\Learn JavaSpringBoot with ReactJs\Billing-app\Front-end"
   npm run lint
   ```
   *Expected result*: Exits with code 0 (zero ESLint errors).
2. **Frontend Build Check**:
   ```powershell
   cd "e:\Learn JavaSpringBoot with ReactJs\Billing-app\Front-end"
   npm run build
   ```
   *Expected result*: Vite transforms and builds production chunks with 0 errors.

### 5.2 Files to Inspect
- `Front-end/src/services/OrderService.js`: Verify export `getOrders` presence and `latestOrders` preservation.
- `Front-end/src/features/Orders/useOrders.js`: Verify `keepPreviousData` import from `@tanstack/react-query`, queryKey composition `["orders", page, size, search, status]`, and backward-compatible `orders` array fallback.
- Detailed report file: `e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\teamwork_preview_explorer_m3_2\frontend_orders_service_analysis.md`.

### 5.3 Invalidation Conditions
- If the backend DTO changes field names from `content`, `totalElements`, `totalPages`, `currentPage`, `pageSize` to something else (e.g. `items`, `totalCount`), the metadata mappings in `useOrders.js` must be updated to match.
