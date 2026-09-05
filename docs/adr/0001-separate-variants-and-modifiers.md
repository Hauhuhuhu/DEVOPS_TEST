# ADR 0001: Separate Variants and Modifiers in Data Model

## Context
The POS system needs to support both Retail items (e.g. T-shirts with sizes and colors) and F&B items (e.g. Milk Tea with sugar levels and toppings). Initially, we considered merging these concepts into a single "Options" model. However, retail variants represent physical goods that require inventory tracking (SKUs), whereas F&B modifiers are often non-stock instructions or add-ons that only affect price.

## Decision
We will cleanly separate the two concepts:
- **Variant (SKU)**: Represents physical stock. Inventory will only be tracked at this level.
- **Modifier / ModifierGroup**: Represents non-stock instructions or add-ons. They do not have inventory quantities.

## Consequences
- **Positive**: Simplifies inventory management. We don't need a complex Bill of Materials (BOM) to sell a milk tea with boba. Retail items have clear SKUs.
- **Negative**: The UI and data schema must support two different mechanisms for customizing an `Item`, slightly increasing frontend complexity.
