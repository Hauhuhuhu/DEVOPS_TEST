# 05 — Activity Log: Backend Entity, Service, Audit Triggers & REST API

Status: resolved
Type: task

## Summary

Build the backend Activity Log engine to persist audit logs for all critical system actions (Auth, Sales/Orders, CRUD Items, Categories, Users, Modifiers, Promotions, Customers, Inventory). Expose a secure paginated REST API endpoint with role-based filtering.

## Acceptance Criteria

- [x] Create `ActivityLogEntity` mapping to `tbl_activity_logs`:
  - `id`, `logId` (UUID), `userEmail`, `actionType` (LOGIN, CREATE, UPDATE, DELETE), `entityType` (ORDER, ITEM, CATEGORY, USER, CUSTOMER, PROMOTION, MODIFIER, INVENTORY), `entityId`, `description`, `createdAt`.
- [x] Create `ActivityLogRepository` supporting `Pageable`, filtering by `userEmail`, `actionType`, and date range (`startDate`, `endDate`).
- [x] Create `ActivityLogResponse` and `ActivityLogPageResponse` DTOs (raw DTOs following `CONTEXT.md`).
- [x] Create `ActivityLogService` and implementation with `logActivity(...)` and `getActivityLogs(...)`.
- [x] Instrument key business actions to record logs:
  - `AuthController`: User login.
  - `OrderServiceImpl`: Order creation.
  - `ItemServiceImpl`, `CategoryServiceImpl`, `UserServiceImpl`, `PromotionServiceImpl`, `CustomerServiceImpl`, `InventoryTransaction`: CRUD operations.
- [x] Expose `GET /activity-logs` endpoint:
  - Authenticated user required.
  - Staff user (`ROLE_USER`): query is restricted to their own email.
  - Admin user (`ROLE_ADMIN`): can query all logs, or filter by specific `userEmail`.
  - Supports query parameters: `page`, `size`, `userEmail`, `actionType`, `startDate`, `endDate`.

## Key Decisions

- Logging calls must catch errors gracefully so audit log failures never break core business transactions.
- Raw DTO structure according to system invariants.

## Modules Affected

- `billingsoftware/src/main/java/learn/java/billingsoftware/entity/ActivityLogEntity.java` — NEW
- `billingsoftware/src/main/java/learn/java/billingsoftware/repository/ActivityLogRepository.java` — NEW
- `billingsoftware/src/main/java/learn/java/billingsoftware/io/ActivityLogResponse.java` — NEW
- `billingsoftware/src/main/java/learn/java/billingsoftware/io/ActivityLogPageResponse.java` — NEW
- `billingsoftware/src/main/java/learn/java/billingsoftware/service/ActivityLogService.java` — NEW
- `billingsoftware/src/main/java/learn/java/billingsoftware/service/impl/ActivityLogServiceImpl.java` — NEW
- `billingsoftware/src/main/java/learn/java/billingsoftware/controller/ActivityLogController.java` — NEW
- Triggers in existing services (`AuthController`, `OrderServiceImpl`, etc.) — MODIFY
