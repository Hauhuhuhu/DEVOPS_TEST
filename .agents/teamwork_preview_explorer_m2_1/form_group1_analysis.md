# Form Group 1 Validation Standardization Analysis
**Milestone**: Milestone 2 (Phase 4 UX Refinement - R2 Unified Form Validation UX)  
**Target Forms**:
1. `Front-end/src/features/Auth/LoginForm.jsx`
2. `Front-end/src/features/Category/CategoryForm.jsx`
3. `Front-end/src/features/Items/ItemForm.jsx`

---

## 1. Executive Summary

Milestone 2 establishes a unified, predictable validation UX across all application forms using `react-hook-form` and `react-hot-toast`. Form Group 1 comprises three high-impact entry and administrative forms:
- **`LoginForm.jsx`**: Currently relies on standard React `useState` hooks, native browser HTML5 `required` constraints, and silent form rejection (`if (!email || !password) return;`). It completely lacks inline error displays, regex-based email validation, red error borders, and failure toast notifications.
- **`CategoryForm.jsx`**: Already imports `useForm` from `react-hook-form`, but fails to destructure `formState: { errors }`. Consequently, inputs for category name and description never receive active visual error states (`border-red-500`) or inline `<p>` feedback messages when validation fails.
- **`ItemForm.jsx`**: Employs `useForm` and `useFieldArray` for complex physical variant attributes, but omits `formState: { errors }`. Required inputs (`name`, `categoryId`, `price`, `description`) and dynamic variant inputs (`sku`, `basePrice`) lack `react-hook-form` registration validation rules and inline/border error feedback, relying instead on manual post-submit loops inside `onSubmit`. Furthermore, its `onError` handler cannot parse nested error objects from dynamic variants without recursion.

This document details the exact before/after code specifications to standardize all three forms to the project's design system tokens:
- **Error Border & Background**: `border-red-500 focus:ring-red-500 bg-red-50/10`
- **Inline Error Text**: `<p className="text-xs text-red-600 mt-1">{errors[field]?.message}</p>`
- **Toast Feedback**: `toast.error(...)` via `react-hot-toast` immediately on invalid submission
- **Form Interception**: `<form ... noValidate>` to suppress conflicting native browser validation popups.

---

## 2. Component Analysis & Design Specifications

### 2.1. `Front-end/src/features/Auth/LoginForm.jsx`

#### A. Current State & Deficiencies
- **State Mechanism**: Uses `const [email, setEmail] = useState("")` and `const [password, setPassword] = useState("")`.
- **Validation**: Relies on browser-native `required` attributes and silent guard clause `if (!email || !password) return;` inside `handleSubmit(e)`.
- **UX Gaps**:
  - No email format verification (e.g. `user@example.com`).
  - No visual feedback (inputs remain `border-slate-300`).
  - No toast notification on failed submission.
  - Native browser tooltip blocks React styling consistency.

#### B. Standardization Requirements
1. **Migrate to `react-hook-form`**:
   - Destructure `{ register, handleSubmit, reset, formState: { errors } }` from `useForm({ defaultValues: { email: "", password: "" } })`.
   - Remove `useState`.
2. **Validation Rules**:
   - `email`: Required (`"Email is required"`), regex pattern `/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i` (`"Invalid email address"`).
   - `password`: Required (`"Password is required"`).
3. **Form Submission & Feedback**:
   - `onSubmit(data)`: Calls `login({ email: data.email, password: data.password }, { onSettled: () => reset() })`.
   - `onError(errors)`: Calls `toast.error(firstError.message || "Please check the required fields")`.
   - Add `noValidate` on `<form>`.
4. **Visual Styling**:
   - Input class:
     ```jsx
     className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:bg-slate-50 transition-colors ${
       errors.email
         ? "border-red-500 focus:ring-red-500 bg-red-50/10"
         : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
     }`}
     ```
   - Inline error:
     ```jsx
     {errors.email && (
       <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
     )}
     ```

#### C. Proposed Replacement Code for `LoginForm.jsx`
```jsx
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLogin } from "./useLogin";
import Spinner from "../../ui/Spinner";

