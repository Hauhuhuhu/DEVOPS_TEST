# ADR 0005: Use JSON for Dynamic Variant Attributes

## Context
The POS system serves both F&B and Retail. Retail items have variations like Color and Size. Other retail sectors might have Capacity, Material, or Scent. Hardcoding these columns into the `Variant` table (e.g., `variant_color`, `variant_size`) would make the schema rigid and difficult to scale across different business types.

## Decision
We will use a dynamic JSON column `attributes` on the `Variant` table to store variant traits (e.g., `{"Color": "Red", "Size": "L"}`).

## Consequences
- **Positive**: Extreme flexibility. The database schema remains clean and does not need migrations when a merchant sells a new category of products.
- **Negative**: Querying by specific attributes (e.g., "Find all Red variants") inside the database is slightly slower and more complex using JSON functions compared to standard indexed columns. However, typically filtering by Variant traits is done in-memory on the frontend or via dedicated search indexing, minimizing this drawback.
