# 03: Unified Activity Logging across Mutations

**What to build:**
Ensure all state-modifying operations (creation, updating, and deletion) across every administrative domain entity produce a unified audit record in the activity log. This covers Items, Categories, Users, Promotions, Modifier Groups, Customers, and Orders. The logging mechanism automatically extracts the authenticated actor's email from the security context whenever an explicit email is not passed. The activity log management page reliably reflects all system updates with clear descriptions and correct entity associations.

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] Logging service automatically extracts authenticated user email from security context when null or blank
- [x] User creation and deletion operations emit CREATE and DELETE activity logs
- [x] Promotion creation, update, and deletion operations emit appropriate activity logs
- [x] Modifier group creation, update, and deletion operations emit appropriate activity logs
- [x] Category and Item operations consistently emit activity logs for all mutations
- [x] Activity logs page displays accurate actor emails, actions, entity types, and descriptions for all management activities
