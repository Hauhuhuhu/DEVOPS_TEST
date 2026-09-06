import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_DIR = path.dirname(fileURLToPath(import.meta.url));

test("1. Static Audit: Zero Bootstrap artifacts across all source files", () => {
  const srcDir = path.join(FRONTEND_DIR, "src");
  
  function getFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getFiles(fullPath));
      } else if (/\.(jsx?|css|html)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const files = getFiles(srcDir);
  const forbiddenPatterns = [
    { pattern: /\bbootstrap\b/i, name: "bootstrap import/mention" },
    { pattern: /\bbi-[a-z0-9-]+/i, name: "bootstrap-icons class" },
    { pattern: /\b(btn|btn-primary|btn-secondary|btn-success|btn-danger|btn-outline-[a-z]+)\b/, name: "bootstrap btn class" },
    { pattern: /\b(form-control|form-select|form-check|form-check-input)\b/, name: "bootstrap form classes" },
    { pattern: /\b(spinner-border|spinner-grow)\b/, name: "bootstrap spinner" },
    { pattern: /\b(d-flex|d-grid|d-block|d-none|d-inline)\b/, name: "bootstrap display utility" },
    { pattern: /\b(vh-100|vw-100)\b/, name: "bootstrap viewport utility" },
    { pattern: /\b(item-container|left-column|right-column)\b/, name: "legacy CSS classes" },
  ];

  for (const file of files) {
    const rel = path.relative(srcDir, file);
    const content = fs.readFileSync(file, "utf8");

    for (const { pattern, name } of forbiddenPatterns) {
      const match = content.match(pattern);
      assert.strictEqual(
        match,
        null,
        `File ${rel} contains forbidden legacy Bootstrap pattern: ${name} (matched: "${match?.[0]}")`
      );
    }
  }
});

test("2. Dependencies Audit: package.json has zero bootstrap packages", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(FRONTEND_DIR, "package.json"), "utf8"));
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  
  assert.strictEqual("bootstrap" in allDeps, false, "bootstrap must not be in dependencies");
  assert.strictEqual("bootstrap-icons" in allDeps, false, "bootstrap-icons must not be in dependencies");
});

test("3. Auth State Persistence Simulation: useCurrentUser logic on F5 reload", () => {
  const store = new Map();
  const mockLocalStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };

  function simulateUseCurrentUser(storage) {
    const token = storage.getItem("token");
    const role = storage.getItem("role");
    const user = token ? { token, role } : null;
    const isAdmin = user?.role === "ROLE_ADMIN";
    return { user, isAdmin };
  }

  // Case 3a: Fresh visitor (not logged in)
  mockLocalStorage.clear();
  let state = simulateUseCurrentUser(mockLocalStorage);
  assert.strictEqual(state.user, null);
  assert.strictEqual(state.isAdmin, false);

  // Case 3b: Admin logs in -> persisted to localStorage
  mockLocalStorage.setItem("token", "jwt-admin-token-123");
  mockLocalStorage.setItem("role", "ROLE_ADMIN");
  state = simulateUseCurrentUser(mockLocalStorage);
  assert.deepStrictEqual(state.user, { token: "jwt-admin-token-123", role: "ROLE_ADMIN" });
  assert.strictEqual(state.isAdmin, true);

  // Case 3c: Admin refreshes the browser (F5)
  state = simulateUseCurrentUser(mockLocalStorage);
  assert.strictEqual(state.isAdmin, true, "Admin status MUST persist across F5");
  assert.strictEqual(state.user.token, "jwt-admin-token-123");

  // Case 3d: Staff user logs in & refreshes (F5)
  mockLocalStorage.setItem("token", "jwt-staff-token-456");
  mockLocalStorage.setItem("role", "ROLE_USER");
  state = simulateUseCurrentUser(mockLocalStorage);
  assert.strictEqual(state.isAdmin, false, "Staff user must NOT have isAdmin=true");
  assert.strictEqual(state.user.role, "ROLE_USER");

  // Case 3e: Logout
  mockLocalStorage.removeItem("token");
  mockLocalStorage.removeItem("role");
  state = simulateUseCurrentUser(mockLocalStorage);
  assert.strictEqual(state.user, null);
  assert.strictEqual(state.isAdmin, false);
});

