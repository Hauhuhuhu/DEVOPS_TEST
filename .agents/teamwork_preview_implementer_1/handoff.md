# Handoff Report: Auth State Persistence & Bootstrap-to-Tailwind Migration

> [!WARNING] **Skepticism Disclaimer**
> Highly confident in the compile, bundle, lint, and static class audits (0 Bootstrap artifacts remaining, clean Tailwind build), but backend-dependent flows (PayOS QR code live polling, real server image uploads, and physical thermal printing) could not be tested against a live Spring Boot server in this offline environment.

## 1. What I changed
- **`Front-end/src/hooks/useCurrentUser.js`**: Created new hook using React Query with `initialData` reading `token` and `role` from `localStorage`, ensuring instant hydration upon page reload without loss of admin state.
- **`Front-end/src/features/Auth/useLogin.js`**: Ensured synchrony between React Query cache `["user"]` and `localStorage`.
- **`Front-end/src/features/Auth/useLogout.js`**: Replaced `queryClient.removeQueries()` with `queryClient.clear()` matching `axiosConfig.js` 401 interceptor.
- **`Front-end/src/features/Auth/LoginForm.jsx`**: Removed hardcoded credentials (`hauthaut32@gmail.com` / `123456`) so fields initialize empty; migrated completely to Tailwind CSS with responsive card and loading spinner.
- **`Front-end/src/ui/Menubar.jsx`**: Replaced CSS `group-hover` dropdown with click-controlled state using `useOutsideClick`; auto-closes on route change or link selection; auto-collapses mobile drawer; integrated `useCurrentUser`; displays detailed role labels in profile menu.
- **`Front-end/package.json`**: Removed `bootstrap` and `bootstrap-icons` packages from dependencies.
- **`Front-end/src/main.jsx`**: Removed all Bootstrap CSS/JS and Bootstrap Icons imports.
- **`Front-end/src/index.css`**: Added CRM design tokens (CSS variables: `--color-primary`, `--color-accent`, etc.); removed legacy Bootstrap and obsolete CSS classes (`.item-container`, `.left-column`, etc.).
- **`Front-end/src/App.css`**: Emptied obsolete dark-theme Bootstrap overrides.
- **`Front-end/src/ui/AppLayout.jsx`**: Modernized layout shell to `min-h-screen bg-slate-50 flex flex-col`.
- **`Front-end/src/ui/Spinner.jsx`**: Rewritten using Tailwind `animate-spin` and Lucide `Loader2`.
- **`Front-end/src/ui/NotFound.jsx`**: Rewritten with Tailwind CSS and React Router `Link`.
- **`Front-end/src/ui/Modal.jsx`**: Rewritten with Tailwind overlay and Lucide `X` icon.
- **`Front-end/src/pages/Dashboard.jsx`**: Fully migrated to Tailwind CSS CRM theme (stat cards with colored circles, recent orders table, color-coded status badges, formatted currency).
- **`Front-end/src/pages/OrderHistory.jsx`**: Migrated to Tailwind CSS with sticky header table, color-coded status badges, formatted VND currency, and print receipt trigger.
- **`Front-end/src/pages/ManageItems.jsx`, `ManageCategory.jsx`, `ManageModifiers.jsx`, `ManageUsers.jsx`**: Migrated to standard two-column layout (`w-96 flex-shrink-0` left panel, `flex-1 overflow-auto` right panel).
- **`Front-end/src/pages/ManageCustomers.jsx`**: Migrated to Tailwind CSS; search bar with clear button, customer count badge, edit/delete actions with Lucide icons.
- **`Front-end/src/pages/ManagePromotions.jsx`**: Migrated 24KB file to Tailwind CSS; 100% of business logic (Coupon, Happy Hour, BOGO, days of week, usage limit, active toggle) preserved.
- **`Front-end/src/features/Category/*` (`CategoryForm.jsx`, `CategoryList.jsx`, `CategoryListItem.jsx`)**: Migrated to Tailwind CSS with image upload preview and Lucide icons.
- **`Front-end/src/features/Modifiers/*` (`ModifierGroupForm.jsx`, `ModifierGroupList.jsx`)**: Migrated to Tailwind CSS with dynamic option inputs and Lucide icons.
- **`Front-end/src/features/Users/*` (`UserForm.jsx`, `UsersList.jsx`, `UserItem.jsx`)**: Migrated to Tailwind CSS with Lucide icons.
- **`Front-end/src/features/Items/*` (`ItemForm.jsx`, `ItemList.jsx`, `Item.jsx`)**: Migrated to Tailwind CSS; dynamic variants, attributes, and modifier group attachments preserved.
- **`Front-end/src/features/Inventory/StockOperationModal.jsx`**: Migrated modal to Tailwind CSS dialog; Stock IN/OUT, Stock Check with discrepancy calculation, and Ledger History tabs preserved.
- **`Front-end/src/features/Payment/*` (`CompletedPayment.jsx`, `QRCode.jsx`)**: Migrated to Tailwind CSS with clean payment details and QR code display.
- **`Front-end/src/pages/Explore/Explore.jsx` & `Explore.css`**: Migrated POS two-column screen to Tailwind CSS; emptied `Explore.css`.
- **`Front-end/src/features/Explore/*` (`DisplayCategories.jsx`, `DisplayCategory.jsx`, `DisplayItems.jsx`, `DisplayItem.jsx`, `SearchBox.jsx`, `CartItems.jsx`, `CartSummary.jsx`, `CustomerForm.jsx`, `POSItemModal.jsx`, `ReceiptPopup.jsx`)**: Migrated all POS components to Tailwind CSS, preserving 100% of operational behavior, modifier customization, cart calculations, PayOS modal, and receipt printing.

