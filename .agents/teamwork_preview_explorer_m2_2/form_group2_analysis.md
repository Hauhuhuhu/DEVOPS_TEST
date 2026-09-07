# Form Group 2 Validation Standardization Analysis

## 1. Executive Summary

This report delivers the complete investigation and exact implementation blueprints for standardizing form validation across **Form Group 2** of Milestone 2 (Phase 4, R2):
1. `Front-end/src/features/Users/UserForm.jsx`
2. `Front-end/src/features/Modifiers/ModifierGroupForm.jsx`
3. `Front-end/src/features/Inventory/StockOperationModal.jsx`

All three components must conform to the unified CRM form validation standard defined in `PROJECT.md` and `spec.md`:
- Form management strictly powered by `react-hook-form`.
- Dual-action error notification:
  1. Immediate `toast.error` alert on submission with validation failures (via `handleSubmit(onSubmit, onError)`).
  2. Dynamic red border highlighting (`border-red-500 focus:ring-red-500 bg-red-50/10`) on every invalid input field.
  3. Inline error message rendered directly below each invalid field: `<p className="text-xs text-red-600 mt-1">{errors[field]?.message}</p>`.
- Clearing or correcting the input immediately removes the red border and error message.

---

## 2. Component Inspection & Gap Analysis

### 2.1 `UserForm.jsx` (`Front-end/src/features/Users/UserForm.jsx`)
- **Current Lines**: 108 lines.
- **Observed Gaps**:
  1. **`formState: { errors }` omitted**: Line 9 calls `const { register, handleSubmit, reset } = useForm();` without destructuring `errors`.
  2. **Static input borders**: All input fields (`name`, `email`, `password`) have static classes `border border-slate-300 focus:ring-blue-500 focus:border-blue-500`. No error state styling exists.
  3. **Zero inline error labels**: No `<p className="text-xs text-red-600 mt-1">` elements exist in the DOM for invalid fields.
  4. **Missing `role` field in UI**: Line 16 hardcodes `role: "ROLE_USER"` into `userRequest`. The user cannot configure the user's role, and requirement Feature 12 explicitly demands validating `role` with inline red messages.
- **Remediation**:
  - Destructure `formState: { errors }` from `useForm()`.
  - Provide default values in `useForm({ defaultValues: { name: "", email: "", password: "", role: "ROLE_USER" } })`.
  - Add explicit `<select>` for `role` with options for `Staff (ROLE_USER)` and `Admin (ROLE_ADMIN)`.
  - Bind `required: "Role is required"` to the role select.
  - Apply conditional border styling:
    `errors[field] ? "border-red-500 focus:ring-red-500 bg-red-50/10" : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"`.
  - Render inline `<p className="text-xs text-red-600 mt-1">{errors[field].message}</p>` beneath each field.
  - Enhance `onError` to ensure fail-safe toast rendering: `if (firstError?.message) toast.error(firstError.message); else toast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc");`.

---

### 2.2 `ModifierGroupForm.jsx` (`Front-end/src/features/Modifiers/ModifierGroupForm.jsx`)
- **Current Lines**: 203 lines.
- **Observed Gaps**:
  1. **`formState: { errors }` omitted**: Line 9-22 initializes `useForm(...)` without destructuring `formState: { errors }`.
  2. **Group Name input lacks error styling**: Line 88 has static `border border-slate-300` and no inline error message beneath the input.
  3. **Dynamic modifier inputs lack conditional error styling**: Lines 160 and 168 have static border styling. If an option name is empty, it turns neither red nor displays an inline error message.
  4. **Modifier price adjustment has no validation rules**: Line 166 has `{...register(\`modifiers.${index}.priceAdjustment\`)}` without `min: { value: 0, message: "Price must be >= 0" }`.
  5. **`onError` array traversal flaw**: Line 63 uses `const firstError = Object.values(errors)[0]`. When an error is on a nested dynamic modifier (`errors.modifiers`), `firstError` is an Array of error objects, causing `firstError.message` to be `undefined`, which suppresses the error toast entirely.
- **Remediation**:
  - Destructure `formState: { errors }` from `useForm(...)`.
  - Group `name`: apply dynamic red border and inline `<p className="text-xs text-red-600 mt-1">{errors.name.message}</p>`.
  - In `fields.map`, wrap each option row with dedicated flex-1 and w-28 columns containing the input and conditional inline `<p className="text-xs text-red-600 mt-1">` for both option `name` and `priceAdjustment`.
  - Add `min: { value: 0, message: "Price must be >= 0" }` to `priceAdjustment`.
  - Update `onError` to inspect nested `errors.modifiers` array to extract the specific option error message or fallback to a standard toast.

