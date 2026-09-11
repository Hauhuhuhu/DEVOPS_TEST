# 06: Item Update Management

**What to build:**
Allow administrators to edit product items, including updating name, description, price, category association, attached modifier groups, variant attributes, and replacing the product image. The backend exposes an update endpoint supporting multipart request data. If a new image file is provided, it replaces the existing asset; otherwise the current image URL is retained. Variant relationships and modifier group associations are updated cleanly. The item management view features an edit button on each item card opening an Edit Item modal pre-populated with current item details. Saving modifies the item, emits an activity log, and refreshes the items list.

**Blocked by:** 03: Unified Activity Logging across Mutations, 04: Category Update Management

**Status:** closed

- [x] Item update API endpoint accepts multipart data with item JSON and optional image file
- [x] Item update modifies name, description, price, category association, variants, and modifier groups
- [x] Item update preserves current image URL when no new image file is uploaded
- [x] Item update uploads new file and updates image URL when a new file is uploaded
- [x] Updating an item emits an ActivityLog record with action UPDATE and entityType ITEM
- [x] Item card displays an Edit action button opening a dedicated Edit Item modal
- [x] Modal pre-populates category choices, variants, and modifiers, validating required fields
- [x] Successful update refreshes item query cache and displays confirmation toast

