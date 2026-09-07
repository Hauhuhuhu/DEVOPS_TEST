# 06 — Activity Log: Frontend UI Page, Filters & Menubar Integration

Status: resolved
Type: task

## Summary

Create the frontend interface for Activity Logs at `/activity-logs`. Connect the "Activity Log" button in the Menubar profile dropdown to this page. Provide date range filtering (Today, 7 days, 30 days, All), action type filtering, user selection for Admin, and a paginated log table with badges.

## Acceptance Criteria

- [x] Create `ActivityLogService.js` and `useActivityLogs.js` hook using TanStack React Query.
- [x] Create `ActivityLogs.jsx` page:
  - Header with title, icon, and total log counter.
  - Date preset filters: "Hôm nay", "7 ngày qua", "30 ngày qua", "Tất cả".
  - Action type filter dropdown (Tất cả, Đăng nhập, Bán hàng/Order, Danh mục, Sản phẩm, Tồn kho, Khách hàng, Khuyến mãi, Người dùng).
  - Admin-only User filter dropdown to view activities of a specific staff or all staff.
  - Paginated table showing: Thời gian (formatted), Người thực hiện (User Email), Hành động (Badge màu), Đối tượng (Entity), Mô tả chi tiết.
  - Pagination toolbar with page selector and next/previous controls.
- [x] In `Menubar.jsx`: Clicking "Activity Log" in the profile dropdown navigates to `/activity-logs` and closes the dropdown.
- [x] In `App.jsx`: Register `/activity-logs` route under `ProtectedRoute`.

## Key Decisions

- Use consistent design tokens and responsive layout matching existing management pages.

## Modules Affected

- `Front-end/src/services/ActivityLogService.js` — NEW
- `Front-end/src/features/ActivityLogs/useActivityLogs.js` — NEW
- `Front-end/src/pages/ActivityLogs.jsx` — NEW
- `Front-end/src/ui/Menubar.jsx` — MODIFY
- `Front-end/src/App.jsx` — MODIFY
