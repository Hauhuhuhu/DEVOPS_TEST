## 2026-09-07T04:03:00Z

You are a teamwork_preview_worker.
Your working directory is: e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\teamwork_preview_worker_m2_1

MANDATORY FIRST STEP: You MUST read ORIGINAL_REQUEST.md at:
e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\ORIGINAL_REQUEST.md

Also read:
- Project architecture: e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\teamwork_preview_orchestrator_1\PROJECT.md
- Form Group 1 Analysis (LoginForm, CategoryForm, ItemForm): e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\teamwork_preview_explorer_m2_1\form_group1_analysis.md
- Form Group 2 Analysis (UserForm, ModifierGroupForm, StockOperationModal): e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\teamwork_preview_explorer_m2_2\form_group2_analysis.md
- Form Group 3 Analysis (ManageCustomers, ManagePromotions, validation tokens): e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\teamwork_preview_explorer_m2_3\form_group3_analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own exclusively the following 8 files:
1. `Front-end/src/features/Auth/LoginForm.jsx`
2. `Front-end/src/features/Category/CategoryForm.jsx`
3. `Front-end/src/features/Items/ItemForm.jsx`
4. `Front-end/src/features/Users/UserForm.jsx`
5. `Front-end/src/features/Modifiers/ModifierGroupForm.jsx`
6. `Front-end/src/pages/ManageCustomers.jsx`
7. `Front-end/src/pages/ManagePromotions.jsx`
8. `Front-end/src/features/Inventory/StockOperationModal.jsx`

DO NOT modify any other files.

TASKS:
Implement unified form validation UX across all 8 target forms strictly adhering to the designs in the 3 analysis files:
1. `LoginForm.jsx`: Migrate from `useState` to `react-hook-form`. Email pattern validation, required password, toast error notification on invalid submit, red border (`border-red-500 focus:ring-red-500 bg-red-50/10`), inline error message `<p className="text-xs text-red-600 mt-1">{errors.email?.message}</p>`.
2. `CategoryForm.jsx`: Destructure `formState: { errors }`, add conditional red borders and inline `<p>` error text for `name` and `description`.
3. `ItemForm.jsx`: Destructure `formState: { errors }`, add conditional red borders and inline `<p>` error text for `name`, `categoryId`, `price`, and dynamic variant fields (`sku`, `basePrice`). Recursive error handling in `onError` to toast on nested variant errors.
4. `UserForm.jsx`: Destructure `formState: { errors }`, add conditional red borders and inline `<p>` error text for `name`, `email`, `password`, `role`.
5. `ModifierGroupForm.jsx`: Destructure `formState: { errors }`, add conditional red borders and inline `<p>` error text for group `name` and dynamic modifier options (`name`, `price`).
6. `ManageCustomers.jsx`: Import `toast` from `react-hot-toast` and wire `onError` callback in `handleSubmit(onSubmit, onError)` so `toast.error` displays on invalid submit.
7. `ManagePromotions.jsx`: Import `toast` from `react-hot-toast` and wire `onError` callback in `handleSubmit(onSubmit, onError)`. Standardize red border and inline error on `discountValue`.
8. `StockOperationModal.jsx`: Wire `onError` callback into `handleSubmit(onSubmit, onError)` for both quick adjustment and inventory check forms. Apply conditional `border-red-500` to `quantity` and `actualCount`.

VERIFICATION:
- Run `npm run lint` in `Front-end/` (must pass with 0 errors/warnings).
- Run `npm run build` in `Front-end/` (must build cleanly with 0 errors).
- Document all changes in:
  e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\teamwork_preview_worker_m2_1\changes.md
- Write your handoff report to:
  e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\teamwork_preview_worker_m2_1\handoff.md
- When complete, send a message back to the orchestrator using send_message.
