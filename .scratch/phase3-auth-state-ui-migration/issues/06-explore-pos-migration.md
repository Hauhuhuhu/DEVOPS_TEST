# 06 — Explore/POS: Bootstrap → Tailwind Migration

Status: ready-for-agent
Type: task
Blocked by: 03

## Summary

Migrate the Explore/POS screen feature components from Bootstrap to Tailwind CSS. The two-column layout (product grid left, cart right) and all POS business logic MUST be preserved exactly. Only CSS classes are changed.

## Acceptance Criteria

- [ ] POS two-column split layout preserved: left panel (categories + items grid) and right panel (cart + checkout)
- [ ] Category pills/tabs: Tailwind active state highlight (blue background), hover states
- [ ] Item cards: image, name, price — Tailwind card style with hover shadow
- [ ] Cart items: scrollable list, quantity controls, remove button — all functional
- [ ] CartSummary: order summary, payment method selection, customer form — all business logic preserved
- [ ] POSItemModal: modifier selection, variant selection — fully functional, Tailwind-styled
- [ ] ReceiptPopup: print-friendly layout preserved, Tailwind wrapper
- [ ] SearchBox: Tailwind input style
- [ ] CustomerForm in POS: Tailwind form inputs
- [ ] No Bootstrap classes remaining in any Explore feature component
- [ ] `src/pages/Explore/Explore.jsx` (if it exists) — convert wrapper

## Constraint

**Do NOT change component hierarchy, state management, prop interfaces, or any logic** in `useCartItem.js`, `CartSummary.jsx`, `CartItems.jsx`, `POSItemModal.jsx`, etc. Only className strings are modified.

## Modules Affected

- `src/pages/Explore/Explore.jsx` — MODIFY
- `src/features/Explore/CartItems.jsx` — MODIFY
- `src/features/Explore/CartSummary.jsx` — MODIFY
- `src/features/Explore/CustomerForm.jsx` — MODIFY
- `src/features/Explore/DisplayCategories.jsx` — MODIFY
- `src/features/Explore/DisplayCategory.jsx` — MODIFY
- `src/features/Explore/DisplayItem.jsx` — MODIFY
- `src/features/Explore/DisplayItems.jsx` — MODIFY
- `src/features/Explore/POSItemModal.jsx` — MODIFY
- `src/features/Explore/ReceiptPopup.jsx` — MODIFY
- `src/features/Explore/SearchBox.jsx` — MODIFY
