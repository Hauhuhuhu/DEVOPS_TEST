# Original User Request

## 2026-09-06T07:14:35Z

This is a single self-contained fix; keep it small and focused. Use a small focused team (one implementer with repeated adversarial review).

Resolve frontend authentication state loss on page refresh and complete the migration of the React frontend from Bootstrap 5 to Tailwind CSS with unified CRM design tokens, preserving 100% of existing business logic across POS, Admin Management, Dashboard, and Order History screens.

Working directory: e:/Learn JavaSpringBoot with ReactJs/Billing-app
Integrity mode: development

Specification and Sub-Issues:
- Spec: .scratch/phase3-auth-state-ui-migration/spec.md
- Sub-issues: .scratch/phase3-auth-state-ui-migration/issues/01-auth-state-usecurrentuser.md through 06-explore-pos-migration.md

## Requirements

### R1. Auth State Persistence & Menubar Interaction
Auth state and user role must persist across browser page reloads (F5) so that Admin and Staff permissions and UI items remain intact without requiring re-login. Dropdown menus in the Menubar must toggle via user interaction (click) rather than hover, close on outside clicks and route changes, and mobile navigation must automatically collapse upon navigating. Login form must initialize without hardcoded test credentials.

### R2. Styling System Migration & Design Tokens
Bootstrap 5 and Bootstrap Icons must be completely removed from the project dependencies and stylesheets. A unified CRM-style visual theme (light mode with primary blue-600, accent emerald-600, slate-50 background) using Tailwind CSS and CSS design tokens must be established across the entire application shell, common components, and typography.

### R3. Core & Management Pages Migration
Dashboard, Order History, and Admin Management interfaces (Items, Categories, Modifiers, Users, Customers, Promotions) must be migrated to Tailwind CSS while adhering to a consistent layout pattern (two-column layout for resource management) and status badge conventions. All existing business logic, validation rules, image uploads, variant management, and promotion configurations must remain 100% intact and functional.

### R4. POS / Explore Screen Migration
The Point of Sale (POS / Explore) screen must be fully migrated from Bootstrap to Tailwind CSS. The two-column split layout (product selection left, order cart right), item customization modals, modifier selections, and receipt printing must be visually updated to match the design system while strictly retaining their operational behavior.

## Acceptance Criteria

### Auth & Navigation
- [ ] User role and authentication state survive a page reload (F5) without losing Admin access or navigation entries.
- [ ] Admin "Manage" dropdown and Profile menu open on click, close on outside click, and close on selecting a link.
- [ ] Mobile navigation closes automatically when a route navigation link is selected.
- [ ] Login form fields initialize empty with no pre-filled credentials.

### Styling & Code Cleanliness
- [ ] No Bootstrap packages in package.json, and zero Bootstrap CSS/JS imports in src/main.jsx and src/index.css.
- [ ] Zero lingering Bootstrap utility classes (d-flex, card, form-control, btn, vh-100, spinner-border, etc.) in the migrated components.
- [ ] npm run build in Front-end completes successfully with zero compile or bundling errors.
- [ ] npm run lint in Front-end completes with zero lint errors.

### Functional Integrity
- [ ] POS order creation, modifier customization, cart calculations, and receipt modal function without regression.
- [ ] Admin forms (Item with image upload and variants, Category, Modifier Group, Promotion, Customer, User) submit and update data successfully.
- [ ] Order History displays formatted currency, color-coded status badges, and receipt actions correctly.

## 2026-09-07T03:28:48Z

Implement Phase 4 (Activity Logs & Full UX Refinement) for the Billing App: building an end-to-end audit activity log system, standardizing form validation across all modules, replacing browser alerts with a modern delete confirmation modal, fixing dashboard order metrics, and overhauling order history with server-side pagination and internal sticky scroll.

Working directory: e:/Learn JavaSpringBoot with ReactJs/Billing-app
Integrity mode: demo

Reference spec: .scratch/phase4-activity-logs-ux-refinement/spec.md
Reference issues: .scratch/phase4-activity-logs-ux-refinement/issues/

## Requirements

### R1. Activity Log Subsystem (Backend & Frontend)
Implement an audit trail system that captures key business events across the application (User Login, Order Creation, and CRUD operations on Items, Categories, Users, Modifiers, Promotions, Customers, and Inventory adjustments). Expose an authenticated, paginated API endpoint `GET /api/v1.0/activity-logs` with role-based visibility (Staff users can only view their own logs; Admin users can query all logs with filtering by user email, action type, and date range). Build an Activity Log page at `/activity-logs` linked directly from the navigation bar profile dropdown, featuring date presets, action filters, and descriptive badges. Audit logging must run non-blockingly to avoid disrupting primary business transactions.