---

### 2.3 `StockOperationModal.jsx` (`Front-end/src/features/Inventory/StockOperationModal.jsx`)
- **Current Lines**: 524 lines.
- **Observed Gaps**:
  1. **Missing `toast` import**: `react-hot-toast` is not imported in the file.
  2. **Quick form missing `onError` callback**: Line 211 uses `<form onSubmit={handleSubmit(onSubmitQuick)} className="space-y-4">` with no error callback. When submitted with negative/empty quantity, no toast alert is displayed.
  3. **Stock check form missing `onError` callback**: Line 341 uses `<form onSubmit={handleSubmitCheck(onSubmitCheck)} className="space-y-4">` with no error callback. When submitted with negative/empty actual count, no toast alert is displayed.
  4. **Hardcoded input borders**:
     - Line 277 (`quantity`): Static `border border-slate-300` does not turn red when `errors.quantity` exists.
     - Line 389 (`actualCount`): Static `border border-slate-300` does not turn red when `errorsCheck.actualCount` exists.
- **Remediation**:
  - Import `toast` from `"react-hot-toast"`.
  - Add `onErrorQuick` and `onErrorCheck` helper functions that fire `toast.error(firstError.message)`.
  - Wire callbacks into forms: `handleSubmit(onSubmitQuick, onErrorQuick)` and `handleSubmitCheck(onSubmitCheck, onErrorCheck)`.
  - Update `quantity` input to conditionally apply `border-red-500 focus:ring-red-500 bg-red-50/10` when `errors.quantity` exists.
  - Update `actualCount` input to conditionally apply `border-red-500 focus:ring-red-500 bg-red-50/10` when `errorsCheck.actualCount` exists.

---

## 3. Form Group 2 Validation Comparison Matrix

| Component | Target Fields | Has useForm | errors Destructured | Red Border on Error | Inline Error Text | onError Toast Callback |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **UserForm.jsx** | `name`, `email`, `password`, `role` | ✅ | ❌ **(Fix)** | ❌ **(Fix)** | ❌ **(Fix)** | ⚠️ (Already present, needs fallback) |
| **ModifierGroupForm.jsx** | `name`, `modifiers.[i].name`, `modifiers.[i].priceAdjustment` | ✅ | ❌ **(Fix)** | ❌ **(Fix)** | ❌ **(Fix)** | ⚠️ (Fix nested array traversal) |
| **StockOperationModal.jsx** | `quantity`, `actualCount` | ✅ | ✅ | ❌ **(Fix)** | ✅ (Already in JSX) | ❌ **(Fix: missing onError & toast import)** |

---

## 4. Exact Code Diff Proposals

### 4.1 `Front-end/src/features/Users/UserForm.jsx`

#### Snippet 1: Destructure `errors` and initialize default values (Lines 7–29)
**Before:**
```jsx
function UserForm() {
  const { isCreating, createUser } = useCreateUser();
  const { register, handleSubmit, reset } = useForm();

  function onSubmit(data) {
    const userRequest = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: "ROLE_USER",
    };

    createUser(userRequest, {
      onSuccess: () => {
        reset();
      },
    });
  }

  function onError(errors) {
    const firstError = Object.values(errors)[0];
    if (firstError) toast.error(firstError.message);
  }
```

**After:**
```jsx
function UserForm() {
  const { isCreating, createUser } = useCreateUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "ROLE_USER",
    },
  });

  function onSubmit(data) {
    const userRequest = {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      role: data.role || "ROLE_USER",
    };

    createUser(userRequest, {
      onSuccess: () => {
        reset({
          name: "",
          email: "",
          password: "",
          role: "ROLE_USER",
        });
      },
    });
  }

  function onError(errors) {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc");
    }
  }
```

#### Snippet 2: Add red border, inline `<p>` errors, and `role` select (Lines 40–100)
**Before:**
```jsx
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-slate-700 mb-1">
            User Name *
          </label>
          <input
            type="text"
            id="userName"
            autoComplete="off"
            placeholder="Enter user name"
            {...register("name", {
              required: "User name is required",
            })}
            disabled={isCreating}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="UserEmail" className="block text-sm font-medium text-slate-700 mb-1">
            User Email *
          </label>
          <input
            type="email"
            id="UserEmail"
            placeholder="example@example.com"
            {...register("email", {
              required: "User email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
            disabled={isCreating}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="UserPassword" className="block text-sm font-medium text-slate-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            id="UserPassword"
            placeholder="Enter password"
            {...register("password", {
              required: "Password is required",
            })}
            disabled={isCreating}
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <button
...
```

