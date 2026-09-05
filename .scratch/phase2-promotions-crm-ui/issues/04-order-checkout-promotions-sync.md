# 04: Order Checkout with Promotions & Usage Sync

**What to build:** 
A complete order checkout flow where cashiers finalize orders with applied promotions and linked customers. The system recalculates and locks in the discount inside a secure database transaction, increments the promotion's usage counter atomically, updates the customer's lifetime spending and order count, records inventory deductions, and supports both Cash and PayOS QR payments with the final discounted amount.

**Blocked by:** 01: Customer Management (CRM & POS Phone Lookup), 02: Promotion Management (Admin Campaign Configuration), 03: Promotion Evaluation Engine & Realtime POS Cart Discount (ADR-0003).

**Status:** closed
**Completed:** true

- [x] Cashier can submit an order with a linked customer and an applied promotion code.
- [x] Backend transaction locks and saves the order with applied promotion ID, promotion name snapshot, and calculated discount amount.
- [x] Coupon usage counter (`timesUsed`) increments atomically upon successful order completion and blocks checkout if the limit is exceeded.
- [x] Customer's lifetime spend and total order count are automatically updated upon order completion.
- [x] Existing ledger inventory deduction (`OUT` transaction) correctly executes for sold variants.
- [x] Checkout supports both Cash payment and PayOS QR payment for the discounted grand total.
- [x] API integration tests verify full order checkout, discount persistence, atomic coupon counter increment, and customer spend synchronization.
