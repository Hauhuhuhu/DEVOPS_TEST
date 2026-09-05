# 03: Promotion Evaluation Engine & Realtime POS Cart Discount (ADR-0003)

**What to build:** 
A real-time promotion evaluation engine that assesses cart items against active Happy Hour rules, BOGO rules, and submitted Coupon Codes. In strict accordance with ADR-0003, the engine automatically selects the single promotion providing the highest discount for the customer (no promotion stacking). Cashiers can apply or remove coupon codes with immediate visual feedback and see the itemized subtotal, discount, tax, and grand total update in real time.

**Blocked by:** 02: Promotion Management (Admin Campaign Configuration).

**Status:** ready-for-agent

- [ ] Cashier can enter a coupon code in the POS cart and receive instant validation feedback (success or informative error for expired, inactive, or unreached minimum spend).
- [ ] POS interface automatically detects when a Happy Hour is currently active and displays an informational badge.
- [ ] Backend evaluation endpoint evaluates all eligible promotions (Happy Hour, BOGO, Coupon) and selects only the single best promotion yielding the highest discount (ADR-0003).
- [ ] Cart summary dynamically displays subtotal, applied promotion name, discount amount, tax, and grand total.
- [ ] Cashier can clear or remove an applied coupon code to restore original pricing.
- [ ] API integration tests verify single-best promotion selection, coupon validation rules, Happy Hour time checks, and discount calculations.
