# 02: Item Modifiers Management (F&B Flow)

**What to build:** 
A store manager can create `ModifierGroup` (e.g., Sugar Level) and `Modifier` (e.g., 50% Sugar, +$0) options, and link them to Items from the frontend UI down to the database. This allows F&B items to be customizable without affecting physical stock.

**Blocked by:** None (can start immediately).

**Status:** closed
Completed: true

- [x] Manager can create modifier groups and individual modifiers with price adjustments via the UI.
- [x] Manager can attach these modifier groups to specific Items.
- [x] Backend API securely saves `ModifierGroup` and `Modifier` tables and their relationships.
- [x] Frontend UI correctly fetches and displays the assigned modifiers for an item.
- [x] API integration tests confirm creation and linkage of modifiers.