## 2. Why
- Eliminates auth state split between `localStorage` and React Query cache, ensuring admin privileges and "Manage" dropdown survive browser reloads (F5).
- Replaces brittle hover interactions on navigation menus with accessible click controls and auto-close behaviors.
- Completes the visual migration from Bootstrap 5 to Tailwind CSS with a unified CRM design token system, drastically reducing bundle size and removing visual conflicts.
- Hardcoded test credentials on the login screen were removed to conform to security standards.

## 3. Verification Record
- **Deep Verification (ran actual tests & scripts):**
  1. `npm run build` in `Front-end`: Built in 666ms with 0 errors (dist CSS dropped from 334.19 kB to 37.45 kB; all Bootstrap fonts eliminated).
  2. `npm run lint` in `Front-end`: Completed with 0 errors and 0 warnings across all source files.
  3. Node AST / Regex Audit across all `Front-end/src` files:
     - Regex matching `\b(btn|form-control|form-select|form-check|spinner-border|d-flex|d-grid|d-block|vh-100|item-container|left-column|right-column)\b` and `\bbi-[a-z]+`: 0 matches found.
     - Dependency audit: `bootstrap` and `bootstrap-icons` absent from `package.json`, `main.jsx`, and `index.css`.
  4. Auth State Node Simulation:
     - Tested `initialData` synchronization with TanStack Query on Admin (`ROLE_ADMIN`), Staff (`ROLE_USER`), and logged-out scenarios. All assertions passed.
- **Shallow Verification (manual review):**
  - Eyeballed all converted JSX structures against their original functional requirements.
- **Unverified aspects:**
  - Live backend network interaction with Spring Boot API (`http://localhost:8080/api/v1.0`).
  - Real browser hardware print rendering for `window.print()` in `ReceiptPopup.jsx`.

## 4. Known Issues
- `Minor Robustness Risk` — PayOS checkout redirects depend on an active third-party PayOS API webhook and network connectivity.

## 5. Untested Edge Cases & Next Step
- Reviewer should test browser reload (F5) on `/items` or `/dashboard` with `ROLE_ADMIN` in localStorage to confirm the "Manage" dropdown persists seamlessly.
- Reviewer should test POS cart checkout flow with both CASH and PayOS payment methods.
