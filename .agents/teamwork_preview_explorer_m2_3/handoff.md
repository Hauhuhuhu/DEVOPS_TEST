# Handoff Report — Form Group 3 & UX Consistency of Milestone 2 (R2)

## 1. Observation
- **`Front-end/src/pages/ManageCustomers.jsx`**:
  - Line 2: `import { useForm } from "react-hook-form";` is imported, but `react-hot-toast` is absent from imports (lines 1–11).
  - Lines 27–28: `formState: { errors }` is destructured from `useForm(...)`.
  - Line 76: `<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">` specifies only an `onSubmit` handler; no `onError` callback is provided.
  - Lines 85–92 and 109–115: Conditional classes check `errors.name` and `errors.phoneNumber`, applying `border-red-500 focus:ring-red-500`, but omitting `bg-red-50/10`. Inline `<p className="text-xs text-red-600 mt-1">` is present.
- **`Front-end/src/pages/ManagePromotions.jsx`**:
  - Line 2: `import { useForm, useWatch } from "react-hook-form";` is imported, but `react-hot-toast` is absent from imports (lines 1–11).
  - Line 40: `formState: { errors }` is destructured from `useForm(...)`.
  - Line 159: `<form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">` specifies only an `onSubmit` handler; no `onError` callback is provided.
  - Lines 182–188 and 212–223: Inputs for `name` and `code` check `errors.name` and `errors.code`, applying `border-red-500 focus:ring-red-500`, but omitting `bg-red-50/10`.
  - Lines 241–248 (COUPON panel) and 300–307 (HAPPY_HOUR panel): `discountValue` input registers as `{ required: true, min: 0 }` with no error message, static `border-slate-300` styling with no `errors.discountValue` check, and no inline `<p>` error label rendered.
- **Application Shell (`Front-end/src/App.jsx`)**:
  - Line 12: `import { Toaster } from "react-hot-toast";`
  - Line 25: `<Toaster />` is mounted at the root under `BrowserRouter`, ensuring that any `toast.error()` call in child routes will display toast notifications immediately.
- **Dependencies (`Front-end/package.json`)**:
  - Line 19: `"react-hook-form": "^7.80.0"`
  - Line 20: `"react-hot-toast": "^2.6.0"`

## 2. Logic Chain
1. **Observation 1 & 3**: In `ManageCustomers.jsx` (line 76) and `ManagePromotions.jsx` (line 159), `handleSubmit` is invoked with only one argument: `handleSubmit(onSubmit)`.
2. **Inference 1**: When user triggers submit on invalid or empty required fields, `react-hook-form` halts submission and looks for a second argument `onError(errors)`. Because no second argument is supplied, execution silently finishes without alerting the user via toast.
3. **Observation 1 & 2**: Neither file imports `react-hot-toast`, despite `react-hot-toast` being installed and `<Toaster />` mounted globally in `App.jsx`.
4. **Inference 2**: Importing `toast from "react-hot-toast"` and wiring `handleSubmit(onSubmit, onError)` with `function onError(errors) { const firstError = Object.values(errors)[0]; toast.error(firstError?.message || "Please check the required fields"); }` will instantly bridge the silent failure and render user-facing toast alerts.
5. **Observation 2 & 4**: In `ManagePromotions.jsx`, `discountValue` is required for discounts to be valid, but lacks message strings, error classes, and inline `<p>` elements.
6. **Inference 3**: Registering `discountValue` with `{ required: "Discount value is required", min: { value: 0, message: "Discount value cannot be negative" } }` along with conditional border styling (`errors.discountValue ? "border-red-500 focus:ring-red-500 bg-red-50/10" : "border-slate-300 focus:ring-blue-500"`) and an inline `<p className="text-xs text-red-600 mt-1">{errors.discountValue.message}</p>` will guarantee parity with the project design tokens.
7. **Observation 1 & 2**: All forms share a common validation requirement across Milestone 2. Because `react-hook-form` uses `reValidateMode: "onChange"` by default once validation has fired, correcting invalid input immediately removes the error state, satisfying real-time error clearing.

## 3. Caveats
- **Scope limitation**: This investigation explored Form Group 3 (`ManageCustomers.jsx`, `ManagePromotions.jsx`) and designed cross-form consistency criteria. Form Group 1 (`LoginForm`, `CategoryForm`, `ItemForm`) is assigned to explorer `m2_1`, and Form Group 2 (`UserForm`, `ModifierGroupForm`, `StockOperationModal`) is assigned to explorer `m2_2`.
- **Promotion Type Switching**: In `ManagePromotions.jsx`, when switching between `COUPON`, `HAPPY_HOUR`, and `BOGO`, inputs unmount/mount conditionally based on `selectedType`. React Hook Form retains unmounted field values unless `shouldUnregister: true` is configured or `reset` is called. The current submit handler safely overrides unused values with null, so this does not cause validation blocking.

## 4. Conclusion
Form Group 3 requires only localized additions to achieve 100% compliance with Milestone 2 (R2):
1. In `Front-end/src/pages/ManageCustomers.jsx`:
   - Add `import toast from "react-hot-toast";`
   - Implement `onError(errors)` function.
   - Wire `onSubmit={handleSubmit(onSubmit, onError)}`.
   - Update input styling to include `bg-red-50/10` on `name` and `phoneNumber`.
2. In `Front-end/src/pages/ManagePromotions.jsx`:
   - Add `import toast from "react-hot-toast";`
   - Implement `onError(errors)` function.
   - Wire `onSubmit={handleSubmit(onSubmit, onError)}`.
   - Update `name` and `code` input classes to include `bg-red-50/10`.
   - Standardize `discountValue` validation with explicit error message, red border styling, and inline `<p>` error rendering in both COUPON and HAPPY_HOUR tabs.
3. The unified verification criteria across all 8 forms have been established in `form_group3_analysis.md`.

## 5. Verification Method
1. **Source Inspection**:
   - Verify `import toast from "react-hot-toast"` in `ManageCustomers.jsx` and `ManagePromotions.jsx`.
   - Verify `handleSubmit(onSubmit, onError)` on line 76 of `ManageCustomers.jsx` and line 159 of `ManagePromotions.jsx`.
   - Verify `<p className="text-xs text-red-600 mt-1">` on all invalid fields.
2. **Functional UI Test**:
   - Navigate to `/customers`. Click "Save Customer" with empty name and phone. Confirm a red toast notification pops up, both fields show red borders and red background tint, and inline error text appears below each. Type a valid name and phone; confirm borders and messages disappear immediately.
   - Navigate to `/promotions`. Click "Save Promo" with empty fields. Confirm toast error appears, invalid fields highlight red, and inline messages display.
3. **Build & Lint Commands**:
   - `npm run lint` in `Front-end/` must pass with 0 errors.
   - `npm run build` in `Front-end/` must complete with 0 errors.
