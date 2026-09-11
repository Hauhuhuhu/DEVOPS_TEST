# ADR 0008: Compensating Order Deletion and Unified Audit Trail Invariants

## Context
In the retail billing system, cancelOrder was designed (ADR 0006) to safeguard data integrity through compensating ledger transactions (IN), promotion quota rollbacks, customer CRM metric restorations, and remote payment gateway link revocations.
However, a raw DELETE /orders/{orderId} endpoint existed in OrderController which directly removed order records from 	bl_orders without performing inventory or CRM compensations. When invoked, this left inventory depleted and customer spending/promotion usage counts uncorrected. Furthermore, system audit logs were only inconsistently emitted across services, leaving management operations on Users, Promotions, Modifiers, and entity Updates untracked.

## Decision
1. **Compensating Order Deletion Policy**:
   - DELETE /orders/{orderId} is strictly restricted to orders in PENDING or CANCELLED status.
   - Deleting a COMPLETED order is forbidden and returns HTTP 400 (Bad Request), protecting irreversible sales and financial audit trails.
   - If the target order is PENDING, the service atomically performs full compensation (recording compensating inventory IN ledger transactions, updating cached stock, rolling back promotion 	imesUsed, reverting customer total spent/order count, and cancelling the remote PayOS payment link) before deleting the database record.
   - If the order was already CANCELLED, compensation was already performed during cancellation; the order record is deleted directly without duplicate stock replenishment.
2. **Unified Activity Logging Invariant**:
   - All mutating operations (CREATE, UPDATE, DELETE) across all system entities (CATEGORY, ITEM, USER, PROMOTION, MODIFIER, CUSTOMER, ORDER) must record an entry in 	bl_activity_logs.
   - The user email must be extracted automatically from SecurityContextHolder whenever not explicitly provided.
3. **User Identity Invariant**:
   - AuthResponse must supply the user's 
ame alongside email and ole, enabling explicit visual role identification (Admin vs Staff) on the user interface.

## Consequences
- **Positive**: Prevents phantom inventory loss and corrupted customer metrics when orders are deleted. Establishes a complete, trustworthy audit trail for all admin operations.
- **Negative**: Adds validation overhead on deletion endpoints and requires careful coordination between transaction rollback and entity deletion.
