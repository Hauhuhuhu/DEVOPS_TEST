# Spec: Auth State Fix + Full UI/UX Migration (Phase 3)

Status: completed

---

## Problem Statement

Người dùng đang gặp ba vấn đề đan xen nhau trên giao diện frontend:

1. **Auth state mất sau reload (F5)**: Sau khi người dùng đăng nhập và tải lại trang, trạng thái Admin bị mất. Menu "Manage" dành cho Admin biến mất khỏi Menubar dù người dùng vẫn đang đăng nhập. Điều này xảy ra vì Menubar đọc `user` từ React Query cache — cache bị xóa khi reload — trong khi token hợp lệ vẫn còn trong `localStorage`.

2. **Dropdown "Manage" trên Menubar không hoạt động**: Dropdown được implement bằng CSS `group-hover`, không đóng khi người dùng click vào link bên trong, và không hoạt động đúng trên các thiết bị touch. Mobile menu cũng không tự đóng sau khi điều hướng.

3. **Giao diện không nhất quán**: `Menubar` đã được viết bằng Tailwind CSS nhưng toàn bộ các trang còn lại (Dashboard, OrderHistory, ManageCustomers, ManageItems, v.v.) và các feature components vẫn dùng Bootstrap 5. Điều này tạo ra sự xung đột về styling, phong cách visual không đồng nhất, và codebase khó bảo trì.

---

## Solution

Thực hiện nâng cấp toàn diện theo ba lớp đồng thời:

1. **Tạo `useCurrentUser` hook** làm single source of truth cho auth state, sử dụng `initialData` pattern để seed React Query cache từ `localStorage` ngay khi app boot — đảm bảo `isAdmin` luôn có giá trị chính xác ngay cả sau reload.

2. **Sửa Menubar**: Chuyển dropdown "Manage" sang click-controlled state, thêm logic đóng menu sau navigate, hiển thị thông tin user thực trong profile dropdown.

3. **Migration toàn bộ sang Tailwind CSS**: Xóa Bootstrap, áp dụng design system thống nhất (Light mode, blue-600 primary, emerald accent) cho tất cả pages và feature components. Logic nghiệp vụ được giữ nguyên 100%.

---

## User Stories

### Auth State

1. As a Staff user, I want the navigation menu to show the correct options after I reload the page, so that I don't have to log out and log in again every time.
2. As an Admin user, I want the "Manage" dropdown to remain visible after pressing F5, so that I can continue managing items without interruption.
3. As an Admin user, I want the profile avatar to correctly show "A" (or my initial) after reload, so that I can confirm I'm logged in with the right role.
4. As any authenticated user, I want automatic logout to work consistently whether triggered by token expiry (401) or manual logout button, so that the app behaves predictably in both cases.
5. As a developer, I want auth state to have a single source of truth, so that I only need to update one place when auth logic changes.

### Menubar Interaction

6. As a user, I want the "Manage" dropdown to open when I click the button (not hover), so that it works correctly on both desktop and touch devices.
7. As a user, I want the "Manage" dropdown to close automatically when I click a link inside it, so that I'm taken to the target page with the dropdown closed.
8. As a user, I want the "Manage" dropdown to close when I click anywhere outside it, so that it doesn't obstruct other content.
9. As a mobile user, I want the hamburger menu to close automatically after I tap a navigation link, so that I can see the target page immediately.
10. As a user, I want to see my role (Admin / Staff) displayed in the profile dropdown, so that I can verify which account I'm using.

### UI/UX — Global

11. As a user, I want all pages to have a consistent visual style (colors, fonts, spacing), so that the app feels professional and cohesive.
12. As a user, I want all interactive elements (buttons, inputs, dropdowns) to look and behave consistently across all pages, so that I don't have to re-learn UI patterns on each screen.
13. As a user, I want status badges (COMPLETED, PENDING, CANCELLED) to be color-coded consistently across Dashboard and Order History, so that I can scan status at a glance.
14. As a user on a small screen, I want all tables to be horizontally scrollable and readable without horizontal overflow breaking the layout.

### UI/UX — Login Page