function LoginForm() {
  const { login, isLoading } = useLogin();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data) {
    login(
      { email: data.email, password: data.password },
      {
        onSettled: () => {
          reset();
        },
      },
    );
  }

  function onError(errors) {
    const firstError = Object.values(errors)[0];
    if (firstError) toast.error(firstError.message || "Please check the required fields");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Email address
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          autoComplete="username"
          disabled={isLoading}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:bg-slate-50 transition-colors ${
            errors.email
              ? "border-red-500 focus:ring-red-500 bg-red-50/10"
              : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
          }`}
        />
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={isLoading}
          {...register("password", {
            required: "Password is required",
          })}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:bg-slate-50 transition-colors ${
            errors.password
              ? "border-red-500 focus:ring-red-500 bg-red-50/10"
              : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
          }`}
        />
        {errors.password && (
          <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isLoading ? <Spinner className="text-white" /> : "Sign in"}
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
```

---

### 2.2. `Front-end/src/features/Category/CategoryForm.jsx`

#### A. Current State & Deficiencies
- **Form Hook**: `const { register, handleSubmit, reset } = useForm();` (line 13). Note that `formState: { errors }` is completely omitted.
- **Error Feedback**: `onError(errors)` already exists and fires `toast.error(firstError.message)`.
- **Inputs Missing Visual Feedback**:
  - `name`: Static classes `border-slate-300 focus:ring-blue-500 focus:border-blue-500`. No red border, no `<p className="text-xs text-red-600 mt-1">`.
  - `description`: Static classes `border-slate-300 focus:ring-blue-500 focus:border-blue-500`. No red border, no `<p className="text-xs text-red-600 mt-1">`.

#### B. Standardization Requirements
1. **Destructure `formState: { errors }`**:
   ```jsx
   const {
     register,
     handleSubmit,
     reset,
     formState: { errors },
   } = useForm();
   ```
2. **Add `noValidate`**:
   ```jsx
   <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="space-y-4">
   ```
3. **Category Name Input**:
   - Conditional border classes:
     ```jsx
     className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
       errors.name
         ? "border-red-500 focus:ring-red-500 bg-red-50/10"
         : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
     }`}
     ```
   - Inline message:
     ```jsx
     {errors.name && (
       <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
     )}
     ```
