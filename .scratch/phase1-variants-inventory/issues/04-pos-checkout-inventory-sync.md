# 04: POS Checkout & Inventory Auto-Sync

**What to build:** 
A cashier can add a specific Variant to the cart, select applicable Modifiers, and place an order. The system calculates the correct total price (Variant base price + Modifier prices), saves the order details including the selected modifiers as JSON, and automatically generates an `OUT` inventory transaction for the Variant. The system must allow the stock to go negative if an offline sync delay or overselling occurs.

**Blocked by:** 01: Item Variants Management, 02: Item Modifiers Management, 03: Inventory Ledger & Stock Operations.

**Status:** closed
Completed: true

- [x] Cashier can select a Variant and its Modifiers from the POS UI.
- [x] Cart calculates total price dynamically based on Variant base price and selected modifiers.
- [x] Submitting the order creates an `OrderItem` containing the `variant_id` and a `selected_modifiers` JSON payload.
- [x] An automatic `OUT` transaction is created in the `InventoryTransaction` ledger for the sold Variant.
- [x] The Variant's cached stock is updated, even if it results in a negative value (Negative Stock).
- [x] API integration tests confirm the entire checkout flow and ledger reduction.
