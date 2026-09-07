# BRIEFING — 2026-09-07T11:21:20+07:00

## Mission
Explore and design frontend OrderService and useOrders hook for Order History pagination (Features 21-22).

## 🔒 My Identity
- Archetype: teamwork_preview_explorer
- Roles: explorer, investigator
- Working directory: e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\teamwork_preview_explorer_m3_2
- Original parent: 8d4e3dc5-e87d-4554-ae91-87ef900afafd
- Milestone: M3.2 - Frontend Order Service & Hook Pagination

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Explore and design frontend service and hook for Order History pagination (Features 21-22)
- Inspect OrderService.js and useOrders.js (or equivalent)
- Formulate exact code updates preserving backward compatibility
- Write frontend_orders_service_analysis.md and handoff.md

## Current Parent
- Conversation ID: 8d4e3dc5-e87d-4554-ae91-87ef900afafd
- Updated: 2026-09-07T11:21:20+07:00

## Investigation State
- **Explored paths**:
  - `Front-end/src/services/OrderService.js`
  - `Front-end/src/features/Orders/useOrders.js`
  - `Front-end/src/pages/OrderHistory.jsx`
  - `Front-end/src/features/Orders/useCreateOrder.js`
  - `Front-end/src/features/Payment/PaymentQRCode.jsx`
  - `Front-end/src/features/Dashboard/useDashboard.js`
  - `Front-end/package.json`
- **Key findings**:
  - `OrderService.js` currently only calls unpaginated `/orders/latest`. Needs `getOrders(page, size, search, status)` calling `GET /orders` with raw DTO return.
  - `useOrders.js` currently binds to static queryKey `["orders", "list"]`. Needs parameterized queryKey `["orders", page, size, search, status]` and `placeholderData: keepPreviousData`.
  - Must preserve backward compatibility so `orders` returned by `useOrders` is always an Array (`orders.length` and `orders.map()` in `OrderHistory.jsx`).
  - Prefix matching in TanStack Query invalidation on `["orders"]` from `useCreateOrder` and `PaymentQRCode` seamlessly refreshes paginated queries.
- **Unexplored areas**: None within scope of M3.2.

## Key Decisions Made
- Designed `getOrders` in `OrderService.js` supporting both positional and object arguments.
- Designed `useOrders` in `useOrders.js` returning `{ isLoading, isFetching, isPlaceholderData, orders, data, totalElements, totalPages, currentPage, pageSize, refetch }`.
- Integrated `keepPreviousData` from `@tanstack/react-query` (v5).
- Completed `frontend_orders_service_analysis.md` and 5-component `handoff.md`.

## Artifact Index
- `DISPATCH.md` — Dispatch record
- `BRIEFING.md` — Working memory
- `progress.md` — Progress tracker
- `frontend_orders_service_analysis.md` — Full technical exploration and code formulations
- `handoff.md` — Self-contained 5-component handoff report