15. As a new user, I want the login page to clearly show the BillingApp brand, so that I know I'm on the right application.
16. As a user, I want the login form to start with empty fields, so that my browser's autofill handles credentials securely (not hardcoded defaults).
17. As a user, I want clear visual feedback when I submit the login form (loading spinner, disabled state), so that I know the request is being processed.

### UI/UX — Dashboard

18. As an authenticated user, I want the Dashboard to show key metrics (Today's Sales, Total Orders) in prominent stat cards with icons, so that I can understand the business status at a glance.
19. As an authenticated user, I want the Recent Orders table to have a sticky header and be scrollable, so that I can browse orders without losing context of column labels.
20. As an authenticated user, I want currency amounts to be formatted consistently (e.g., ₫10.000) across Dashboard and all other pages.

### UI/UX — Order History

21. As an Admin or Staff user, I want the Order History page to have a clean table with clearly labeled columns, so that I can find specific orders efficiently.
22. As a user, I want the payment status to be color-coded (COMPLETED=green, PENDING=amber, CANCELLED/FAILED=red), so that I can identify problem orders instantly.
23. As a user, I want to print a receipt from Order History by clicking a button on each row, so that I can handle customer receipt requests quickly.

### UI/UX — Manage Pages (Items, Categories, Modifiers, Users, Customers)

24. As an Admin user, I want each management page to use a consistent two-column layout (form on left, list on right), so that I can add new records and review existing ones simultaneously.
25. As an Admin user, I want form inputs and labels to have consistent styling and spacing across all management pages, so that data entry feels uniform.
26. As an Admin user, I want the customer search bar to be prominent and easy to use, with a clear button to reset the search.
27. As an Admin user, I want delete confirmation to require explicit acknowledgment before proceeding, so that I don't accidentally remove records.
28. As an Admin user, I want action buttons (Edit, Delete) to have visible hover states and accessible tooltips, so that their function is clear.
29. As an Admin user, I want the Item creation form to retain its full functionality (image upload preview, variant SKU management, modifier group selection), just with improved styling.

### UI/UX — Promotions

30. As an Admin user, I want the Promotions management page to retain all its current functionality (create, edit, activate/deactivate) with consistent Tailwind styling.

### UI/UX — Explore (POS)

31. As a Staff user, I want the POS screen's two-column layout (product grid on left, cart on right) to be preserved exactly, so that my order-taking workflow is uninterrupted.
32. As a Staff user, I want category and item selection in the POS to have clear visual feedback (selected state highlight, hover effects), so that I can confirm my selections.

---

## Implementation Decisions

### Auth State Architecture

- **Single source of truth**: A new `useCurrentUser` hook is created. This hook calls `useQuery` with `queryKey: ["user"]` and `initialData` that reads `token` and `role` from `localStorage`. This ensures React Query cache is always seeded correctly on first render and after reload.
- **Consistency**: `useLogin` sets both `localStorage` and Query cache (`setQueryData`) with the same `{ token, role }` shape. `useLogout` clears both. The Axios 401 interceptor uses `queryClient.clear()` — aligned with `useLogout`.
- **No new Context**: React Query cache is sufficient. `AuthContext` is explicitly ruled out to avoid duplication of state management layers.
- **Route guards unchanged**: `ProtectedRoute` and `AdminRoute` continue to read directly from `localStorage` for routing decisions (synchronous, no flash). They do not need to use the new hook.

### Menubar Dropdown

- **Mechanism**: Replace CSS `group-hover` with `useState` boolean (`isManageOpen`). A `ref` and `useOutsideClick` (existing hook) control closing on outside click. The dropdown also closes on `NavLink` click by passing an `onClick` handler that sets state to false.
- **Mobile menu**: Add `useLocation` watch — when `pathname` changes, set `isMobileMenuOpen` to false.

### Styling System

- **Bootstrap removal**: Remove `bootstrap` and `bootstrap-icons` imports from `index.css` and `main.jsx`. Remove `bootstrap` from `package.json` dependencies (or leave as unused — prefer active removal).
- **Icon library**: The project already uses `lucide-react` (already in `package.json`). Continue using Lucide for all icons. No emoji as structural icons.
- **Design tokens**: CSS variables defined in `index.css` using the CRM palette. Tailwind utility classes applied directly in JSX — no new `tailwind.config` theme extension required for the base color set (blue-600, emerald-600, slate-* are all Tailwind defaults).
- **Spacing rhythm**: 8px base unit, using Tailwind's `p-2`/`p-4`/`p-6`/`p-8` scale.
- **Page layout shell**: `AppLayout` wraps content in `min-h-screen bg-slate-50`. Each page manages its own `max-w` container with `mx-auto px-4 py-6` pattern.
- **Two-column Manage pages**: `ManageItems`, `ManageCategory`, `ManageModifiers`, `ManageUsers` use `flex gap-6` with left panel `w-80 flex-shrink-0` and right panel `flex-1 overflow-auto`.
- **Tables**: Sticky `thead`, `overflow-x-auto` wrapper, alternating row background via `odd:bg-white even:bg-slate-50`.
- **Status badges**: Tailwind inline variant — `px-2 py-0.5 rounded-full text-xs font-medium`. Color map: COMPLETED → `bg-emerald-100 text-emerald-700`, PENDING → `bg-amber-100 text-amber-700`, CANCELLED/FAILED → `bg-red-100 text-red-700`.
- **Buttons**: Primary `bg-blue-600 hover:bg-blue-700 text-white`, Danger `bg-red-600 hover:bg-red-700 text-white`, Ghost `border border-slate-200 hover:bg-slate-50`.

### Security Fix

- `LoginForm` currently has hardcoded credential defaults (`hauthaut32@gmail.com` / `123456`). These are removed — form starts empty. Browser autofill handles credential recall.

### Explore / POS Screen

- Two-column layout structure is preserved exactly. Only Bootstrap utility classes are replaced with Tailwind equivalents. No business logic or component hierarchy changes.

---

## Testing Decisions

### What makes a good test here

Tests should verify **external observable behavior**, not implementation internals:
- Auth: does the component render the correct nav items for each role?
- Route guards: does the user get redirected when token is absent?
- Dropdown: does the dropdown open/close in response to click events?

Do NOT test: which CSS classes are applied, internal `useState` values, or `localStorage` key names.

### Modules to test

1. **`useCurrentUser` hook** — seam: hook output. Test that `isAdmin` is `true` when `localStorage.role === "ROLE_ADMIN"` and `false` otherwise. Mock `localStorage`.
2. **`ProtectedRoute`** — seam: rendered output. Test redirect to `/login` when no token; render `<Outlet>` when token present.
3. **`AdminRoute`** — seam: rendered output. Test redirect to `/dashboard` when role is not `ROLE_ADMIN`; render `<Outlet>` when role is `ROLE_ADMIN`.
4. **`Menubar`** — seam: DOM. Test that "Manage" items are present in DOM for Admin role, absent for Staff role.

### Prior art

No existing frontend tests found in this repo. These would be the first. Use React Testing Library + Vitest (consistent with Vite setup). Pattern: wrap with `MemoryRouter` + `QueryClientProvider`.

---

## Out of Scope

- Dark mode support — only Light mode is implemented in this phase.
- Backend changes — no API contract modifications.
- Adding new pages or features — this spec is strictly UI/UX migration and bug fixes.
- Flyway/Liquibase migration — mentioned in Known Technical Debt but not part of this phase.
- HttpOnly Cookie migration for JWT — security improvement noted in Technical Debt, deferred.
- Writing the test suite (noted above) — tests are defined as a decision but implementation is a separate ticket.
- Adding new user profile features (profile edit, password change).
- Explore/POS feature enhancements — layout preserved as-is.

---

## Further Notes

- The design system query returned a restaurant/café-appropriate color scheme (appetizing red + warm gold) for the `--design-system` run. However, after applying domain knowledge, the **CRM & Client Management palette** (blue-600 primary, emerald accent, slate-50 background) was chosen instead — it is more appropriate for a management/admin tool used internally by staff. The restaurant/café aesthetic is retained only through typography and subtle branding.
- The existing `Outfit` font (already loaded in `index.css`) is retained — it is modern, neutral, and suitable for an admin dashboard without requiring a font change.
- `ManagePromotions.jsx` (24KB) is the largest single file and may require the most effort due to its complex form state. Business logic must be preserved exactly.
- `useOutsideClick` hook already exists at `src/hooks/useOutsideClick.js` and should be used directly for dropdown behavior.
