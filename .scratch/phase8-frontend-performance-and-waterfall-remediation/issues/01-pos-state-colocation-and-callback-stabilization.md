# 01: Core POS State Colocation and Callback Stabilization

**What to build:**
Cashiers can enter a customer's phone number and name in the POS sales screen without causing frame drops or triggering cascade re-renders across the product catalog grid, category tabs, and active promotion banners. All cart manipulation actions maintain stable callback identities, enabling child product cards and categories to remain completely static during user input and order adjustments.

**Blocked by:** None (can start immediately)

**Status:** closed
<!-- closed: 2026-09-12 by agent -->

- [x] Typing in the customer phone and name inputs in `CustomerForm` does not trigger re-renders in `DisplayItems` or `DisplayCategories`.
- [x] `CustomerForm` maintains draft input state locally and emits settled customer changes via callback to the parent order summary.
- [x] Cart mutation functions (`addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`) in `useCartItem` are wrapped in `useCallback` with stable references.
- [x] `DisplayItem` and `DisplayCategory` components are wrapped in `React.memo` to ignore parent re-renders when their props do not change.
- [x] Catalog filtering by category and search keyword is combined into a single iteration pass wrapped in `useMemo`.
