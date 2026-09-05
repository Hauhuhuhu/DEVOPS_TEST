# 03: Inventory Ledger & Stock Operations (Manual IN/OUT)

**What to build:** 
A store manager can perform manual Stock IN (Nhập kho) or Stock OUT (Xuất huỷ) operations for specific Variants. The system securely records these movements in an `InventoryTransaction` ledger and updates the Variant's cached stock quantity to instantly reflect the new availability on the UI.

**Blocked by:** 01: Item Variants Management.

**Status:** closed
Completed: true

- [x] Manager can submit a stock IN or OUT transaction for a specific Variant via the UI.
- [x] Backend API records an immutable `InventoryTransaction` with the correct transaction type, quantity, and timestamp.
- [x] Backend calculates and updates the `cached_stock_quantity` on the Variant table based on the new ledger entry.
- [x] The updated stock quantity is visible immediately on the frontend.
- [x] API integration tests verify that a manual IN/OUT transaction correctly updates the Variant's total stock.