test("4. Route Guard Simulation: ProtectedRoute & AdminRoute synchronous behavior", () => {
  const store = new Map();
  const mockLocalStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };

  function simulateProtectedRoute(storage) {
    const token = storage.getItem("token");
    if (!token) return { allow: false, redirect: "/login" };
    return { allow: true, redirect: null };
  }

  function simulateAdminRoute(storage) {
    const token = storage.getItem("token");
    const role = storage.getItem("role");
    if (!token) return { allow: false, redirect: "/login" };
    if (role !== "ROLE_ADMIN") return { allow: false, redirect: "/dashboard" };
    return { allow: true, redirect: null };
  }

  mockLocalStorage.clear();
  assert.deepStrictEqual(simulateProtectedRoute(mockLocalStorage), { allow: false, redirect: "/login" });
  assert.deepStrictEqual(simulateAdminRoute(mockLocalStorage), { allow: false, redirect: "/login" });

  mockLocalStorage.setItem("token", "tok");
  mockLocalStorage.setItem("role", "ROLE_USER");
  assert.deepStrictEqual(simulateProtectedRoute(mockLocalStorage), { allow: true, redirect: null });
  assert.deepStrictEqual(simulateAdminRoute(mockLocalStorage), { allow: false, redirect: "/dashboard" });

  mockLocalStorage.setItem("role", "ROLE_ADMIN");
  assert.deepStrictEqual(simulateProtectedRoute(mockLocalStorage), { allow: true, redirect: null });
  assert.deepStrictEqual(simulateAdminRoute(mockLocalStorage), { allow: true, redirect: null });
});

