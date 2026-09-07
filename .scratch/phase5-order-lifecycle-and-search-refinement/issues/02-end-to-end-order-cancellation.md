# 02: End-to-End In-Flight Order Cancellation

**What to build:** Complete end-to-end order cancellation functionality for in-flight pending transactions. Cashiers can cancel an order either directly from the PayOS QR payment modal or from the Order History table. Upon confirming cancellation, the order status changes to CANCELLED, all reserved inventory is restored to available stock via compensating ledger transactions, any applied coupon usage quotas and customer loyalty metrics are rolled back, the external PayOS payment link is revoked to prevent rogue payments, and an audit trail entry is logged.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] A dedicated cancellation endpoint accepts an order ID and transitions its payment status from PENDING to CANCELLED (rejecting attempts to cancel non-pending orders).
- [x] For every item in the cancelled order, a compensating ledger transaction of type IN is recorded, restoring the exact sold quantities and synchronizing the cached stock quantity.
- [x] If the order had an applied promotion, the promotion's usage count is decremented by one without falling below zero.
- [x] If the order was attached to a customer profile, the customer's total spent and order count are decremented accordingly without falling below zero.
- [x] For orders initialized with PayOS, the external payment link is invalidated remotely through the payment gateway SDK, with failures handled gracefully so as not to abort database rollback.
- [x] An audit log record is created capturing the cancellation event with timestamp and order identifier.
- [x] The QR payment modal displays a prominent Hủy đơn hàng button with a confirmation prompt that invokes cancellation, displays a success notification, and resets the checkout state.
- [x] The Order History table displays a Hủy đơn action button for any order currently in PENDING status with a confirmation modal.