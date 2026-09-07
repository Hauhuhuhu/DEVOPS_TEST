# 04 — Pages: Login + Dashboard + OrderHistory Migration

Status: resolved
Type: task
Blocked by: 03

## Summary

Migrate Login, Dashboard, and OrderHistory pages from Bootstrap to Tailwind. Apply design system: clean light mode, blue-600 primary, emerald accent, slate-50 background. Preserve all business logic.

## Acceptance Criteria

### Login Page + LoginForm
- [x] Login page uses Tailwind: centered card on gradient/slate background, BillingApp logo/branding visible
- [x] Form fields: Tailwind `ring-1 ring-slate-200 focus:ring-blue-500 rounded-lg` style
- [x] Submit button: `bg-blue-600 hover:bg-blue-700 text-white w-full` with spinner on loading
- [x] No hardcoded default email/password values
- [x] `d-flex`, `card`, `form-control`, `btn`, `vh-100` Bootstrap classes — none remaining

### Dashboard
- [x] Stats cards: white card with shadow, icon in colored circle (blue/emerald), large metric number, label below
- [x] Stats grid: responsive 2-col on md+, 1-col on mobile
- [x] Recent orders table: sticky `thead bg-slate-700 text-white`, alternating row stripes, overflow-x-auto wrapper
- [x] Payment status badges: COMPLETED→emerald, PENDING→amber, others→slate
- [x] No Bootstrap utility classes remaining
- [x] Loading state: centered Tailwind spinner

### OrderHistory
- [x] Page background: `bg-slate-50`, padding `p-6`
- [x] Header: title + order count badge in flex row
- [x] Table: sticky header, horizontal scroll, all Bootstrap classes removed
- [x] Status badge color map applied consistently
- [x] "In hóa đơn" button: Tailwind outlined style (not `btn btn-outline-info`)
- [x] Empty state: centered icon + message

## Modules Affected

- `src/pages/Login.jsx` — MODIFY
- `src/features/Auth/LoginForm.jsx` — MODIFY
- `src/pages/Dashboard.jsx` — MODIFY
- `src/pages/OrderHistory.jsx` — MODIFY

## Comments

- Implemented via commit `0bd6123`.
- Verified with tests 1, 5, 8, 14, 15 in `Front-end/test-verification.mjs`. All passed.
