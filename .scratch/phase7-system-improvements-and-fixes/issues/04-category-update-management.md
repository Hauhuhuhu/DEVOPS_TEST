# 04: Category Update Management

**What to build:**
Allow administrators to edit existing category details without having to delete and recreate them. The backend exposes a dedicated update endpoint supporting category name, description, background accent color, and optional replacement of the category image file (or retaining the existing image if no new file is provided). The category management view features an edit button on each category card that opens an Edit Category modal pre-filled with the category data. Saving updates the server, updates the audit log, invalidates client queries, and refreshes the displayed list.

**Blocked by:** 03: Unified Activity Logging across Mutations

**Status:** closed

- [x] Category update API endpoint accepts multipart data with category JSON and optional image file
- [x] Category update modifies name, description, and background color while preserving existing image when no new file is uploaded
- [x] Category update replaces image in cloud storage and updates image URL when a new file is uploaded
- [x] Updating a category emits an ActivityLog record with action UPDATE and entityType CATEGORY
- [x] Category card displays an Edit action button opening a dedicated Edit Category modal
- [x] Modal validates required fields and submits updates via mutation hook
- [x] Successful update refreshes category list and displays confirmation toast
