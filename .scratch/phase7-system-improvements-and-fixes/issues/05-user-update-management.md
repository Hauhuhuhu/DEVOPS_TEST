# 05: User Update Management

**What to build:**
Allow administrators to edit user accounts without deleting them. The backend exposes an update endpoint for user details supporting display name, email address, role (Admin or Staff), and optional password modification. If a new password is submitted, it is securely encoded; if omitted or blank, the user's existing hashed password remains unchanged. The user management view features an edit button on each user row that opens an Edit User modal. Saving updates the server, emits an activity log, and refreshes the user list.

**Blocked by:** 03: Unified Activity Logging across Mutations

**Status:** closed

- [x] User update API endpoint updates user display name, email, and role
- [x] User update securely encodes new password if provided, or leaves existing password intact if left blank
- [x] User update validates email uniqueness against other users
- [x] Updating a user emits an ActivityLog record with action UPDATE and entityType USER
- [x] User list item displays an Edit action button opening a dedicated Edit User modal
- [x] Modal allows changing name, email, role, and optional password with clear form validation
- [x] Successful update refreshes user query cache and displays confirmation toast