4. **Category Description Textarea**:
   - Conditional border classes:
     ```jsx
     className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
       errors.description
         ? "border-red-500 focus:ring-red-500 bg-red-50/10"
         : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
     }`}
     ```
   - Inline message:
     ```jsx
     {errors.description && (
       <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
     )}
     ```

#### C. Exact Code Diff for `CategoryForm.jsx`
```diff
@@ -10,7 +10,12 @@
 function CategoryForm() {
   const [previewUrl, setPreviewUrl] = useState(DEFAULT_PREVIEW);
   const { isCreating, createCategory } = useCreateCategory();
-  const { register, handleSubmit, reset } = useForm();
+  const {
+    register,
+    handleSubmit,
+    reset,
+    formState: { errors },
+  } = useForm();
 
   useEffect(() => {
     return () => {
@@ -76,7 +81,7 @@
         <h2 className="text-base font-semibold text-slate-900">Add Category</h2>
       </div>
 
-      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
+      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="space-y-4">
         {/* Image Upload Area */}
         <div className="text-center">
           <label
@@ -129,8 +134,15 @@
             {...register("name", {
               required: "Category name is required",
             })}
-            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
+            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
+              errors.name
+                ? "border-red-500 focus:ring-red-500 bg-red-50/10"
+                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
+            }`}
           />
+          {errors.name && (
+            <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
+          )}
         </div>
 
         <div>
@@ -144,8 +156,15 @@
               required: "Category description is required",
             })}
             disabled={isCreating}
-            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
+            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
+              errors.description
+                ? "border-red-500 focus:ring-red-500 bg-red-50/10"
+                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
+            }`}
           />
+          {errors.description && (
+            <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
+          )}
         </div>
 
         <div>
```

---

### 2.3. `Front-end/src/features/Items/ItemForm.jsx`

#### A. Current State & Deficiencies
- **Missing `errors` Destructuring**: Line 71 calls `useForm({ ... })` without `formState: { errors }`.
- **Top-Level Required Fields**:
  - `name`: Has `{ required: "Item name is required" }`, but static border classes and no inline `<p>`.
  - `categoryId`: Has `{ required: "Category is required" }`, but static border classes and no inline `<p>`.
  - `description`: Has `{ required: "Item description is required" }`, but static border classes and no inline `<p>`.
  - `price`: Has `{ required: !hasVariants ? "Price is required" : false }`, but static border classes and no inline `<p>`.
- **Dynamic Variant Inputs**:
  - Lines 417-428:
    `{...register("variants.${vIndex}.sku")}`
    `{...register("variants.${vIndex}.basePrice")}`
    These fields contain **zero** validation rules in `register()`. Instead, `onSubmit` had a manual loop `for (let i = 0; i < data.variants.length; i++)`.
    Consequently, `handleSubmit` never rejected invalid variant inputs before calling `onSubmit`, preventing inline red error feedback and border highlighting on variant cards.
- **Nested Error Handling in `onError`**:
  - Current handler:
    ```jsx
    function onError(errors) {
      const firstError = Object.values(errors)[0];
      if (firstError) toast.error(firstError.message);
    }
    ```
    When an error occurs on `variants`, `errors.variants` is an array: `[{ sku: { message: "Variant SKU is required" } }]`.
    `Object.values(errors)[0]` is the array `[{ sku: ... }]`, so `firstError.message` is `undefined`. The toast fails to display a meaningful error string.

#### B. Standardization Requirements
1. **Destructure `formState: { errors }`**:
   ```jsx
   const {
     register,
     control,
     handleSubmit,
     reset,
     formState: { errors },
   } = useForm({ ... });
   ```
2. **Recursive Error Parser in `onError`**:
   ```jsx
   function onError(errors) {
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
     const message = getFirstMessage(errors) || "Please check the required fields";
     toast.error(message);
   }
   ```
3. **Register Dynamic Variant Fields**:
   - `variants.${vIndex}.sku`:
     ```jsx
     {...register(`variants.${vIndex}.sku`, {
       required: hasVariants ? "Variant SKU is required" : false,
     })}
     ```
     Border:
     ```jsx
     className={`w-full rounded-md border px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 transition-colors ${
       errors.variants?.[vIndex]?.sku
         ? "border-red-500 focus:ring-red-500 bg-red-50/10"
         : "border-slate-300 focus:ring-blue-500"
     }`}
     ```
     Inline message:
     ```jsx
     {errors.variants?.[vIndex]?.sku && (
       <p className="text-xs text-red-600 mt-1">
         {errors.variants[vIndex].sku.message}
       </p>
     )}
     ```
   - `variants.${vIndex}.basePrice`:
     ```jsx
     {...register(`variants.${vIndex}.basePrice`, {
       required: hasVariants ? "Base price is required" : false,
       min: {
         value: 0,
         message: "Base price must be a positive number",
       },
     })}
     ```
     Border:
     ```jsx
     className={`w-full rounded-md border px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 transition-colors ${
       errors.variants?.[vIndex]?.basePrice
         ? "border-red-500 focus:ring-red-500 bg-red-50/10"
         : "border-slate-300 focus:ring-blue-500"
     }`}
     ```
     Inline message:
     ```jsx
     {errors.variants?.[vIndex]?.basePrice && (
       <p className="text-xs text-red-600 mt-1">
         {errors.variants[vIndex].basePrice.message}
       </p>
     )}
     ```
4. **Item Name Input**:
   - Border:
     ```jsx
     className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
       errors.name
         ? "border-red-500 focus:ring-red-500 bg-red-50/10"
         : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
     }`}
     ```
   - Inline message:
     ```jsx
     {errors.name && (
       <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
     )}
     ```
5. **Category Select**:
   - Border:
     ```jsx
     className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition-colors ${
       errors.categoryId
         ? "border-red-500 focus:ring-red-500 bg-red-50/10"
         : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
     }`}
     ```
   - Inline message:
     ```jsx
     {errors.categoryId && (
       <p className="text-xs text-red-600 mt-1">{errors.categoryId.message}</p>
     )}
     ```
6. **Description Textarea**:
   - Border:
     ```jsx
     className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
       errors.description
         ? "border-red-500 focus:ring-red-500 bg-red-50/10"
         : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
     }`}
     ```
   - Inline message:
     ```jsx
     {errors.description && (
       <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
     )}
     ```