### R2. Unified Form Validation UX
Standardize all forms in the application (`LoginForm`, `CategoryForm`, `ItemForm`, `UserForm`, `ModifierGroupForm`, `ManageCustomers`, `ManagePromotions`, and `StockOperationModal`) onto `react-hook-form`. On any invalid submission, show an immediate toast notification via `react-hot-toast`, highlight invalid input fields with red borders, and render an inline error message directly beneath each invalid field. Correcting an invalid input must immediately clear its error styling and message.

### R3. Reusable Delete Confirmation Modal
Replace all instances of raw browser `window.confirm` across the application with an accessible `ConfirmDeleteModal` component. The modal must display a clear warning icon, indicate the specific name of the entity being deleted, offer Cancel and Delete actions, and show a loading spinner while disabling interactions during active deletion requests.

### R4. Dashboard Order Metric Synchronization
Update the dashboard order card label to "Today's Orders" to match "Today's Sales", and bind the counter to the backend's real-time count of orders placed today (`todayOrderCount`), displaying 0 if data is missing or loading.

### R5. Order History Scalability & Table Experience
Refactor the Order History module to handle large datasets efficiently. On the backend, update order retrieval to support Spring Data `Pageable` with search (Order ID, Customer Name, Phone Number) and payment status filtering, returning a paginated response adhering to the project's raw DTO convention (`OrderPageResponse`). On the frontend, provide an internal scroll container with a sticky table header (`sticky top-0`), search bar, status dropdown, and a full pagination control bar with adjustable page sizes.

## Acceptance Criteria

### Activity Logs
- [ ] `GET /api/v1.0/activity-logs` returns paginated audit records conforming to `ActivityLogPageResponse` DTO.
- [ ] Non-admin authenticated users are strictly restricted to querying logs matching their own email.
- [ ] Admin users can query all logs and filter by user email, action type, and date range.
- [ ] User login, order placement, stock operations, and catalog/customer/promotion mutations create audit records.
- [ ] The "Activity Log" option in the Menubar user dropdown navigates to `/activity-logs`.
- [ ] The `/activity-logs` page displays time, user email, action badge, target entity, and detail description, with working date and action filters.

### Form Validation
- [ ] All 8 target forms (`LoginForm`, `CategoryForm`, `ItemForm`, `UserForm`, `ModifierGroupForm`, `ManageCustomers`, `ManagePromotions`, `StockOperationModal`) use `react-hook-form`.
- [ ] Submitting empty/invalid fields displays an error toast notification.
- [ ] Submitting invalid fields applies red border styling (`border-red-500`) and displays an inline red error message below each invalid input.
- [ ] Resolving an invalid field removes the red border and error message.

### Delete Confirmation Modal
- [ ] Zero occurrences of `window.confirm` remain in the frontend codebase.
- [ ] Deletion actions in Item, Category, User, Customer, Promotion, and Modifier Group management open `ConfirmDeleteModal`.
- [ ] The entity's display name is clearly visible in the confirmation text.
- [ ] The confirm button shows a loading state and prevents double submissions during deletion.

### Dashboard Metric
- [ ] Dashboard stat card displays "Today's Orders" and reflects `todayOrderCount`.

### Order History Overhaul
- [ ] Backend `GET /api/v1.0/orders` supports `page`, `size`, `search`, and `status` parameters.
- [ ] The order table scrolls internally while keeping the header sticky at the top.
- [ ] Pagination controls allow switching pages and selecting page size (10, 20, 50).
- [ ] Searching by Order ID or phone number correctly filters the server results.

### Verification & Build Integrity
- [ ] Backend compiles cleanly and test suite passes (`billingsoftware/mvnw test` or `./mvnw test-compile`).
- [ ] Frontend builds cleanly with zero errors (`npm run build` in `Front-end`).
- [ ] Frontend passes ESLint checks (`npm run lint` in `Front-end`).

## Verification Resources

- Frontend build & lint command: `npm run build` & `npm run lint` inside `Front-end/`.
- Backend test & compile command: `./mvnw test` or `./mvnw test-compile` inside `billingsoftware/`.
- Existing specification & issues: `.scratch/phase4-activity-logs-ux-refinement/spec.md` and `.scratch/phase4-activity-logs-ux-refinement/issues/`.