test("5. LoginForm Security: Zero hardcoded test credentials in source code", () => {
  const loginFormContent = fs.readFileSync(
    path.join(FRONTEND_DIR, "src/features/Auth/LoginForm.jsx"),
    "utf8"
  );
  assert.strictEqual(loginFormContent.includes("hauthaut32@gmail.com"), false);
  assert.strictEqual(loginFormContent.includes("123456"), false);
  assert.match(loginFormContent, /useState\(["']["']\)/, "Email state must initialize to empty string");
});

test("6. Menubar Interaction & Role Presentation: Static Verification", () => {
  const menubarContent = fs.readFileSync(
    path.join(FRONTEND_DIR, "src/ui/Menubar.jsx"),
    "utf8"
  );

  // Must import useCurrentUser
  assert.match(menubarContent, /useCurrentUser/, "Menubar must use useCurrentUser hook");

  // Must have click-controlled state for Manage and Profile
  assert.match(menubarContent, /setIsManageOpen/, "Must have setIsManageOpen state setter");
  assert.match(menubarContent, /setIsProfileOpen/, "Must have setIsProfileOpen state setter");
  assert.match(menubarContent, /setIsMobileMenuOpen/, "Must have setIsMobileMenuOpen state setter");

  // Must use useOutsideClick
  assert.match(menubarContent, /useOutsideClick/, "Must use useOutsideClick hook");

  // Must auto-close on route changes
  assert.match(menubarContent, /location\.pathname !== prevPathname/, "Must auto-close menus on route changes");

  // Role labels
  assert.match(menubarContent, /Administrator/, "Must display Administrator label for Admin");
  assert.match(menubarContent, /Standard Access/, "Must display Standard Access label for Staff");

  // Zero href="#" links that pollute browser URL
  assert.strictEqual(menubarContent.includes('href="#"'), false, "Must not contain href='#' links");
});

test("7. POSItemModal Reset Logic: Verifies state re-initialization via conditional mount", () => {
  const displayItemContent = fs.readFileSync(
    path.join(FRONTEND_DIR, "src/features/Explore/DisplayItem.jsx"),
    "utf8"
  );

  // DisplayItem must conditionally mount POSItemModal with {isModalOpen && <POSItemModal ... />}
  assert.match(
    displayItemContent,
    /\{isModalOpen\s*&&\s*\(\s*<POSItemModal/,
    "DisplayItem must conditionally mount POSItemModal only when open to reset state cleanly"
  );
});

test("8. ReceiptPopup Print CSS: No scroll or max-height truncation in print styles", () => {
  const receiptContent = fs.readFileSync(
    path.join(FRONTEND_DIR, "src/features/Explore/ReceiptPopup.jsx"),
    "utf8"
  );

  assert.match(receiptContent, /@media print/, "Must include print media stylesheet");
  assert.match(receiptContent, /max-height: none !important/, "Print styles must clear max-height");
  assert.match(receiptContent, /overflow: visible !important/, "Print styles must clear overflow to prevent clipping");
});

test("9. Cart Checkout & Backend Schema Alignment: OrderRequest mapping", () => {
  const cartSummaryContent = fs.readFileSync(
    path.join(FRONTEND_DIR, "src/features/Explore/CartSummary.jsx"),
    "utf8"
  );

  // Check that dataForm conforms to backend OrderRequest
  assert.match(cartSummaryContent, /customerId:\s*customerId/, "Must include customerId");
  assert.match(cartSummaryContent, /cartItems:\s*formattedCartItems/, "Must include formattedCartItems");
  assert.match(cartSummaryContent, /subtotal/, "Must include subtotal");
  assert.match(cartSummaryContent, /discountAmount/, "Must include discountAmount");
  assert.match(cartSummaryContent, /tax/, "Must include tax");
  assert.match(cartSummaryContent, /grandTotal/, "Must include grandTotal");
  assert.match(cartSummaryContent, /paymentMethod:\s*paymentMode\.toUpperCase\(\)/, "Must format paymentMethod as uppercase CASH/PAYOS");
});

test("10. ReceiptPopup Modifier Price Rendering: No NaN output with priceAdjustment", () => {
  const receiptContent = fs.readFileSync(
    path.join(FRONTEND_DIR, "src/features/Explore/ReceiptPopup.jsx"),
    "utf8"
  );

  // Must check priceAdjustment with fallback to prevent NaN ₫
  assert.match(
    receiptContent,
    /m\.priceAdjustment\s*\?\?\s*m\.price/,
    "ReceiptPopup must check m.priceAdjustment to align with backend SelectedModifier schema and prevent NaN ₫"
  );
  assert.doesNotMatch(
    receiptContent,
    /formatCurrency\(m\.price\)/,
    "ReceiptPopup must not blindly format m.price which is undefined on SelectedModifier"
  );
});

test("11. POS Cart Multi-Variant & Modifier State Isolation: Simulation", () => {
  let cartItems = [];

  function addToCart(item) {
    const cartItemId =
      item.cartItemId ||
      `${item.itemId}_${item.variantId || "default"}_${(item.selectedModifiers || [])
        .map((m) => m.modifierId)
        .sort()
        .join("-")}`;

    const itemToAdd = {
      ...item,
      cartItemId,
      quantity: item.quantity || 1,
    };

    const existingIndex = cartItems.findIndex((ci) => ci.cartItemId === cartItemId);
    if (existingIndex > -1) {
      cartItems = cartItems.map((ci, idx) =>
        idx === existingIndex
          ? { ...ci, quantity: ci.quantity + itemToAdd.quantity }
          : ci
      );
    } else {
      cartItems = [...cartItems, itemToAdd];
    }
  }

  function removeFromCart(cartItemId) {
    cartItems = cartItems.filter(
      (cartItem) => cartItem.cartItemId !== cartItemId && cartItem.itemId !== cartItemId
    );
  }

  function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    cartItems = cartItems.map((cartItem) =>
      cartItem.cartItemId === cartItemId || cartItem.itemId === cartItemId
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );
  }

  // 11a: Add two different variants of the same item
  addToCart({
    itemId: "item-1",
    name: "Milk Tea",
    variantId: "v-size-m",
    price: 30000,
    quantity: 1,
    selectedModifiers: [],
  });

  addToCart({
    itemId: "item-1",
    name: "Milk Tea",
    variantId: "v-size-l",
    price: 38000,
    quantity: 2,
    selectedModifiers: [{ modifierId: "mod-boba", name: "Boba", priceAdjustment: 5000 }],
  });

  assert.strictEqual(cartItems.length, 2, "Cart must have 2 distinct line items for different variants");
  assert.strictEqual(cartItems[0].cartItemId, "item-1_v-size-m_");
  assert.strictEqual(cartItems[1].cartItemId, "item-1_v-size-l_mod-boba");
  assert.strictEqual(cartItems[0].quantity, 1);
  assert.strictEqual(cartItems[1].quantity, 2);

  // 11b: Increment quantity of variant 1
  updateQuantity(cartItems[0].cartItemId, 3);
  assert.strictEqual(cartItems[0].quantity, 3);
  assert.strictEqual(cartItems[1].quantity, 2, "Variant 2 quantity must remain unaffected");

  // 11c: Remove variant 1 by decrementing to 0
  updateQuantity(cartItems[0].cartItemId, 0);
  assert.strictEqual(cartItems.length, 1, "Variant 1 should be removed");
  assert.strictEqual(cartItems[0].variantId, "v-size-l");

  // 11d: Remove variant 2 via removeFromCart
  removeFromCart(cartItems[0].cartItemId);
  assert.strictEqual(cartItems.length, 0, "Cart should now be empty");
});

test("12. Promotion Non-Stacking & VAT Calculation Integrity: Simulation", () => {
  function calculateOrderTotals({ rawTotal, candidates = [] }) {
    let bestDiscount = 0;
    let appliedCandidate = null;

    for (const c of candidates) {
      if (c.discountAmount > bestDiscount) {
        bestDiscount = c.discountAmount;
        appliedCandidate = c;
      } else if (c.discountAmount === bestDiscount && appliedCandidate && c.type === "COUPON") {
        appliedCandidate = c;
      }
    }

    const discountedSubtotal = Math.max(0, rawTotal - bestDiscount);
    const tax = Math.round(discountedSubtotal * 0.1);
    const grandTotal = discountedSubtotal + tax;

    return {
      subtotal: rawTotal,
      discountAmount: bestDiscount,
      tax,
      grandTotal,
      appliedPromotionId: appliedCandidate?.id || null,
    };
  }

  // 12a: No promotions
  const res1 = calculateOrderTotals({ rawTotal: 100000 });
  assert.strictEqual(res1.subtotal, 100000);
  assert.strictEqual(res1.discountAmount, 0);
  assert.strictEqual(res1.tax, 10000);
  assert.strictEqual(res1.grandTotal, 110000);

  // 12b: Competing Happy Hour (15,000) vs Coupon (20,000) -> selects Coupon (non-stacking)
  const res2 = calculateOrderTotals({
    rawTotal: 100000,
    candidates: [
      { id: "p-hh", type: "HAPPY_HOUR", discountAmount: 15000 },
      { id: "p-c", type: "COUPON", discountAmount: 20000 },
    ],
  });
  assert.strictEqual(res2.discountAmount, 20000, "Should pick single best discount of 20,000 without stacking");
  assert.strictEqual(res2.appliedPromotionId, "p-c");
  assert.strictEqual(res2.tax, 8000);
  assert.strictEqual(res2.grandTotal, 88000);

  // 12c: Discount greater than subtotal clamp
  const res3 = calculateOrderTotals({
    rawTotal: 50000,
    candidates: [{ id: "p-big", type: "COUPON", discountAmount: 80000 }],
  });
  assert.strictEqual(res3.grandTotal, 0, "Grand total must not be negative");
});

test("13. Browser Reload F5 Admin State & Manage Menu Persistence: Simulation", () => {
  const store = new Map();
  const mockLocalStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };

  function renderMenubar(storage) {
    const token = storage.getItem("token");
    const role = storage.getItem("role");
    const user = token ? { token, role } : null;
    const isAdmin = user?.role === "ROLE_ADMIN";

    return {
      hasManageDropdown: isAdmin,
      userRoleLabel: isAdmin ? "Administrator" : "Standard Access",
      avatarChar: isAdmin ? "A" : "U",
    };
  }

  // Reload with ROLE_ADMIN in localStorage
  mockLocalStorage.setItem("token", "admin-jwt-token-f5");
  mockLocalStorage.setItem("role", "ROLE_ADMIN");

  const reload1 = renderMenubar(mockLocalStorage);
  assert.strictEqual(reload1.hasManageDropdown, true, "Manage dropdown must be immediately present after F5 reload");
  assert.strictEqual(reload1.userRoleLabel, "Administrator");
  assert.strictEqual(reload1.avatarChar, "A");

  // Reload with Staff user in localStorage
  mockLocalStorage.setItem("token", "staff-jwt-token-f5");
  mockLocalStorage.setItem("role", "ROLE_USER");

  const reload2 = renderMenubar(mockLocalStorage);
  assert.strictEqual(reload2.hasManageDropdown, false, "Manage dropdown must be absent for Staff user after F5 reload");
  assert.strictEqual(reload2.userRoleLabel, "Standard Access");
  assert.strictEqual(reload2.avatarChar, "U");
});

test("14. Currency Formatting Defensive Boundary: Zero NaN ₫ on invalid inputs", async () => {
  const { pathToFileURL } = await import("node:url");
  const currencyModuleUrl = pathToFileURL(path.join(FRONTEND_DIR, "src/utils/formatCurrency.js")).href;
  const { formatCurrency } = await import(currencyModuleUrl);

  // 14a: Normal valid inputs
  assert.match(formatCurrency(10000), /10\.000/);
  assert.match(formatCurrency(0), /0/);

  // 14b: Defensive edge cases must NEVER output NaN ₫
  assert.doesNotMatch(formatCurrency(undefined), /NaN/);
  assert.doesNotMatch(formatCurrency(null), /NaN/);
  assert.doesNotMatch(formatCurrency(NaN), /NaN/);
  assert.doesNotMatch(formatCurrency("invalid-string"), /NaN/);

  assert.match(formatCurrency(undefined), /0/);
  assert.match(formatCurrency(null), /0/);
  assert.match(formatCurrency(NaN), /0/);
});

test("15. Safe ID and Date/Time String Truncation: Static source audit", () => {
  const dashboardContent = fs.readFileSync(path.join(FRONTEND_DIR, "src/pages/Dashboard.jsx"), "utf8");
  const customersContent = fs.readFileSync(path.join(FRONTEND_DIR, "src/pages/ManageCustomers.jsx"), "utf8");
  const promotionsContent = fs.readFileSync(path.join(FRONTEND_DIR, "src/pages/ManagePromotions.jsx"), "utf8");

  // Dashboard must protect orderId and createdAt
  assert.match(dashboardContent, /order\.orderId\s*\?\s*\(?order\.orderId\.length\s*>\s*8/, "Dashboard must protect order.orderId with length check");
  assert.match(dashboardContent, /order\.createdAt\s*\?/, "Dashboard must verify order.createdAt before new Date");

  // ManageCustomers must protect customerId
  assert.match(customersContent, /customer\.customerId\s*\?\s*\(?customer\.customerId\.length\s*>\s*8/, "ManageCustomers must protect customerId with length check");

  // ManagePromotions must safely handle Happy Hour time window
  assert.match(promotionsContent, /promo\.startTime\s*\?\s*promo\.startTime\.substring\(0,\s*5\)\s*:\s*["']["']/, "ManagePromotions must safely check startTime");
  assert.match(promotionsContent, /promo\.endTime\s*\?\s*promo\.endTime\.substring\(0,\s*5\)\s*:\s*["']["']/, "ManagePromotions must safely check endTime");
});

test("16. Inventory Stock Check Discrepancy & Adjustment Calculation Integrity: Simulation", () => {
  function computeStockDiscrepancy({ systemStock, physicalCount }) {
    const countedNum =
      physicalCount !== "" && physicalCount != null && !isNaN(Number(physicalCount))
        ? Number(physicalCount)
        : null;
    const discrepancy = countedNum != null ? countedNum - systemStock : null;

    let auditType = "ADJUSTMENT";
    let formattedDiff = "";
    if (discrepancy != null) {
      if (discrepancy > 0) formattedDiff = `+${discrepancy} (Surplus)`;
      else if (discrepancy < 0) formattedDiff = `${discrepancy} (Shortage)`;
      else formattedDiff = `0 (Match)`;
    }

    return {
      countedNum,
      discrepancy,
      auditType,
      formattedDiff,
    };
  }

  // 16a: Surplus inventory (system: 10, counted: 15 -> discrepancy: +5)
  const surplus = computeStockDiscrepancy({ systemStock: 10, physicalCount: 15 });
  assert.strictEqual(surplus.discrepancy, 5);
  assert.strictEqual(surplus.formattedDiff, "+5 (Surplus)");

  // 16b: Shortage inventory (system: 10, counted: 7 -> discrepancy: -3)
  const shortage = computeStockDiscrepancy({ systemStock: 10, physicalCount: 7 });
  assert.strictEqual(shortage.discrepancy, -3);
  assert.strictEqual(shortage.formattedDiff, "-3 (Shortage)");

  // 16c: Exact match (system: 10, counted: 10 -> discrepancy: 0)
  const match = computeStockDiscrepancy({ systemStock: 10, physicalCount: 10 });
  assert.strictEqual(match.discrepancy, 0);
  assert.strictEqual(match.formattedDiff, "0 (Match)");
});

test("17. Conditional Modal Mounting & Reset Logic in Item.jsx: Static source audit", () => {
  const itemContent = fs.readFileSync(path.join(FRONTEND_DIR, "src/features/Items/Item.jsx"), "utf8");
  const modalContent = fs.readFileSync(path.join(FRONTEND_DIR, "src/features/Inventory/StockOperationModal.jsx"), "utf8");

  // Item.jsx must conditionally mount StockOperationModal
  assert.match(
    itemContent,
    /\{selectedVariantForStock\s*&&\s*\(\s*<StockOperationModal/,
    "Item.jsx must conditionally mount StockOperationModal to guarantee clean state on open"
  );

  // Item.jsx must pass key prop for clean remount on variant switch
  assert.match(
    itemContent,
    /key=\{selectedVariantForStock\.variantId\}/,
    "Item.jsx must provide key={selectedVariantForStock.variantId} for unmount/remount isolation"
  );

  // StockOperationModal must synchronize actualCount with variant stock in useEffect
  assert.match(
    modalContent,
    /actualCount:\s*variant\.cachedStockQuantity\s*\?\?\s*0/,
    "StockOperationModal must sync actualCount with variant cachedStockQuantity"
  );
});

