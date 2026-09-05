Status: ready-for-agent

# Spec: Phase 1 - Variants, Modifiers, and Advanced Inventory

## Problem Statement

The current POS system handles only basic, single-SKU items. It lacks the ability to support retail items that come in multiple physical variations (e.g., sizes, colors) and F&B items that require custom preparation instructions or add-ons (e.g., sugar levels, toppings). Furthermore, the system lacks a robust inventory tracking mechanism, making it impossible to perform advanced stock operations like Purchase Orders from suppliers, wastage tracking, and periodic stock checks.

## Solution

We will redesign the core domain model to separate physical stock items from non-stock modifiers. We will introduce `Variant` (SKU) to represent physical goods with dynamic JSON attributes, and `Modifier`/`ModifierGroup` to represent custom instructions and add-ons. 
Simultaneously, we will implement a Ledger-based Advanced Inventory system. Instead of storing a static stock number, we will record every stock movement (IN, OUT, ADJUSTMENT) in an `InventoryTransaction` table, providing a mathematically sound and fully auditable stock tracking system that seamlessly integrates with Variant sales.

## User Stories

1. As a store manager, I want to create an Item with multiple Variants (e.g., Color, Size), so that I can sell retail products with different physical traits under a single parent Item.
2. As a store manager, I want to assign a unique SKU and price to each Variant, so that I can track sales and inventory accurately for each specific variation.
3. As a store manager, I want to create Modifier Groups (e.g., "Sugar Level", "Toppings"), so that I can offer customizable options for F&B items.
4. As a store manager, I want to assign prices to specific Modifiers (e.g., +$1 for Boba), so that customers are charged correctly for add-ons.
5. As a store manager, I want to link Modifier Groups to specific Items or Categories, so that cashiers only see relevant options when ordering.
6. As a store manager, I want to create a Purchase Order (Nhập kho) to record incoming stock for specific Variants, so that the inventory is accurately increased.
7. As a store manager, I want to create a Wastage Report (Phiếu xuất hủy) for damaged goods, so that inventory is reduced without recording a sale.
8. As a store manager, I want to perform a Stock Check (Kiểm kê) to adjust the system stock to match the physical count, so that discrepancies are resolved with an audit trail.
9. As a cashier, I want to select a Variant and its Modifiers when adding an Item to the cart, so that the customer's exact request is captured.
10. As a cashier, I want the receipt to print the base price of the Variant and explicitly list the selected Modifiers with their added prices, so that the customer understands their bill.
11. As a system auditor, I want every stock change to be recorded as an immutable InventoryTransaction (Ledger), so that I can trace exactly when and why stock levels changed.
12. As a cashier, I want to be able to complete a sale even if the Variant's calculated stock falls below zero, so that I am not blocked from taking the customer's money during sync delays (Negative Stock).

## Implementation Decisions

- **Domain Models**: 
  - `Item` will no longer hold inventory or a single price if it has variants.
  - `Variant` table will be introduced, linked to `Item`. It includes `sku`, `base_price`, and a JSON column `attributes` to hold dynamic traits (e.g., `{"Color": "Red"}`).
  - `ModifierGroup` and `Modifier` tables will be introduced for non-stock options.
  - `InventoryTransaction` table will be introduced. Columns include `variant_id`, `transaction_type` (IN, OUT, ADJUSTMENT), `quantity` (positive or negative), `reference_id` (e.g., Order ID), and `created_at`.
- **Order Structure**: `OrderItem` will store `variant_id` (instead of just `item_id`), `base_price`, and a JSON column or related table `selected_modifiers` containing the applied modifiers and their prices. `total_price` is dynamically calculated.
- **Inventory Calculation**: The current stock of a Variant is calculated by summing the `quantity` in `InventoryTransaction`. We will cache this sum on the `Variant` table (e.g., `cached_stock_quantity`) and update it asynchronously or synchronously via JPA entity listeners/triggers to speed up read queries.
- **Negative Stock**: The backend API will NOT throw a validation error if `cached_stock_quantity` < 0 during an order placement.
- **Frontend State Management**: Use TanStack React Query to fetch and mutate Items, Variants, and Inventory. Forms will be built using React Hook Form to handle the dynamic JSON attributes for Variants.

## Testing Decisions

- **Test Seams**:
  - **Backend**: API Integration Level. We will use `@SpringBootTest` and `MockMvc` to test REST endpoints directly (`/api/v1.0/admin/items`, `/api/v1.0/orders`, `/api/v1.0/inventory`). We will verify that an order correctly creates an `InventoryTransaction` of type `OUT` and updates the cached stock.
  - **Frontend**: Component Integration Level. We will use React Testing Library to test entire page components (e.g., `ItemManagementForm`), mocking Axios API calls. We will test the user flow of adding an item with dynamic attributes and modifiers.
- **Good Tests**: Tests should only verify external behavior (HTTP response codes, JSON payloads, UI rendering) and not internal implementation details (e.g., not directly calling `inventoryService.calculateStock()`).

## Out of Scope

- Offline-First POS features (PWA, IndexedDB sync conflicts).
- Advanced CRM, Promotion Engine, Coupon Codes, Happy Hour pricing.
- Complex Bill of Materials (BOM) or raw material tracking for F&B items.
- UI/UX major redesigns not related to the new Variant/Inventory forms.

## Further Notes

- These decisions strictly follow ADR-0001, ADR-0004, and ADR-0005.
