# 05: Hoisted Single Modal Architecture for Catalog and User Lists

**What to build:**
Store administrators can manage Items, Categories, and Users through fluid, memory-efficient table views that no longer instantiate individual deletion mutation hooks or separate hidden modal dialog trees inside every single row. Clicking "Edit" or "Delete" opens a single, centralized modal dialog managed at the list container level.

**Blocked by:** None (can start immediately)

**Status:** closed
<!-- closed: 2026-09-12 by agent -->

- [x] In `ItemList`, `itemToDelete` and `itemToEdit` states are hoisted to the parent list component, rendering exactly one deletion modal and one edit modal for the entire view.
- [x] Individual `Item` rows receive clean `onEdit` and `onDelete` callbacks and no longer mount their own nested modal dialogs or mutation hooks.
- [x] In `CategoryList`, deletion and editing modals are hoisted to the parent container, and `CategoryListItem` renders purely presentational content with memoization.
- [x] In `UsersList`, deletion and editing modals are hoisted to the parent list, and `UserItem` renders purely presentational content with memoization.
- [x] Catalog and user list filtering computations are memoized via `useMemo`.
