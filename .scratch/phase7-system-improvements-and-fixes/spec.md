# Spec: Phase 7 - System Improvements and Fixes

Status: ready-for-agent

## Problem Statement

Users and store operators encounter friction and data integrity risks across several day-to-day touchpoints in the application:
1. When cashiers or administrators enter incorrect credentials on the login screen, there is no explicit, visual error banner in the login box, leaving users confused about whether the submission failed, the network dropped, or credentials were invalid.
2. In the top navigation bar, the active user’s name is absent and there is no visual distinction between a store Administrator and standard Staff, making it unclear which role is operating the terminal.
3. The order deletion API directly deletes order records from the database without executing compensating stock operations, reverting promotion quotas, restoring customer lifetime metrics, or revoking remote payment requests. This bypasses the strict accounting and inventory invariants established for order cancellations and creates phantom inventory loss.
4. Data mutating actions (CREATE, UPDATE, DELETE) across entities like Users, Promotions, Modifiers, and entity Updates are not consistently recorded in the centralized Activity Log, creating blind spots in the store audit trail.
5. Store managers cannot update existing Items, Categories, or Users; only creation and deletion are currently supported, forcing managers to delete and recreate entities whenever details change.

## Solution

A cohesive set of frontend and backend improvements addressing auth feedback, user identity, transactional accounting integrity, unified auditing, and complete CRUD management:
1. Provide an explicit, user-friendly error alert box within the login form for invalid credentials or disabled accounts, backed by standardized HTTP 401 responses from the authentication API.
2. Display the current user's name alongside an unmistakable role badge ( Quản trị viên vs Nhân viên) directly in the Menubar.
3. Align order deletion (DELETE /orders/{id}) with the compensating cancellation state machine (ADR 0006 & ADR 0008), blocking deletion of completed orders and atomically executing full stock/CRM/promotion compensation for pending orders before record removal.
4. Establish unified audit logging across all mutating operations (CREATE, UPDATE, DELETE) for all administrative entities (ITEM, CATEGORY, USER, PROMOTION, MODIFIER, CUSTOMER, ORDER), resolving the actor identity automatically from the security session context.
5. Implement full update capabilities (RESTful PUT endpoints and dedicated Edit Modals) for Categories, Items, and Users, with support for file uploads, attribute preservation, and optional password resets.

## User Stories

1. As a store cashier, I want to see an immediate, clear error alert on the login screen when I type the wrong password, so that I know exactly why login failed without guessing.
2. As an inactive or disabled user, I want to see a specific alert message explaining that my account has been disabled, so that I understand I need to contact my manager.
3. As a user on the login screen, I want the submit button to show a loading spinner during authentication, so that I do not submit multiple requests accidentally.
4. As a cashier or admin, I want to see my display name and role badge clearly visible in the top Menubar, so that I can immediately verify which account is currently active on this POS station.
5. As a store manager, I want the Menubar to display a distinct badge for Quản trị viên (Admin) and Nhân viên (Staff), so that unauthorized staff cannot mistakenly operate under administrative sessions.
6. As a store manager, I want the system to reject any attempt to delete a completed order, so that historical sales records, tax receipts, and revenue reports cannot be erased.
7. As a store operator, I want deleting a pending order to automatically return its reserved inventory to the warehouse ledger, so that products are not lost or trapped in negative stock.
8. As a customer, I want any promotion coupon or discount quota applied to a deleted pending order to be restored, so that I can reuse my valid discount on my next purchase.
9. As a store accountant, I want a customer’s total spend and order count to be adjusted if a pending order linked to their profile is deleted, so that CRM loyalty tier metrics remain accurate.
10. As a store cashier, I want any active PayOS checkout QR link to be cancelled remotely when its pending order is deleted, so that customers cannot pay for an order that is being discarded.
11. As a store manager, I want deleting an already cancelled order to remove the record cleanly without duplicating the inventory return, so that stock counts remain perfectly balanced.
12. As a store auditor, I want every user creation, update, and deletion to be recorded in the Activity Log, so that unauthorized staff account modifications can be traced.
13. As a store auditor, I want every promotion and modifier creation, update, and deletion to be recorded in the Activity Log, so that discount changes and price modifications are transparent.
14. As a store auditor, I want every item and category modification to be recorded in the Activity Log, so that catalog changes have a clear history.
15. As a store auditor, I want the system to automatically capture the authenticated user's email for each logged activity without relying on manual client input, so that the audit trail cannot be forged.
16. As an administrator, I want to edit a category's name, description, background accent color, and image via a modal, so that I can rebrand or refine catalog organization without deleting the category and losing linked items.
17. As an administrator, I want to update an item's details, price, category, variants, modifiers, and image, so that product information stays up-to-date with supplier changes.
18. As an administrator, I want to edit a user’s display name, email, and role, so that employee promotions or email corrections can be applied smoothly.
19. As an administrator, I want the option to update a user's password or leave it blank to keep their existing password, so that administrative profile edits do not force unwanted credential resets.
20. As an administrator, I want edit modals to validate required fields and display clear error messages if input requirements are not met, so that invalid data is rejected before submission.

