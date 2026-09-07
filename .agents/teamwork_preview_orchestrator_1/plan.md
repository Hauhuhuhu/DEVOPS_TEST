# Phase 4 Plan: Activity Logs & Full UX Refinement

## Architectural Overview
Full-stack enhancement of Billing App (Java Spring Boot 4.1.0 + React 19 + Tailwind CSS + TanStack Query).
All work adheres strictly to existing architectural constraints:
- Raw DTO conventions (no generic global wrappers).
- TanStack Query for state and cache invalidation.
- Tailwind CSS design tokens (Blue-600 primary, Emerald accent, Slate-50 background).
- Non-blocking audit logging for all business mutations.

## Step-by-Step Milestones
1. **Milestone 0: Survey & Architecture Discovery**
   - Survey backend controllers, services, entities, DTOs, and event publishers.
   - Survey frontend components, forms, modals, table layouts, and routing.
   - Synthesize findings into `PROJECT.md`.

2. **Milestone 1: Dashboard Metric & Delete Confirmation Modal (R4 & R3)**
   - Dashboard: Fix label to "Today's Orders" and bind to `todayOrderCount`.
   - Delete Modal: Implement `ConfirmDeleteModal` and replace all `window.confirm` in 6 entity views.

3. **Milestone 2: Unified Form Validation UX (R2)**
   - Standardize all 8 forms onto `react-hook-form`.
   - Dual-action error notification: toast via `react-hot-toast` + red border `border-red-500` + inline message.

4. **Milestone 3: Order History Scalability & Table Experience (R5)**
   - Backend: `GET /api/v1.0/orders` with `Pageable`, `search`, and `status` returning `OrderPageResponse`.
   - Frontend: Sticky header table (`sticky top-0`) with internal scroll, pagination controls (10, 20, 50).

5. **Milestone 4: Activity Log Subsystem Backend (R1 Backend)**
   - `ActivityLog` entity, repository, async event-driven logging service.
   - Endpoints: `GET /api/v1.0/activity-logs` with role-based filtering (Staff sees own; Admin sees all with user, action, date range).
   - Capture Login, Order creation, Item/Category/User/Modifier/Promotion/Customer/Stock adjustments.

6. **Milestone 5: Activity Log Subsystem Frontend (R1 Frontend)**
   - Activity Log service with TanStack Query.
   - Link `/activity-logs` in Menubar profile dropdown.
   - Page with date presets, action filters, badges, and paginated records.

7. **Milestone 6: Dual Track Verification, E2E Testing & Forensic Audit**
   - Complete verification: Backend `./mvnw test` / `./mvnw test-compile`, Frontend `npm run build` / `npm run lint`.
   - Final audit verification with Forensic Auditor (`teamwork_preview_auditor`).