**After:**
```jsx
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-slate-700 mb-1">
            User Name *
          </label>
          <input
            type="text"
            id="userName"
            autoComplete="off"
            placeholder="Enter user name"
            {...register("name", {
              required: "User name is required",
            })}
            disabled={isCreating}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.name
                ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="UserEmail" className="block text-sm font-medium text-slate-700 mb-1">
            User Email *
          </label>
          <input
            type="email"
            id="UserEmail"
            placeholder="example@example.com"
            {...register("email", {
              required: "User email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
            disabled={isCreating}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
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
          <label htmlFor="UserPassword" className="block text-sm font-medium text-slate-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            id="UserPassword"
            placeholder="Enter password"
            {...register("password", {
              required: "Password is required",
            })}
            disabled={isCreating}
            autoComplete="current-password"
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
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
          <label htmlFor="userRole" className="block text-sm font-medium text-slate-700 mb-1">
            Role *
          </label>
          <select
            id="userRole"
            {...register("role", {
              required: "Role is required",
            })}
            disabled={isCreating}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 transition-colors ${
              errors.role
                ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          >
            <option value="ROLE_USER">Staff (ROLE_USER)</option>
            <option value="ROLE_ADMIN">Admin (ROLE_ADMIN)</option>
          </select>
          {errors.role && (
            <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>
          )}
        </div>

        <button
...
```

---

### 4.2 `Front-end/src/features/Modifiers/ModifierGroupForm.jsx`

#### Snippet 1: Destructure `errors` and fix `onError` (Lines 9–67)
**Before:**
```jsx
  const {
    register,
    control,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      minSelections: 0,
      maxSelections: 1,
      modifiers: [{ name: "", priceAdjustment: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "modifiers",
  });
...
  const onError = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError) toast.error(firstError.message);
  };
```

**After:**
```jsx
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      minSelections: 0,
      maxSelections: 1,
      modifiers: [{ name: "", priceAdjustment: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "modifiers",
  });
...
  const onError = (errors) => {
    if (errors.name?.message) {
      toast.error(errors.name.message);
      return;
    }
    if (errors.modifiers) {
      const firstModError = Array.isArray(errors.modifiers)
        ? errors.modifiers.find((m) => m?.name || m?.priceAdjustment)
        : null;
      if (firstModError?.name?.message) {
        toast.error(firstModError.name.message);
        return;
      }
      if (firstModError?.priceAdjustment?.message) {
        toast.error(firstModError.priceAdjustment.message);
        return;
      }
    }
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc");
    }
  };
```

#### Snippet 2: Group Name and Dynamic Modifier Options JSX (Lines 82–187)
**Before:**
```jsx
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-slate-700 mb-1">
            Group Name *
          </label>
          <input
            type="text"
            id="groupName"
            placeholder="e.g., Sugar Level, Toppings"
            {...register("name", { required: "Modifier group name is required" })}
            disabled={isCreating}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
...
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Option (e.g. Boba)"
                  {...register(`modifiers.${index}.name`, {
                    required: "Option name is required",
                  })}
                  disabled={isCreating}
                  className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Price (+VND)"
                  min={0}
                  {...register(`modifiers.${index}.priceAdjustment`)}
                  disabled={isCreating}
                  className="w-28 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (fields.length <= 1) {
                      toast.error("At least one option is required");
                      return;
                    }
                    remove(index);
                  }}
                  disabled={isCreating || fields.length === 1}
                  title="Remove option"
                  className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
```

