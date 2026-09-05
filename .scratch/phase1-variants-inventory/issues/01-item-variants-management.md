# 01: Item Variants Management (Retail Flow)

**What to build:** 
A store manager can create and view an `Item` along with its physical `Variant`s (SKUs, JSON Attributes like Color/Size, and Base Price) from the frontend UI down to the database. The feature should support adding multiple variants to a single item and gracefully handle legacy API clients without breaking existing flows.

**Blocked by:** None (can start immediately).

**Status:** closed
Completed: true

- [x] Manager can view a list of items and their variants on the frontend.
- [x] Manager can create a new Item with at least one Variant specifying SKU, Base Price, and dynamic JSON attributes.
- [x] Backend API accepts variant creation and stores them in a new `Variant` database table.
- [x] API integration tests confirm the correct creation and retrieval of variants.

