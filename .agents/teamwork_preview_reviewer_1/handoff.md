# Reviewer Round 1 Report: Adversarial Review & Defect Remediation

> [!WARNING] **Skepticism Disclaimer**
> Moderate-to-high confidence: all 5 core requirements verified, 9/9 automated tests pass, bundle build completes in 584ms, and ESLint passes with 0 errors/0 warnings; physical hardware printing and live PayOS webhooks remain untestable without live external third-party infrastructure.

## 1. What the prior attempt got wrong
1. **POS Item Customization State Retention Across Modal Reopens**:
   - **Input**: User clicks an item requiring customization (e.g. variants/modifiers), selects a non-default variant/modifier, changes quantity to 3, and cancels or adds to cart. User subsequently reopens the modal for the same item.
   - **Expected**: Modal opens fresh with pristine initial state (quantity = 1, default first variant, zero modifiers selected).
   - **Actual**: Modal retained the dirty state from the previous interaction (dirty variant, previous modifier selections, previous quantity).
   - **Root cause**: `DisplayItem.jsx` permanently rendered `<POSItemModal>` without unmounting it (`POSItemModal` returned `null` when closed), and `useState` initializers inside `POSItemModal` only evaluate on mount.
   - **Fix**: Wrapped `<POSItemModal>` inside `{isModalOpen && <POSItemModal ... />}` in `DisplayItem.jsx` so that each modal open is a fresh mount with natural default state.

2. **Long Multi-Item Receipt Print Layout Truncation**:
   - **Input**: User clicks "In hóa đơn" on an order containing many items (or prints via browser print dialogue `window.print()`).
   - **Expected**: Receipt renders without scroll clipping across the printed page or physical roll.
   - **Actual**: `@media print` styles in `ReceiptPopup.jsx` only made `.receipt-modal-overlay` visible, but left `max-height: 90vh` and `overflow-y: auto` intact on the inner container, causing printer engines to clip long receipts at the 90vh boundary without scrolling.
   - **Root cause**: Missing print media overrides for `max-height: none !important` and `overflow: visible !important` on `.receipt-modal-overlay > div` and `.receipt-printable-area`.
   - **Fix**: Added comprehensive `@media print` rules in `ReceiptPopup.jsx` removing borders, shadows, scroll limits, and max-height constraints.

3. **Menubar Profile Menu Hash Pollution & URL Mutation**:
   - **Input**: User opens user profile menu and clicks "Activity Log" or "Settings".
   - **Expected**: Profile menu closes cleanly without mutating browser URL or jumping the viewport.
   - **Actual**: Elements were `<a href="#">` without `onClick` handlers or `preventDefault`, causing `#` to be appended to the browser URL and leaving the dropdown menu open.
   - **Root cause**: Unbound placeholder anchors inside `profileRef`.
   - **Fix**: Converted to semantic `<button type="button">` with `onClick={() => setIsProfileOpen(false)}`.

4. **Mobile Navigation Outside-Click Dismissal**:
   - **Input**: Mobile user opens hamburger menu and taps anywhere on the page content to dismiss it.
   - **Expected**: Mobile menu auto-collapses.
   - **Actual**: Mobile menu stayed open because `useOutsideClick` was only attached to Manage and Profile menus.
   - **Root cause**: Missing outside click ref on `<nav>` container.
   - **Fix**: Attached `navRef` with `useOutsideClick(() => setIsMobileMenuOpen(false))` to `<nav>`.

5. **Auth State Observer Synchronization on Logout**:
   - **Input**: User clicks logout in `Menubar.jsx`.
   - **Expected**: `["user"]` cache key immediately reports `null` to all active observers before cache wipe.
   - **Actual**: `useLogout` called `queryClient.clear()` directly without setting `queryClient.setQueryData(["user"], null)`.
   - **Root cause**: Subtle observer notification gap during navigation redirect.
   - **Fix**: Added `queryClient.setQueryData(["user"], null)` prior to `queryClient.clear()`.

## 2. What I changed
- `Front-end/src/features/Explore/DisplayItem.jsx`: Conditionally mounted `POSItemModal` with `{isModalOpen && ...}` to ensure clean state reset on open.
- `Front-end/src/features/Explore/ReceiptPopup.jsx`: Added `@media print` overrides (`max-height: none !important; overflow: visible !important; border: none; box-shadow: none;`) to prevent receipt clipping on physical/PDF print.
- `Front-end/src/ui/Menubar.jsx`: Replaced hash anchor placeholders with `<button type="button">`, attached `navRef` to dismiss mobile drawer on outside tap.
- `Front-end/src/features/Auth/useLogout.js`: Set `queryClient.setQueryData(["user"], null)` prior to `queryClient.clear()`.
- `Front-end/test-verification.mjs`: Added 9 automated node test scenarios covering static bootstrap audits, auth persistence simulations, route guards, security credential checks, Menubar role rendering, POS modal lifecycle, print CSS, and backend `OrderRequest` schema alignment.

## 3. Verification Record
- **Deep Verification (ran actual tests & scripts):**
  1. `node --test Front-end/test-verification.mjs`: 9/9 automated tests passed (zero failures).
  2. `npm run lint` in `Front-end`: Completed with 0 errors and 0 warnings across all source files.
  3. `npm run build` in `Front-end`: Completed in 584ms with 0 errors (dist bundle 539 kB JS, 37 kB CSS).
  4. Static Audit: Zero occurrences of Bootstrap classes (`btn`, `form-control`, `spinner-border`, `d-flex`, `vh-100`, etc.) or `bi-*` icons in any source file.
  5. Dependency Audit: `bootstrap` and `bootstrap-icons` completely absent from `package.json`.
- **Shallow Verification (manual only):**
  - Inspected DOM structures of all converted Manage pages (Items, Categories, Modifiers, Users, Customers, Promotions) and POS screens.
- **Unverified aspects:**
  - Live Spring Boot backend network connection (`http://localhost:8080/api/v1.0`).
  - Real hardware thermal printer USB/ESC-POS rendering.
  - Live PayOS gateway webhook polling.

## 4. Known Issues
- `Minor Robustness Risk` — PayOS checkout redirects depend on an active third-party PayOS API webhook and network connectivity.

## 5. Remaining risk & next step
- Round 2 reviewer should perform end-to-end user journey verification, stress test POS rapid cart operations (rapid add/delete/update), and check promotion evaluation edge cases (e.g. invalid coupon codes or conflicting discounts).
