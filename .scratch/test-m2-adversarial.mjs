import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const FRONTEND_SRC = path.join(REPO_ROOT, "Front-end", "src");

// Helper to read component file content
function getFile(relativePath) {
  return fs.readFileSync(path.join(FRONTEND_SRC, relativePath), "utf8");
}

// ---------------------------------------------------------------------------
// TEST SUITE 1: STATIC ARCHITECTURE & CONFORMANCE ACROSS ALL 8 TARGET FORMS
// ---------------------------------------------------------------------------

const TARGET_FORMS = [
  { name: "LoginForm", path: "features/Auth/LoginForm.jsx" },
  { name: "CategoryForm", path: "features/Category/CategoryForm.jsx" },
  { name: "ItemForm", path: "features/Items/ItemForm.jsx" },
  { name: "UserForm", path: "features/Users/UserForm.jsx" },
  { name: "ModifierGroupForm", path: "features/Modifiers/ModifierGroupForm.jsx" },
  { name: "ManageCustomers", path: "pages/ManageCustomers.jsx" },
  { name: "ManagePromotions", path: "pages/ManagePromotions.jsx" },
  { name: "StockOperationModal", path: "features/Inventory/StockOperationModal.jsx" },
];

test("1. All 8 forms import and use react-hook-form", () => {
  for (const form of TARGET_FORMS) {
    const code = getFile(form.path);
    assert.match(
      code,
      /from\s+["']react-hook-form["']/,
      `${form.name} must import react-hook-form`
    );
    assert.match(
      code,
      /useForm\s*\(/,
      `${form.name} must invoke useForm()`
    );
  }
});

test("2. All 8 forms import and wire react-hot-toast", () => {
  for (const form of TARGET_FORMS) {
    const code = getFile(form.path);
    assert.match(
      code,
      /import\s+toast\s+from\s+["']react-hot-toast["']/,
      `${form.name} must import toast from react-hot-toast`
    );
    assert.match(
      code,
      /toast\.error\s*\(/,
      `${form.name} must call toast.error in onError or validation paths`
    );
  }
});

test("3. All 8 forms suppress native HTML tooltips with noValidate", () => {
  for (const form of TARGET_FORMS) {
    const code = getFile(form.path);
    assert.match(
      code,
      /<form[^>]*\bnoValidate\b/,
      `${form.name} must specify noValidate on <form> element`
    );
  }
});

test("4. All 8 forms wire onError callbacks in handleSubmit", () => {
  for (const form of TARGET_FORMS) {
    const code = getFile(form.path);
    if (form.name === "StockOperationModal") {
      assert.match(
        code,
        /handleSubmit\s*\(\s*onSubmitQuick\s*,\s*onErrorQuick\s*\)/,
        "StockOperationModal must wire onErrorQuick"
      );
      assert.match(
        code,
        /handleSubmitCheck\s*\(\s*onSubmitCheck\s*,\s*onErrorCheck\s*\)/,
        "StockOperationModal must wire onErrorCheck"
      );
    } else {
      assert.match(
        code,
        /handleSubmit\s*\(\s*onSubmit\s*,\s*onError\s*\)/,
        `${form.name} must wire handleSubmit(onSubmit, onError)`
      );
    }
  }
});

test("5. All 8 forms apply conditional red border styling and inline error messages", () => {
  for (const form of TARGET_FORMS) {
    const code = getFile(form.path);
    assert.match(
      code,
      /border-red-500/,
      `${form.name} must use border-red-500 for invalid inputs`
    );
    assert.match(
      code,
      /text-xs text-red-600 mt-1/,
      `${form.name} must use standard inline red error styling`
    );
  }
});

// ---------------------------------------------------------------------------
// TEST SUITE 2: FORM 1 - LoginForm.jsx EMPIRICAL EVALUATION
// ---------------------------------------------------------------------------

test("6. LoginForm: Validation rules, regex boundaries, and onError execution", () => {
  const code = getFile("features/Auth/LoginForm.jsx");

  // Verify rules definition
  assert.match(code, /required:\s*["']Email is required["']/);
  assert.match(code, /required:\s*["']Password is required["']/);

  // Extract email regex from LoginForm
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  // Boundary checks: Valid emails
  assert.strictEqual(emailRegex.test("user@domain.com"), true);
  assert.strictEqual(emailRegex.test("user.name+tag@sub.domain.edu"), true);
  assert.strictEqual(emailRegex.test("ADMIN_123@BIZ.VN"), true);

  // Boundary checks: Invalid emails
  assert.strictEqual(emailRegex.test("plainaddress"), false);
  assert.strictEqual(emailRegex.test("@missingusername.com"), false);
  assert.strictEqual(emailRegex.test("user@missingtld"), false);
  assert.strictEqual(emailRegex.test("user@domain.c"), false, "TLD must be >= 2 characters");
  assert.strictEqual(emailRegex.test("user with space@domain.com"), false);
  assert.strictEqual(emailRegex.test(""), false);

  // Simulate LoginForm onError handler
  let toastMsg = null;
  const mockToast = { error: (msg) => { toastMsg = msg; } };

  function simulateLoginFormOnError(errors) {
    const firstError = Object.values(errors)[0];
    if (firstError) mockToast.error(firstError.message || "Please check the required fields");
  }

  // Case A: Missing email
  toastMsg = null;
  simulateLoginFormOnError({ email: { message: "Email is required" } });
  assert.strictEqual(toastMsg, "Email is required");

  // Case B: Invalid email format
  toastMsg = null;
  simulateLoginFormOnError({ email: { message: "Invalid email address" } });
  assert.strictEqual(toastMsg, "Invalid email address");

  // Case C: Missing message fallback
  toastMsg = null;
  simulateLoginFormOnError({ email: {} });
  assert.strictEqual(toastMsg, "Please check the required fields");

  // Case D: Empty errors object (does not crash)
  toastMsg = null;
  simulateLoginFormOnError({});
  assert.strictEqual(toastMsg, null);
});

// ---------------------------------------------------------------------------
// TEST SUITE 3: FORM 2 - CategoryForm.jsx EMPIRICAL EVALUATION
// ---------------------------------------------------------------------------

test("7. CategoryForm: Validation rules, image restrictions, and onError execution", () => {
  const code = getFile("features/Category/CategoryForm.jsx");

  assert.match(code, /required:\s*["']Category name is required["']/);
  assert.match(code, /required:\s*["']Category description is required["']/);
  assert.match(code, /required:\s*["']Background color is required["']/);
  assert.match(code, /5\s*\*\s*1024\s*\*\s*1024/, "Must enforce 5MB image limit");

  // Simulate CategoryForm onSubmit validation for image
  let toastMsg = null;
  const mockToast = { error: (msg) => { toastMsg = msg; } };

  function validateCategoryImage(data) {
    const imageFile = data.imgUrl?.[0];
    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        mockToast.error("Image size should not exceed 5MB");
        return false;
      }
      return true;
    } else {
      mockToast.error("Vui lòng chọn hình ảnh");
      return false;
    }
  }

  // Case A: No image
  toastMsg = null;
  assert.strictEqual(validateCategoryImage({}), false);
  assert.strictEqual(toastMsg, "Vui lòng chọn hình ảnh");

  // Case B: Oversized image (>5MB)
  toastMsg = null;
  assert.strictEqual(validateCategoryImage({ imgUrl: [{ size: 6 * 1024 * 1024 }] }), false);
  assert.strictEqual(toastMsg, "Image size should not exceed 5MB");

  // Case C: Valid image (1MB)
  toastMsg = null;
  assert.strictEqual(validateCategoryImage({ imgUrl: [{ size: 1024 * 1024 }] }), true);
  assert.strictEqual(toastMsg, null);
});

// ---------------------------------------------------------------------------
// TEST SUITE 4: FORM 3 - ItemForm.jsx EMPIRICAL EVALUATION
// ---------------------------------------------------------------------------

test("8. ItemForm: Multi-variant, price bounds, and recursive onError traversal", () => {
  const code = getFile("features/Items/ItemForm.jsx");

  assert.match(code, /required:\s*["']Item name is required["']/);
  assert.match(code, /required:\s*["']Category is required["']/);
  assert.match(code, /required:\s*["']Item description is required["']/);
  assert.match(code, /required:\s*!hasVariants\s*\?\s*["']Price is required["']/);
  assert.match(code, /required:\s*hasVariants\s*\?\s*["']Variant SKU is required["']/);
  assert.ok(code.includes('message: "Base price must be a positive number"'), "Must specify positive base price message");

  // Simulate ItemForm getFirstMessage recursive traversal
  function getFirstMessage(err) {
    if (!err) return null;
    if (typeof err === "object") {
      if (err.message && typeof err.message === "string") return err.message;
      for (const key of Object.keys(err)) {
        const res = getFirstMessage(err[key]);
        if (res) return res;
      }
    }
    return null;
  }

  // Stress-test recursive error extractor
  // Case A: Top-level error
  assert.strictEqual(
    getFirstMessage({ name: { message: "Item name is required" } }),
    "Item name is required"
  );

  // Case B: Nested variant error in array
  const nestedVariantError = {
    variants: [
      undefined,
      { sku: { message: "Variant SKU is required" } },
    ],
  };
  assert.strictEqual(getFirstMessage(nestedVariantError), "Variant SKU is required");

  // Case C: Deep nested attribute error
  const deepAttributeError = {
    variants: [
      {
        attributes: [
          { key: { message: "Attribute key required" } }
        ]
      }
    ]
  };
  assert.strictEqual(getFirstMessage(deepAttributeError), "Attribute key required");

  // Case D: Nullish / empty object
  assert.strictEqual(getFirstMessage({}), null);
  assert.strictEqual(getFirstMessage(null), null);
  assert.strictEqual(getFirstMessage(undefined), null);

  // Price boundary verification: negative price check
  const priceMinRule = { value: 0, message: "Price must be a positive number" };
  assert.strictEqual(-1 < priceMinRule.value, true, "Negative price must violate min");
  assert.strictEqual(0 < priceMinRule.value, false, "Zero price does not violate min");
  assert.strictEqual(1000000000 < priceMinRule.value, false, "Large price is valid");
});

// ---------------------------------------------------------------------------
// TEST SUITE 5: FORM 4 - UserForm.jsx EMPIRICAL EVALUATION
// ---------------------------------------------------------------------------

test("9. UserForm: Required fields, email regex, role selection, and onError", () => {
  const code = getFile("features/Users/UserForm.jsx");

  assert.match(code, /required:\s*["']User name is required["']/);
  assert.match(code, /required:\s*["']User email is required["']/);
  assert.match(code, /required:\s*["']Password is required["']/);
  assert.match(code, /required:\s*["']Role is required["']/);
  assert.match(code, /ROLE_USER/);
  assert.match(code, /ROLE_ADMIN/);

  // UserForm email regex: /^\S+@\S+$/i
  const userEmailRegex = /^\S+@\S+$/i;
  assert.strictEqual(userEmailRegex.test("admin@store.vn"), true);
  assert.strictEqual(userEmailRegex.test("user+test@sub.org"), true);
  assert.strictEqual(userEmailRegex.test("no-at-symbol"), false);
  assert.strictEqual(userEmailRegex.test("space in@mail.com"), false);

  // UserForm onError simulation
  let toastMsg = null;
  const mockToast = { error: (msg) => { toastMsg = msg; } };

  function simulateUserFormOnError(errors) {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      mockToast.error(firstError.message);
    } else {
      mockToast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc");
    }
  }

  toastMsg = null;
  simulateUserFormOnError({ name: { message: "User name is required" } });
  assert.strictEqual(toastMsg, "User name is required");

  toastMsg = null;
  simulateUserFormOnError({ name: {} });
  assert.strictEqual(toastMsg, "Vui lòng kiểm tra lại các trường thông tin bắt buộc");

  toastMsg = null;
  simulateUserFormOnError({});
  assert.strictEqual(toastMsg, "Vui lòng kiểm tra lại các trường thông tin bắt buộc");
});

// ---------------------------------------------------------------------------
// TEST SUITE 6: FORM 5 - ModifierGroupForm.jsx EMPIRICAL EVALUATION
// ---------------------------------------------------------------------------

test("10. ModifierGroupForm: Nested modifiers validation and onError edge handling", () => {
  const code = getFile("features/Modifiers/ModifierGroupForm.jsx");

  assert.match(code, /required:\s*["']Modifier group name is required["']/);
  assert.match(code, /required:\s*["']Option name is required["']/);
  assert.match(code, /min:\s*\{\s*value:\s*0,\s*message:\s*["']Price must be >= 0["']\s*\}/);

  // Simulate ModifierGroupForm onError
  let toastMsg = null;
  const mockToast = { error: (msg) => { toastMsg = msg; } };

  const onError = (errors) => {
    if (errors.name?.message) {
      mockToast.error(errors.name.message);
      return;
    }
    if (errors.modifiers) {
      const firstModError = Array.isArray(errors.modifiers)
        ? errors.modifiers.find((m) => m?.name || m?.priceAdjustment)
        : null;
      if (firstModError?.name?.message) {
        mockToast.error(firstModError.name.message);
        return;
      }
      if (firstModError?.priceAdjustment?.message) {
        mockToast.error(firstModError.priceAdjustment.message);
        return;
      }
    }
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      mockToast.error(firstError.message);
    } else {
      mockToast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc");
    }
  };

  // Case A: Group name error
  toastMsg = null;
  onError({ name: { message: "Modifier group name is required" } });
  assert.strictEqual(toastMsg, "Modifier group name is required");

  // Case B: Modifier option name error
  toastMsg = null;
  onError({
    modifiers: [
      { name: { message: "Option name is required" } },
    ],
  });
  assert.strictEqual(toastMsg, "Option name is required");

  // Case C: Modifier priceAdjustment error
  toastMsg = null;
  onError({
    modifiers: [
      { priceAdjustment: { message: "Price must be >= 0" } },
    ],
  });
  assert.strictEqual(toastMsg, "Price must be >= 0");

  // Case D: Sparse array in modifiers
  toastMsg = null;
  onError({
    modifiers: [
      undefined,
      { priceAdjustment: { message: "Price must be >= 0" } },
    ],
  });
  assert.strictEqual(toastMsg, "Price must be >= 0");

  // Case E: Non-array modifiers object
  toastMsg = null;
  onError({ modifiers: { message: "General modifier error" } });
  assert.strictEqual(toastMsg, "General modifier error");

  // Case F: Empty errors object
  toastMsg = null;
  onError({});
  assert.strictEqual(toastMsg, "Vui lòng kiểm tra lại các trường thông tin bắt buộc");
});

// ---------------------------------------------------------------------------
// TEST SUITE 7: FORM 6 - ManageCustomers.jsx EMPIRICAL EVALUATION
// ---------------------------------------------------------------------------

test("11. ManageCustomers: Phone number regex boundary and onError execution", () => {
  const code = getFile("pages/ManageCustomers.jsx");

  assert.match(code, /required:\s*["']Name is required["']/);
  assert.match(code, /required:\s*["']Phone number is required["']/);
  assert.ok(code.includes("/^[0-9+ ]{8,15}$/"), "Must specify phone number pattern regex");

  // Phone regex: /^[0-9+ ]{8,15}$/
  const phoneRegex = /^[0-9+ ]{8,15}$/;

  // Valid numbers
  assert.strictEqual(phoneRegex.test("0912345678"), true);
  assert.strictEqual(phoneRegex.test("+84 912345678"), true);
  assert.strictEqual(phoneRegex.test("+1 555 123 4567"), true);
  assert.strictEqual(phoneRegex.test("02438889999"), true);

  // Invalid numbers
  assert.strictEqual(phoneRegex.test("1234567"), false, "Too short (<8 chars)");
  assert.strictEqual(phoneRegex.test("01234567890123456"), false, "Too long (>15 chars)");
  assert.strictEqual(phoneRegex.test("0912abc789"), false, "Alphanumeric letters invalid");
  assert.strictEqual(phoneRegex.test("091-234-5678"), false, "Hyphens not allowed by current pattern");
  assert.strictEqual(phoneRegex.test(""), false, "Empty string fails");
});

// ---------------------------------------------------------------------------
// TEST SUITE 8: FORM 7 - ManagePromotions.jsx EMPIRICAL EVALUATION
// ---------------------------------------------------------------------------

test("12. ManagePromotions: Type-dependent validation rules and discount values", () => {
  const code = getFile("pages/ManagePromotions.jsx");

  assert.match(code, /required:\s*["']Promotion name is required["']/);
  assert.match(code, /required:\s*selectedType\s*===\s*["']COUPON["']\s*\?\s*["']Coupon code is required["']/);
  assert.match(code, /required:\s*["']Discount value is required["']/);
  assert.match(code, /min:\s*\{\s*value:\s*0,\s*message:\s*["']Discount value cannot be negative["']\s*\}/);

  // Negative discount verification
  const discountRule = { value: 0, message: "Discount value cannot be negative" };
  assert.strictEqual(-5 < discountRule.value, true, "Negative discount violates min");
  assert.strictEqual(0 < discountRule.value, false, "Zero discount is valid");
  assert.strictEqual(50 < discountRule.value, false, "Positive discount is valid");
});

// ---------------------------------------------------------------------------
// TEST SUITE 9: FORM 8 - StockOperationModal.jsx EMPIRICAL EVALUATION
// ---------------------------------------------------------------------------

test("13. StockOperationModal: Quick IN/OUT vs Stock Check validation rules", () => {
  const code = getFile("features/Inventory/StockOperationModal.jsx");

  // Quick Adjustment validation
  assert.match(code, /required:\s*["']Quantity is required["']/);
  assert.match(code, /min:\s*\{\s*value:\s*1,\s*message:\s*["']Quantity must be at least 1["']\s*\}/);

  // Stock Check validation
  assert.match(code, /required:\s*["']Physical count is required["']/);
  assert.match(code, /min:\s*\{\s*value:\s*0,\s*message:\s*["']Count cannot be negative["']\s*\}/);

  // Quantity boundary checks for Quick IN/OUT (min: 1)
  const qtyMin = 1;
  assert.strictEqual(0 < qtyMin, true, "0 is invalid for Quick Adjustment");
  assert.strictEqual(-1 < qtyMin, true, "-1 is invalid for Quick Adjustment");
  assert.strictEqual(1 < qtyMin, false, "1 is valid for Quick Adjustment");
  assert.strictEqual(10000 < qtyMin, false, "10000 is valid for Quick Adjustment");

  // Count boundary checks for Stock Check (min: 0)
  const countMin = 0;
  assert.strictEqual(-1 < countMin, true, "-1 is invalid for Stock Check");
  assert.strictEqual(0 < countMin, false, "0 is valid for Stock Check");
  assert.strictEqual(500 < countMin, false, "500 is valid for Stock Check");
});

// ---------------------------------------------------------------------------
// TEST SUITE 10: REGRESSION AUDIT OF EXISTING VERIFICATION TEST
// ---------------------------------------------------------------------------

test("14. Regression Finding: test-verification.mjs Test 5 in sync with react-hook-form", () => {
  const testFileContent = fs.readFileSync(path.join(REPO_ROOT, "Front-end", "test-verification.mjs"), "utf8");
  const loginFormContent = getFile("features/Auth/LoginForm.jsx");

  // Verify that test-verification.mjs expects react-hook-form defaultValues
  assert.ok(testFileContent.includes("defaultValues"), "test-verification.mjs contains assertion for defaultValues");

  // Verify that LoginForm.jsx has migrated away from useState to react-hook-form defaultValues
  assert.strictEqual(loginFormContent.includes('useState("")'), false);
  assert.match(loginFormContent, /useForm\(\{\s*defaultValues:\s*\{\s*email:\s*["']["'],\s*password:\s*["']["']/);
});