**After:**
```jsx
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-slate-700 mb-1">
            Group Name *
          </label>
          <input
            type="text"
            id="groupName"
            placeholder="e.g., Sugar Level, Toppings"
            {...register("name", { required: "Modifier group name is required" })}
            disabled={isCreating}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.name
                ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>
...
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-1">
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Option (e.g. Boba)"
                      {...register(`modifiers.${index}.name`, {
                        required: "Option name is required",
                      })}
                      disabled={isCreating}
                      className={`w-full rounded-lg border px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                        errors.modifiers?.[index]?.name
                          ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                          : "border-slate-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.modifiers?.[index]?.name && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.modifiers[index].name.message}
                      </p>
                    )}
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      placeholder="Price (+VND)"
                      min={0}
                      {...register(`modifiers.${index}.priceAdjustment`, {
                        min: { value: 0, message: "Price must be >= 0" },
                      })}
                      disabled={isCreating}
                      className={`w-full rounded-lg border px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 transition-colors ${
                        errors.modifiers?.[index]?.priceAdjustment
                          ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                          : "border-slate-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.modifiers?.[index]?.priceAdjustment && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.modifiers[index].priceAdjustment.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (fields.length <= 1) {
                        toast.error("At least one option is required");
                        return;
                      }
                      remove(index);
                    }}
                    disabled={isCreating || fields.length === 1}
                    title="Remove option"
                    className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-40 cursor-pointer self-start mt-0.5"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
```

---

### 4.3 `Front-end/src/features/Inventory/StockOperationModal.jsx`

#### Snippet 1: Import `toast` and define error callbacks (Lines 1–122)
**Before:**
```jsx
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRecordTransaction, useStockCheck } from "./useRecordTransaction";
import { useVariantTransactions } from "./useVariantTransactions";
import Spinner from "../../ui/Spinner";
```

**After:**
```jsx
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useRecordTransaction, useStockCheck } from "./useRecordTransaction";
import { useVariantTransactions } from "./useVariantTransactions";
import Spinner from "../../ui/Spinner";
```

And add before `return`:
```jsx
  const onErrorQuick = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc");
    }
  };

  const onErrorCheck = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc");
    }
  };
```

#### Snippet 2: Quick Adjustment Form submission and `quantity` border (Lines 210–283)
**Before:**
```jsx
          {activeTab === "quick" && (
            <form onSubmit={handleSubmit(onSubmitQuick)} className="space-y-4">
...
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    {...register("quantity", {
                      required: "Quantity is required",
                      min: { value: 1, message: "Quantity must be at least 1" },
                      valueAsNumber: true,
                    })}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
```

**After:**
```jsx
          {activeTab === "quick" && (
            <form onSubmit={handleSubmit(onSubmitQuick, onErrorQuick)} className="space-y-4">
...
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    {...register("quantity", {
                      required: "Quantity is required",
                      min: { value: 1, message: "Quantity must be at least 1" },
                      valueAsNumber: true,
                    })}
                    className={`w-full pl-8 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                      errors.quantity
                        ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  />
```

#### Snippet 3: Stock Check Form submission and `actualCount` border (Lines 340–395)
**Before:**
```jsx
          {activeTab === "check" && (
            <form onSubmit={handleSubmitCheck(onSubmitCheck)} className="space-y-4">
...
                <input
                  type="number"
                  min="0"
                  placeholder="Enter actual counted stock..."
                  {...registerCheck("actualCount", {
                    required: "Physical count is required",
                    min: { value: 0, message: "Count cannot be negative" },
                    valueAsNumber: true,
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
```

**After:**
```jsx
          {activeTab === "check" && (
            <form onSubmit={handleSubmitCheck(onSubmitCheck, onErrorCheck)} className="space-y-4">
...
                <input
                  type="number"
                  min="0"
                  placeholder="Enter actual counted stock..."
                  {...registerCheck("actualCount", {
                    required: "Physical count is required",
                    min: { value: 0, message: "Count cannot be negative" },
                    valueAsNumber: true,
                  })}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                    errorsCheck.actualCount
                      ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                      : "border-slate-300 focus:ring-blue-500"
                  }`}
                />
```

---

## 5. Verification & Test Plan

1. **Lint Verification**:
   - Command: `npm run lint` inside `Front-end/`.
   - Expected: 0 errors, 0 warnings.
2. **Build Verification**:
   - Command: `npm run build` inside `Front-end/`.
   - Expected: Vite builds successfully with 0 compilation errors.
3. **Behavioral Acceptance Matrix**:
   - **UserForm**:
     - Submit with empty Name, Email, Password -> Toast displays first error message; inputs for name, email, password turn red; inline red messages render below all three.
     - Submit with invalid email format (e.g. `invalid-email`) -> Red border on email input; inline message "Invalid email address".
     - Valid submission -> Creates user, form resets to clean state with default role `ROLE_USER`, red borders cleared.
   - **ModifierGroupForm**:
     - Submit with empty Group Name -> Red border on group name; inline message "Modifier group name is required"; toast alert shown.
     - Submit with empty Option Name -> Red border on that specific option name; inline message "Option name is required"; toast alert shown.
     - Enter negative price adjustment -> Red border on price input; inline message "Price must be >= 0".
     - Click "Add Option" and fill valid data -> Options successfully save without errors.
   - **StockOperationModal**:
     - In "Stock IN / OUT" tab, clear quantity or set to 0 -> Submit -> Toast appears with "Quantity is required" or "Quantity must be at least 1"; quantity input border turns red; inline red message shown.
     - In "Stock Check" tab, set count to -1 -> Submit -> Toast appears with "Count cannot be negative"; count input border turns red; inline red message shown.
     - Correcting input and re-submitting -> Executes transaction and transitions to history tab.
