# ADR 0006: In-Flight QR Order Lifecycle and Cancellation Management

## Context
When a cashier or customer initiates a QR payment via PayOS, the order is created in a `PENDING` state with inventory immediately deducted (`OUT` transaction) to prevent overselling at busy checkout counters. However, situations frequently arise where the customer changes their mind: either requesting to switch to cash payment (e.g., banking app failure, poor network) or deciding to cancel the transaction altogether.

Previously, the system lacked endpoints to handle these in-flight transitions. Closing the QR modal left orphan `PENDING` orders with locked inventory, and switching to cash created duplicate orders with double inventory deductions.

## Decision
1. **Compensating Ledger Transactions on Cancellation**:
   When an order in `PENDING` status is cancelled, the system marks `PaymentDetails.PaymentStatus = CANCELLED` instead of performing a hard database delete. A compensating inventory transaction of type `IN` is recorded for all order items, restoring `cachedStockQuantity`. Any applied promotion quota (`timesUsed`) and customer lifetime metrics (`orderCount`, `totalSpent`) are rolled back atomically. The remote PayOS payment link is explicitly cancelled via `payOS.paymentRequests().cancel()`.

2. **In-Flight Payment Method Switch (`Switch to Cash`)**:
   Instead of cancelling and recreating the order from scratch, the system provides a direct transition endpoint (`/orders/{orderId}/switch-to-cash`). This endpoint atomically updates the existing order's `paymentMethod` to `CASH` and `paymentDetails.status` to `COMPLETED`, cancels the remote PayOS payment link, and retains the already-deducted inventory without double-counting.

## Consequences
- **Positive**: Maintains strict accounting integrity and auditability. Eliminates inventory leakage from abandoned QR codes. Provides a seamless cashier experience with zero duplicate orders.
- **Negative**: Adds state machine complexity to the order service to guard against invalid status transitions (e.g., cancelling an already `COMPLETED` order).
