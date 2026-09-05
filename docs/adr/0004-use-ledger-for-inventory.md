# ADR 0004: Use Ledger Model for Inventory Transactions

## Context
We need to support advanced inventory management, including Purchase Orders (Nhập kho), Wastage (Xuất huỷ), and Stock Checking (Kiểm kê). Simply maintaining a `stock_quantity` integer on the `Variant` table is insufficient for auditing, tracing historical stock movements, or understanding why a stock discrepancy occurred.

## Decision
We will implement a **Ledger Model** (Event Sourcing approach) for inventory. 
An `InventoryTransaction` table will record every stock movement with a specific type (`IN`, `OUT`, `ADJUSTMENT`) and reference the corresponding source document (Order ID, Purchase Order ID). 
The current stock of a `Variant` is formally the sum of all its transactions. For performance, this sum can be cached on the `Variant` table, but the transactions remain the single source of truth.

## Consequences
- **Positive**: Perfect audit trail. Highly resilient to race conditions if implemented with append-only ledger logic. Easy to generate historical stock reports.
- **Negative**: Increased database storage. Slightly more complex application logic when selling or returning items (must create transaction records instead of just updating a counter).