## Implementation Decisions

### Authentication & Feedback
- The authentication controller handles bad credentials and disabled accounts, returning HTTP 401 with standard error descriptions ("Email hoặc mật khẩu không chính xác", "Tài khoản đã bị vô hiệu hóa").
- The authentication response contract includes `email`, `name`, `role`, and `token`. Both initial login and token refresh endpoints populate the user's `name` from the user store.
- The frontend login form includes a dedicated alert callout above input fields, displaying server error feedback alongside existing toast notifications.

### Navigation & Role Representation
- The desktop navigation bar renders the authenticated user's display name and a color-coded role badge (Quản trị viên for ROLE_ADMIN, Nhân viên for ROLE_STAFF) adjacent to the profile avatar button.
- The session state initializes the user's name on fresh logins as well as silent token refreshes.

### Order Deletion & Invariant Enforcement (ADR 0006 & ADR 0008)
- Order deletion enforces strict lifecycle validation:
  - Orders in COMPLETED status cannot be deleted (HTTP 400 Bad Request).
  - Orders in PENDING status trigger atomic compensation before deletion: creating inventory IN transactions, updating variant cached stock, decrementing promotion usage counters, reverting customer CRM spend/order metrics, and cancelling remote payment links.
  - Orders in CANCELLED status have already undergone compensation; the database record is removed directly.
- The deletion operation emits an ActivityLog entry with action DELETE and entity type ORDER.

### Unified Activity Logging
- All mutation workflows across domain services (ItemService, CategoryService, UserService, PromotionService, ModifierGroupService, CustomerService, OrderService) emit ActivityLog entries for CREATE, UPDATE, and DELETE.
- The logging service extracts the current actor's email from the security context if no explicit email is passed, falling back to a system actor only for unattended background processes.

### Entity Updates (Categories, Items, Users)
- **Category Update**:
  - REST endpoint: `PUT /admin/categories/{categoryId}` with multipart form data (`category` JSON string and optional `file`).
  - Supports updating name, description, background color, and replacing or retaining the existing image.
  - Emits ActivityLog with action `UPDATE` and entity type `CATEGORY`.
  - Frontend: An edit action button on each category card opening an `EditCategoryModal`.
- **Item Update**:
  - REST endpoint: `PUT /admin/items/{itemId}` with multipart form data (`item` JSON string and optional `file`).
  - Supports updating title, description, base price, category relationship, modifier group links, and variant attributes/prices while keeping or updating image storage.
  - Emits ActivityLog with action `UPDATE` and entity type `ITEM`.
  - Frontend: An edit action button on each item card opening an `EditItemModal`.
- **User Update**:
  - REST endpoint: `PUT /admin/users/{userId}` with JSON body (`UserRequest`).
  - Supports updating name, email, and role. If a new password is provided, it is securely hashed; if omitted or blank, the existing hashed password is preserved.
  - Emits ActivityLog with action `UPDATE` and entity type `USER`.
  - Frontend: An edit action button on each user row opening an `EditUserModal`.

## Testing Decisions

### Seam Architecture
- **Primary Backend Seam**: Spring Boot MockMvc / Controller Integration Tests (`@SpringBootTest`, `@AutoConfigureMockMvc`).
  - Tests simulate external HTTP requests with security authentication tokens and multipart files, exercising controller validation, service business logic, transactional compensations, and database persistence end-to-end.
  - Existing prior art: `OrderLifecycleIntegrationTest.java`, `ActivityLogIntegrationTest.java`, `OrderPaginationIntegrationTest.java`.
- **Primary Frontend Seam**: Automated Node/API integration and smoke verification scripts (`test-m2-adversarial.mjs` style or component interaction tests).
  - Tests verify that API responses map cleanly to frontend session stores, modal forms trigger appropriate mutation hooks, and error banners render correctly upon failure responses.

## Out of Scope
- Complete redesign of the navigation layout or multi-tenant branding.
- Bulk batch editing or bulk deletion of catalog items or users.
- Automated migration to database schema tools (Flyway/Liquibase), which remains documented tech debt.

## Further Notes
- Respect all system invariants recorded in CONTEXT.md and docs/adr/ (ADR 0001 through ADR 0008).
- Ensure all API endpoints preserve the raw DTO wrapping rule (no global envelope like { data, status, message }).
