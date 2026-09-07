# 03 — Forms: Unified Error UX with react-hook-form & react-hot-toast

Status: resolved
Type: task

## Summary

Standardize all forms across the project onto `react-hook-form`. Ensure consistent visual feedback: upon validation failure, a `react-hot-toast` error message is shown, the invalid input turns red (`border-red-500 focus:ring-red-500 bg-red-50/10`), and an inline red error message is rendered directly below the input.

## Acceptance Criteria

- [x] All forms in the project use `react-hook-form` consistently:
  1. `LoginForm.jsx` (Migrated from `useState` to `react-hook-form`)
  2. `CategoryForm.jsx`
  3. `ItemForm.jsx` (including dynamic Variant validation)
  4. `UserForm.jsx`
  5. `ModifierGroupForm.jsx`
  6. `ManageCustomers.jsx`
  7. `ManagePromotions.jsx`
  8. `StockOperationModal.jsx`
- [x] On submit with validation errors:
  - An error toast appears via `react-hot-toast` (e.g. `toast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc")` or first error message).
  - All invalid inputs receive red styling (`border-red-500 focus:ring-red-500 text-red-900`).
  - An inline error label appears directly beneath each invalid field: `<p className="text-xs text-red-600 mt-1">{errors[name].message}</p>`.
- [x] Clearing or correcting the input removes the red border and error message.

## Key Decisions

- Standardize input styling classes so all forms share identical error appearance and spacing.

## Modules Affected

- `Front-end/src/features/Auth/LoginForm.jsx` — MODIFY
- `Front-end/src/features/Category/CategoryForm.jsx` — MODIFY
- `Front-end/src/features/Items/ItemForm.jsx` — MODIFY
- `Front-end/src/features/Users/UserForm.jsx` — MODIFY
- `Front-end/src/features/Modifiers/ModifierGroupForm.jsx` — MODIFY
- `Front-end/src/pages/ManageCustomers.jsx` — MODIFY
- `Front-end/src/pages/ManagePromotions.jsx` — MODIFY
- `Front-end/src/features/Inventory/StockOperationModal.jsx` — MODIFY
