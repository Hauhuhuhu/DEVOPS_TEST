# 02 — Global UI: ConfirmDeleteModal Component & window.confirm Replacement

Status: resolved
Type: task

## Summary

Replace all instances of raw browser `window.confirm(...)` across the application with a dedicated, reusable `ConfirmDeleteModal` component.

## Acceptance Criteria

- [x] A reusable `ConfirmDeleteModal` component is created in `src/ui/ConfirmDeleteModal.jsx`.
- [x] The modal displays:
  - Danger header with red warning icon (`AlertTriangle` or `Trash2`).
  - Customizable title (e.g. "Xác nhận xóa sản phẩm").
  - Clear message indicating the specific item/name being deleted and a warning that the action cannot be undone.
  - "Hủy" (Cancel) button and "Xóa" (Delete) button.
  - Loading state / spinner on the confirm button when deletion mutation is pending, disabling both buttons during deletion.
- [x] All 6 locations using `window.confirm` are migrated:
  1. `Item.jsx` (Delete Item)
  2. `CategoryListItem.jsx` (Delete Category)
  3. `UserItem.jsx` (Delete User)
  4. `ManageCustomers.jsx` (Delete Customer)
  5. `ManagePromotions.jsx` (Delete Promotion)
  6. `ModifierGroupList.jsx` (Delete Modifier Group)
- [x] No occurrences of `window.confirm` remain in the frontend codebase.

## Key Decisions

- Built either using React Portal or leveraging the existing `src/ui/Modal.jsx` infrastructure to ensure proper backdrop blur, escape/outside-click closing, and keyboard accessibility.

## Modules Affected

- `Front-end/src/ui/ConfirmDeleteModal.jsx` — NEW
- `Front-end/src/features/Items/Item.jsx` — MODIFY
- `Front-end/src/features/Category/CategoryListItem.jsx` — MODIFY
- `Front-end/src/features/Users/UserItem.jsx` — MODIFY
- `Front-end/src/pages/ManageCustomers.jsx` — MODIFY
- `Front-end/src/pages/ManagePromotions.jsx` — MODIFY
- `Front-end/src/features/Modifiers/ModifierGroupList.jsx` — MODIFY
