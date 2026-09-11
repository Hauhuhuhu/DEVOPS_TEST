# 02: Compensating Order Deletion Invariant

**What to build:**
Enforce strict lifecycle and accounting invariants on the order deletion API (DELETE /orders/{id}). If a client attempts to delete an order that has already been completed, the request is rejected with HTTP 400 Bad Request to protect financial records. When deleting an in-flight pending order, the system atomically runs full inventory and promotion compensation before deleting the record: returning reserved quantities to the warehouse ledger via IN transactions, updating cached stock levels, restoring promotion usage quotas, reversing customer CRM lifetime spending/order counters, and cancelling remote PayOS payment links. If the order was already cancelled, the record is removed cleanly without duplicate compensation. The deletion is recorded in the activity audit log.

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] Attempting to delete a COMPLETED order returns HTTP 400 Bad Request with a clear explanation
- [x] Deleting a PENDING order creates compensating inventory IN transactions for all line items and updates cached stock
- [x] Deleting a PENDING order decrements the usage count of any applied promotion coupon
- [x] Deleting a PENDING order reverts customer lifetime spending and order count metrics in CRM
- [x] Deleting a PENDING order triggers remote PayOS checkout link cancellation if applicable
- [x] Deleting an already CANCELLED order deletes the database record without repeating stock or promo reversals
- [x] Deleting an order emits an ActivityLog record with action DELETE and entityType ORDER
