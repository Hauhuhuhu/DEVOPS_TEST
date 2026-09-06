# Reviewer Round 2 Report: Adversarial Review & Defect Remediation

> [!WARNING] **Skepticism Disclaimer**
> Moderate-to-high confidence: all 5 core requirements verified across 13/13 passing automated tests (executable from both root and Front-end directories), production bundle builds cleanly in 613ms, and ESLint passes with 0 errors/0 warnings. Live external network connections (backend API, thermal USB printers, PayOS webhooks) remain unverified locally without active infrastructure.

## 1. What the prior attempt got wrong

1. **Receipt Popup Modifier Price Rendering NaN ₫ (Fatal Functional Bug)**:
   - **Input**: User views or prints a receipt for an item that has selected modifiers/add-ons (e.g., `+Trản châu`, `+Đường 50%`).
   - **Expected**: Receipt displays the modifier name and formatted price adjustment (e.g. `+Trân châu (5.000 ₭)` or `+Trân châu` if zero adjustment).
   - **Actual**: Receipt rendered `+Trân châu (NaN ₫)` because `m.price` was evaluated as `undefined`, causing `Intl.NumberFormat` to output `NaN ₮`.
   - **Root cause**: In `SelectedModifier` (Java backend DTO & entity), the pricing property is named `priceAdjustment` (not `price`), and `POSItemModal.jsx` generates modifier objects with `{ modifierId, name, priceAdjustment }`. `ReceiptPopup.jsx` line 111 previously read `m.price`, which is always `undefined`.
   - **Fix**: Updated `ReceiptPopup.jsx` to resolve `const priceAdj = m.priceAdjustment ?? m.price ?? 0;` and only append price adjustment parenthetical when `priceAdj > 0`.

2. **Test Runner CWD: Execution Brittleness (Test Sensitivity)**:
   - **Input**: Developer or CI executes `node --test test-verification.mjs` directly inside the `Front-end/` directory.
   - **Expected**: All test suites locate source files and pass.
   - **Actual**: 7 out of 9 tests crashed with `ENOENT: no such file or directory` looking for `Front-end/Front-end/src...`.
   - **Root cause**: `test-verification.mjs` had `const FRONTEND_DIR = path.resolve("Front-end");` hardcoded, which assumes the current working directory is the repository root.
   - **Fix**: Replaced with `const FRONTEND_DIR = path.dirname(fileURLToPath(import.meta.url));` ensuring paths resolve relative to the script location regardless of CWD.

3. **Untested Ledger Coverage (Open Ledger Deficit)**:
   - **Input**: Open issues ledger contained untested edge cases for POS multi-variant rapid cart isolation, promotion non-stacking calculation integrity, and F5 browser reload role retention.
   - **Expected**: Automated test suite covers all edge cases.
   - **Actual**: No automated tests existed for POS multi-variant cart collisions, ADR-0003 non-stacking promotions, or F5 role/navigation retention.
   - **Root cause**: Insufficient adversarial test scenarios in previous reviewer rounds.
   - **Fix**: Implemented 4 new automated tests (Tests 10-13) in `Front-end/test-verification.mjs` verifying modifier pricing, cart item state isolation between different variants of the same item, ADR-0003 single-best-discount logic with 10% VAT, and F5 reload Admin Manage menu persistence.

## 2. What I changed
- `Front-end/src/features/Explore/ReceiptPopup.jsx`: Fixed modifier price rendering to check `m.priceAdjustment ?? m.price ?? 0`, eliminating `NaN ⊺` on printed and displayed receipts.
- `Front-end/test-verification.mjs`:
  - Made path resolution portable using `fileURLToPath(import.meta.url)`.
  - Added Test 10: ReceiptPopup modifier price rendering verification.
  - Added Test 11: POS cart multi-variant and modifier state isolation simulation.
  - Added Test 12: Promotion non-stacking & 10% VAT calculation simulation.
  - Added Test 13: Browser reload F5 Admin state and Manage menu persistence simulation.

## 3. Verification Record
- **Deep Verification (ran actual tests):**
  1. `node --test Front-end/test-verification.mjs` (from repo root): 13/13 tests passed (0 failures) in 125ms.
  2. `node --test test-verification.mjs` (from Front-end/ dir): 13/13 tests passed (0 failures) in 120ms.
  3. `npm run lint` in Front-end/: 0 errors, 0 warnings across all files.
  4. `npm run build` in Front-end/: Production build completed cleanly in 613ms (dist/assets 539 kB JS, 37.4 kB CSS).localhost.
- **Shallow Verification (manual only):**
  - Inspected DOM structures, modals, cart summary, and admin forms across all migrated components.
- **Unverified aspects:**
  - Live Spring Boot backend network connection (http://localhost:8080/api/v1.0).
  - Real hardware thermal printer USB/ESC-POS Rendering.
  - Live PayOS gateway webhook polling and bank redirects.

## 4. Known Issues
- `Minor Robustness Risk` — PayOS checkout redirects depend on an active third-party PayOS API webhook and network connectivity.
- `Shallow Verification` — Thermal printer formatting verified via @media print CSS and DOM review;
  physical hardware paper roll cuts remain untested.

## 5. Remaining risk & next step
- Round 3 reviewer should perform final verification of end-to-end routing integrity, check stock check / inventory modal audit logging edge cases, and ensure victory auditor prerequisites are satisfied.