7. **Single Price Input (when `!hasVariants`)**:
   - Border:
     ```jsx
     className={`w-full rounded-lg border px-3 py-1.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition-colors ${
       errors.price
         ? "border-red-500 focus:ring-red-500 bg-red-50/10"
         : "border-slate-300 focus:ring-blue-500"
     }`}
     ```
   - Inline message:
     ```jsx
     {errors.price && (
       <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>
     )}
     ```

#### C. Exact Code Diff for `ItemForm.jsx`
```diff
@@ -68,7 +68,13 @@
   const [previewUrl, setPreviewUrl] = useState(DEFAULT_PREVIEW);
   const { isCreating, createItem } = useCreateItem();
 
-  const { register, control, handleSubmit, reset } = useForm({
+  const {
+    register,
+    control,
+    handleSubmit,
+    reset,
+    formState: { errors },
+  } = useForm({
     defaultValues: {
       name: "",
       description: "",
@@ -204,8 +210,18 @@
   }
 
   function onError(errors) {
-    const firstError = Object.values(errors)[0];
-    if (firstError) toast.error(firstError.message);
+    function getFirstMessage(err) {
+      if (!err) return null;
+      if (typeof err === "object") {
+        if (err.message && typeof err.message === "string") return err.message;
+        for (const key of Object.keys(err)) {
+          const res = getFirstMessage(err[key]);
+          if (res) return res;
+        }
+      }
+      return null;
+    }
+    const message = getFirstMessage(errors) || "Please check the required fields";
+    toast.error(message);
   }
 
   const handleImageChange = (e) => {
@@ -228,7 +244,7 @@
         <h2 className="text-base font-semibold text-slate-900">Add Item</h2>
       </div>
 
-      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
+      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="space-y-4">
         {/* Image Upload Area */}
         <div className="text-center">
           <label
@@ -281,7 +297,14 @@
             id="itemName"
             placeholder="Enter item name"
             {...register("name", { required: "Item name is required" })}
             disabled={isCreating}
-            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
+            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
+              errors.name
+                ? "border-red-500 focus:ring-red-500 bg-red-50/10"
+                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
+            }`}
           />
+          {errors.name && (
+            <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
+          )}
         </div>
 
         <div>
@@ -294,7 +317,11 @@
             {...register("categoryId", {
               required: "Category is required",
             })}
             disabled={isCreating}
-            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
+            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition-colors ${
+              errors.categoryId
+                ? "border-red-500 focus:ring-red-500 bg-red-50/10"
+                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
+            }`}
           >
             <option value="">--Select category--</option>
             {isCategoriesLoading ? (
@@ -307,6 +334,9 @@
               ))
             )}
           </select>
+          {errors.categoryId && (
+            <p className="text-xs text-red-600 mt-1">{errors.categoryId.message}</p>
+          )}
         </div>
 
         <div>
@@ -321,7 +351,14 @@
             {...register("description", {
               required: "Item description is required",
             })}
             disabled={isCreating}
-            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
+            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
+              errors.description
+                ? "border-red-500 focus:ring-red-500 bg-red-50/10"
+                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
+            }`}
           />
+          {errors.description && (
+            <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
+          )}
         </div>
 
         {/* Physical Variants Management */}
