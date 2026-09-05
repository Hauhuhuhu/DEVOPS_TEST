# 05: Periodic Stock Check (Kiểm kê)

**What to build:** 
A store manager can perform a physical stock check by entering the actual counted quantities of Variants. The system automatically calculates the difference between the physical count and the system's cached stock, and generates an `ADJUSTMENT` inventory transaction to align the system with reality, maintaining a clear audit trail of discrepancies.

**Blocked by:** 03: Inventory Ledger & Stock Operations.

**Status:** ready-for-agent

- [ ] Manager can input a physical count for a Variant on the UI.
- [ ] Backend compares the physical count with `cached_stock_quantity`.
- [ ] Backend generates an `ADJUSTMENT` transaction in the ledger for the difference (+ or -).
- [ ] Variant's cached stock is updated to match the physical count exactly.
- [ ] API integration tests verify that submitting a stock check correctly adjusts the ledger and cached stock.
