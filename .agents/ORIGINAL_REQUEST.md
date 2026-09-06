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
