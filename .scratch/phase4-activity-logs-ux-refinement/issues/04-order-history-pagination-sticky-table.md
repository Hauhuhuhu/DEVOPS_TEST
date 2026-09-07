# 04 — Orders: Server-side Pagination, Search, Filter & Sticky Internal Scroll Table

Status: resolved
Type: task

## Summary

Refactor the Order History screen and backend API to handle large order volumes. Implement server-side pagination with Spring Data JPA `Pageable`, replace page-level scrolling with an internal table scroll container, pin the header (`sticky top-0`), and add search and status filtering.

## Acceptance Criteria

### Backend
- [x] Create `OrderPageResponse` DTO containing `content` (List<OrderResponse>), `totalElements`, `totalPages`, `currentPage`, `pageSize`.
- [x] Update `OrderEntityRepository` to support paginated queries with optional search (order ID, customer name, phone number) and status filter.
- [x] Update `OrderService` and `OrderServiceImpl` to provide `getOrdersPaginated(Pageable pageable, String search, String status)`.
- [x] Expose `GET /orders` endpoint accepting `page`, `size`, `search`, and `status` query params.

### Frontend
- [x] Update `OrderService.js` to call `fetchOrdersPaginated({ page, size, search, status })`.
- [x] Update `useOrders.js` to accept pagination and filter state in React Query key and fetch function.
- [x] Redesign `OrderHistory.jsx`:
  - Set fixed viewport height layout (`h-[calc(100vh-4rem)] flex flex-col p-6 bg-slate-50 overflow-hidden`).
  - Table card uses `flex-1 flex flex-col overflow-hidden`.
  - Table body scrolls internally (`flex-1 overflow-auto`) while table header remains `sticky top-0 bg-slate-50 z-10`.
  - Add search bar (searching by Order ID, Customer Name, or Phone) with clear button.
  - Add Payment Status filter (All, COMPLETED, PENDING, CANCELLED).
  - Add pagination toolbar at table bottom displaying total records, page size selector (10, 20, 50), Previous/Next buttons, and current page numbers.

## Key Decisions

- Respect `CONTEXT.md`: Return raw DTO `OrderPageResponse` without global generic wrapper.
- No HTML/body scrolling; the table container holds its own internal scrollbar to keep layout clean and responsive.

## Modules Affected

- `billingsoftware/src/main/java/learn/java/billingsoftware/io/OrderPageResponse.java` — NEW
- `billingsoftware/src/main/java/learn/java/billingsoftware/repository/OrderEntityRepository.java` — MODIFY
- `billingsoftware/src/main/java/learn/java/billingsoftware/service/OrderService.java` — MODIFY
- `billingsoftware/src/main/java/learn/java/billingsoftware/service/impl/OrderServiceImpl.java` — MODIFY
- `billingsoftware/src/main/java/learn/java/billingsoftware/controller/OrderController.java` — MODIFY
- `Front-end/src/services/OrderService.js` — MODIFY
- `Front-end/src/features/Orders/useOrders.js` — MODIFY
- `Front-end/src/pages/OrderHistory.jsx` — MODIFY
