# 04 — Pages: Login + Dashboard + OrderHistory Migration

Status: ready-for-agent
Type: task
Blocked by: 03

## Summary

Migrate Login, Dashboard, and OrderHistory pages from Bootstrap to Tailwind. Apply design system: clean light mode, blue-600 primary, emerald accent, slate-50 background. Preserve all business logic.

## Acceptance Criteria

### Login Page + LoginForm
- [ ] Login page uses Tailwind: centered card on gradient/slate background, BillingApp logo/branding visible
- [ ] Form fields: Tailwind `ring-1 ring-slate-200 focus:ring-blue-500 rounded-lg` style
- [ ] Submit button: `bg-blue-600 hover:bg-blue-700 text-white w-full` with spinner on loading
- [ ] No hardcoded default email/password values
- [ ] `d-flex`, `card`, `form-control`, `btn`, `vh-100` Bootstrap classes — none remaining

### Dashboard
- [ ] Stats cards: white card with shadow, icon in colored circle (blue/emerald), large metric number, label below
- [ ] Stats grid: responsive 2-col on md+, 1-col on mobile
- [ ] Recent orders table: sticky `thead bg-slate-700 text-white`, alternating row stripes, overflow-x-auto wrapper
- [ ] Payment status badges: COMPLETED→emerald, PENDING→amber, others→slate
- [ ] No Bootstrap utility classes remaining
- [ ] Loading state: centered Tailwind spinner

### OrderHistory
- [ ] Page background: `bg-slate-50`, padding `p-6`
- [ ] Header: title + order count badge in flex row
- [ ] Table: sticky header, horizontal scroll, all Bootstrap classes removed
- [ ] Status badge color map applied consistently
- [ ] "In hóa đơn" button: Tailwind outlined style (not `btn btn-outline-info`)
- [ ] Empty state: centered icon + message

## Modules Affected

- `src/pages/Login.jsx` — MODIFY
- `src/features/Auth/LoginForm.jsx` — MODIFY
- `src/pages/Dashboard.jsx` — MODIFY
- `src/pages/OrderHistory.jsx` — MODIFY
