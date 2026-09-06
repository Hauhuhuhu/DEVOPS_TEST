# Reviewer Round 3 Report: Adversarial Review & Defect Remediation

> [!WARNING] **Skepticism Disclaimer**
> High confidence across frontend static analysis and automated simulations: 17/17 automated unit and simulation tests pass cleanly, production build succeeds in 560ms, and ESLint checks report 0 errors / 0 warnings. Live external connections (Spring Boot API, USB thermal receipt printers, and PayOS webhooks) remain unverified without local running infrastructure.

## 1. What the prior attempt got wrong

1. **Currency Formatter Vulnerability to NaN / Undefined / Null Inputs (Minor Robustness Risk)**:
   - **Input**: Any frontend component passing `undefined`, `null`, `NaN`, or non-numeric values to `formatCurrency(amount)` (e.g. uninitialized price during async query fetch or unpriced line items).
   - **Expected**: `formatCurrency` cleanly falls back to `0 ₫` rather than rendering `NaN ₫` or throwing an error.
   - **Actual**: `formatCurrency` blindly passed `amount` to `Intl.NumberFormat.format(amount)`, which outputs `"NaN ₫"` for `undefined`/`NaN`.
   - **Root cause**: Lack of finite numeric coercion in `src/utils/formatCurrency.js`.
   - **Fix**: Coerced `amount` via `Number(amount)` and guarded with `Number.isFinite(numeric) ? numeric : 0`.

2. **Render-Phase Side-Effect in AdminRoute (React 19 Warning Risk)**:
   - **Input**: Non-admin user navigates to an admin-guarded route (e.g., `/items`, `/categories`).
   - **Expected**: User is redirected to `/dashboard` while error toast is queued via React lifecycle effect.
   - **Actual**: `AdminRoute.jsx` called `toast.error("Bạn không có quyền truy cập trang này!")` directly inside the render body during evaluation of `if (role !== "ROLE_ADMIN")`.
   - **Root cause**: Invoking state-modifying side-effects (updating Toaster) during render breaks React component purity guidelines and triggers React 19 warnings.
   - **Fix**: Wrapped unauthorized notification in `useEffect(() => { if (token && role !== "ROLE_ADMIN") toast.error(...); }, [token, role])`.

3. **StockOperationModal State Contamination Across Variants**:
   - **Input**: User opens Inventory modal for Variant A, switches tabs to History or leaves form input dirty, closes modal, and opens Inventory modal for Variant B.
   - **Expected**: Modal mounts fresh with tab reset to `"quick"` and all inputs at initial default values for Variant B.
   - **Actual**: `<StockOperationModal>` in `Item.jsx` was persistently rendered in the tree, returning `null` when closed; state was not reset between different variant interactions.
   - **Root cause**: Lack of conditional mounting and key identification in `Item.jsx`.
   - **Fix**: In `Item.jsx`, conditionally rendered `{selectedVariantForStock && <StockOperationModal key={selectedVariantForStock.variantId} ... />}` to guarantee fresh mounting and tab re-initialization on every variant selection.

4. **Blind Substring Truncation Crashing on Missing IDs & Dates**:
   - **Input**: Order or Customer record with missing, null, or short (< 8 chars) ID, or Order with null `createdAt` or Happy Hour promo with null `endTime`.
   - **Expected**: UI gracefully displays fallback (`"—"`) or short string without crashing.
   - **Actual**: `Dashboard.jsx` called `order.orderId.substring(0, 8)...` and `new Date(order.createdAt).toLocaleTimeString(...)` without null checks; `ManageCustomers.jsx` called `customer.customerId.substring(0, 8)...`; `ManagePromotions.jsx` called `promo.endTime.substring(0, 5)`.
   - **Root cause**: Presumed presence of long UUID strings and valid timestamps on all items without null/length guards.
   - **Fix**: Added safe guards `{id ? (id.length > 8 ? `${id.substring(0, 8)}...` : id) : "—"}` and checked date/time fields before invoking `.substring` or `new Date()`.

5. **Receipt Multi-Variant Line Item Ambiguity**:
   - **Input**: Customer orders multiple variants of the same item (e.g. Size M and Size L).
   - **Expected**: Receipt displays variant label or SKU next to item name to differentiate items.
   - **Actual**: Receipt rendered only `item.name`, showing duplicate name lines with different prices without identifying which was Size M or Size L.
   - **Root cause**: `ReceiptPopup.jsx` did not inspect `item.variantLabel` or `item.variantSku`.
   - **Fix**: Added conditional rendering for `item.variantLabel` (or `item.variantSku`) next to item name in `ReceiptPopup.jsx`.

## 2. What I changed
- `Front-end/src/utils/formatCurrency.js`: Added finite numeric guard `Number.isFinite(numeric) ? numeric : 0` to prevent any `NaN ₫` output.
- `Front-end/src/features/Auth/AdminRoute.jsx`: Moved `toast.error` side-effect into `useEffect` to adhere to React 19 lifecycle rules.
- `Front-end/src/features/Items/Item.jsx`: Added conditional mounting and `key={selectedVariantForStock.variantId}` for `StockOperationModal`.
- `Front-end/src/features/Inventory/StockOperationModal.jsx`: Cleaned effect dependencies and synced form state with variant.
- `Front-end/src/pages/Dashboard.jsx`: Safe ID length truncation and null guard on `order.createdAt`.
- `Front-end/src/pages/ManageCustomers.jsx`: Safe ID length truncation for `customer.customerId`.
- `Front-end/src/pages/ManagePromotions.jsx`: Safe optional truncation for `promo.startTime` and `promo.endTime`.
- `Front-end/src/features/Explore/ReceiptPopup.jsx`: Display variant label/SKU on receipt line items.
- `Front-end/test-verification.mjs`: Added Tests 14, 15, 16, and 17 covering defensive currency formatting, safe truncation, inventory stock check discrepancy simulation, and modal key remount isolation.
- `.agents/teamwork_preview_swe_1/BRIEFING.md` & `progress.md`: Updated execution logs and open issues ledger.

## 3. Verification Record
- **Deep Verification (ran actual tests):**
  1. `node --test Front-end/test-verification.mjs` (from repo root): 17/17 tests passed (0 failures) in 158ms.
  2. `node --test test-verification.mjs` (from Front-end/ directory): 17/17 tests passed (0 failures) in 156ms.
  3. `npm run lint` in Front-end/: 0 errors, 0 warnings across all files.
  4. `npm run build` in Front-end/: Production bundle compiled cleanly in 560ms (dist/assets 540 kB JS, 37.5 kB CSS).
- **Shallow Verification (manual only):**
  - Inspected responsive styles, table layout wraps, modal overlays, button states, and form inputs across all screens.
- **Unverified aspects:**
  - Live Spring Boot backend network connection (http://localhost:8080/api/v1.0).
  - Real hardware thermal printer USB/ESC-POS rendering.
  - Live PayOS gateway webhook polling and bank redirects.

## 4. Known Issues
- `Minor Robustness Risk` — PayOS checkout redirects depend on an active third-party PayOS API webhook and network connectivity.
- `Shallow Verification` — Thermal printer formatting verified via @media print CSS and DOM review; physical hardware paper roll cuts remain untested without live device.

## 5. Remaining risk & next step
- Round 3 review is complete with 17/17 automated tests passing, 0 lint errors, and 0 build errors.
- Prerequisites for post-victory audit (`teamwork_preview_victory_auditor`) are fully met.