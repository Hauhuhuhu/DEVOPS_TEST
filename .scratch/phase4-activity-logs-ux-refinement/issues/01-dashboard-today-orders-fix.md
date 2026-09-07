# 01 — Dashboard: Today's Orders Card Metric Fix

Status: resolved
Type: task

## Summary

Fix the metric display on the Dashboard where the order count card is labeled "Total Orders" but binds to `undefined`, causing it to always show 0. Update the card label to "Today's Orders" and correctly bind it to the backend's `todayOrderCount`.

## Acceptance Criteria

- [x] The stat card on `/dashboard` is labeled "Today's Orders" (accompanying "Today's Sales").
- [x] The card accurately displays the number of orders created today from `dashboardData.todayOrderCount`.
- [x] Fallback to 0 if data is loading or null.
- [x] UI visual style matches the current Tailwind stat card design.

## Key Decisions

- Align with Option 1 from grilling: The backend returns `todayOrderCount = orderService.countByOrderDate(today)`. The frontend displays "Today's Orders" for semantic consistency with "Today's Sales".

## Modules Affected

- `Front-end/src/pages/Dashboard.jsx` — MODIFY (label and property binding)