@@ -360,7 +397,14 @@
                   },
                 })}
                 disabled={isCreating}
-                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
+                className={`w-full rounded-lg border px-3 py-1.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition-colors ${
+                  errors.price
+                    ? "border-red-500 focus:ring-red-500 bg-red-50/10"
+                    : "border-slate-300 focus:ring-blue-500"
+                }`}
               />
+              {errors.price && (
+                <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>
+              )}
             </div>
           ) : (
@@ -414,7 +458,16 @@
                       <input
                         type="text"
                         placeholder="SKU (e.g., TS-RED-M)"
-                        {...register(`variants.${vIndex}.sku`)}
+                        {...register(`variants.${vIndex}.sku`, {
+                          required: hasVariants ? "Variant SKU is required" : false,
+                        })}
                         disabled={isCreating}
-                        className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
+                        className={`w-full rounded-md border px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 transition-colors ${
+                          errors.variants?.[vIndex]?.sku
+                            ? "border-red-500 focus:ring-red-500 bg-red-50/10"
+                            : "border-slate-300 focus:ring-blue-500"
+                        }`}
                       />
+                      {errors.variants?.[vIndex]?.sku && (
+                        <p className="text-xs text-red-600 mt-1">
+                          {errors.variants[vIndex].sku.message}
+                        </p>
+                      )}
                     </div>
                     <div>
                       <input
                         type="number"
                         placeholder="Base Price"
                         min={0}
-                        {...register(`variants.${vIndex}.basePrice`)}
+                        {...register(`variants.${vIndex}.basePrice`, {
+                          required: hasVariants ? "Base price is required" : false,
+                          min: {
+                            value: 0,
+                            message: "Base price must be a positive number",
+                          },
+                        })}
                         disabled={isCreating}
-                        className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
+                        className={`w-full rounded-md border px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 transition-colors ${
+                          errors.variants?.[vIndex]?.basePrice
+                            ? "border-red-500 focus:ring-red-500 bg-red-50/10"
+                            : "border-slate-300 focus:ring-blue-500"
+                        }`}
                       />
+                      {errors.variants?.[vIndex]?.basePrice && (
+                        <p className="text-xs text-red-600 mt-1">
+                          {errors.variants[vIndex].basePrice.message}
+                        </p>
+                      )}
                     </div>
                   </div>
```

---

## 3. Verification & Quality Assurance Strategy

### 3.1. Independent Verification Commands
- **Lint Check**: `npm run lint` in `Front-end/` (must pass with 0 warnings/errors).
- **Build Check**: `npm run build` in `Front-end/` (must bundle cleanly).

### 3.2. Behavioral Test Cases for Implementer
1. **LoginForm**:
   - Submit empty form -> Toast `"Email is required"`, both email and password inputs get red border (`border-red-500 focus:ring-red-500 bg-red-50/10`), inline messages `"Email is required"` and `"Password is required"`.
   - Enter invalid email `test@` -> Toast `"Invalid email address"`, email input highlighted red, inline `"Invalid email address"`.
   - Enter valid email `test@example.com` -> Red border and inline text immediately disappear (`reValidateMode: 'onChange'`).
   - Enter password and submit -> `loginApi` called; on settle, inputs reset.
2. **CategoryForm**:
   - Submit without category name or description -> Toast `"Category name is required"`, inputs turn red, inline messages render below.
   - Enter name -> Name field reverts to `border-slate-300`.
   - Submit with empty image -> Toast `"Vui lòng chọn hình ảnh"`.
3. **ItemForm**:
   - Submit with empty name, category, price -> Toast with first error message, corresponding inputs highlighted in red with inline messages.
   - Toggle "Multiple Physical Variants" ON -> Price field disappears; Variant #1 SKU and Base Price inputs appear.
   - Submit without variant SKU -> Toast `"Variant SKU is required"`, variant SKU input highlighted red, inline message displayed.
   - Add another variant -> New variant inputs behave identically.
