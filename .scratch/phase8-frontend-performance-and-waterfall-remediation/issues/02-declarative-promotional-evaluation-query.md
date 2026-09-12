# 02: Declarative Promotional Evaluation via TanStack Query

**What to build:**
Cashiers can rapidly increment, decrement, and customize items in the POS cart without experiencing race conditions or incorrect invoice balances. Promotional discount evaluation is driven declaratively by TanStack Query, automatically deduplicating simultaneous requests and canceling obsolete in-flight evaluations when cart contents change quickly.

**Blocked by:** 01: Core POS State Colocation and Callback Stabilization

**Status:** closed
<!-- closed: 2026-09-12 by agent -->

- [x] Promotional calculations in `CartSummary` are decoupled from raw `useEffect` hooks and executed via a dedicated `usePromotionEvaluation` query hook.
- [x] The query key derives deterministically from the cart signature (item IDs, quantities, prices, modifier sets) and applied coupon code.
- [x] Rapid adjustments to cart quantities trigger request deduplication and cancel superseded calculations cleanly.
- [x] Subtotal calculations in `CartSummary` are wrapped in `useMemo`.
- [x] Applying and removing coupons updates the promotional discount state immediately without race conditions.
