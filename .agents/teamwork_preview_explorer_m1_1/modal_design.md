# ConfirmDeleteModal Design & Implementation Guide

## 1. Executive Summary

Milestone 1 (R3) requires replacing all raw browser `window.confirm` dialogs with a modern, accessible, and reusable `ConfirmDeleteModal` component. 

Browser `window.confirm` dialogs have several severe flaws:
- They are unstyled, browser-dependent popups that clash with the Tailwind CRM visual design system.
- They block the main browser thread synchronously.
- They do not support loading states or asynchronous mutation feedback, allowing users to accidentally double-submit or refresh while a deletion request is in flight.
- They cannot display structured entity information, danger warning icons, or customized action buttons.

This document provides the complete architectural specification, exact source code implementation, and step-by-step migration guide for all 6 call sites across the application.

---

## 2. Component Architecture & Interface Contract

### 2.1 File Location
`Front-end/src/ui/ConfirmDeleteModal.jsx`

### 2.2 Props Interface

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `boolean` | `required` | Controls visibility. When `false`, component returns `null`. |
| `onClose` | `() => void` | `required` | Invoked when the user dismisses the modal (Cancel button, X button, backdrop click, Escape key). |
| `onConfirm` | `() => void` | `required` | Invoked when the user clicks the primary destructive action ("Delete"). |
| `title` | `string` | `"Confirm Deletion"` | Heading rendered in the modal header. |
| `entityName` | `string` | `""` | The name/identifier of the item being deleted (rendered in bold for prominent context). |
| `message` | `string` | `"Are you sure you want to delete this item? This action cannot be undone."` | Contextual explanatory text or warning. |
| `isLoading` | `boolean` | `false` | True when the deletion mutation is active. Disables all dismiss and confirm actions, and renders a loading spinner. |
| `confirmText` | `string` | `"Delete"` | Label text for the destructive button. |
| `cancelText` | `string` | `"Cancel"` | Label text for the dismissal button. |

---

## 3. UX & Accessibility (a11y) Specifications

1. **React Portal Rendering**:
   - Renders directly to `document.body` using `createPortal`.
   - Ensures the modal breaks out of any parent CSS transforms, table scrolling wrappers (`overflow-hidden`, `overflow-y-auto`), or stacking contexts (`z-index`).
2. **Scroll Lock**:
   - While `isOpen` is true, sets `document.body.style.overflow = "hidden"` to prevent background scroll leaks. Restores previous overflow on close/unmount.
3. **Keyboard Navigation & Dismissal**:
   - Listens for the `Escape` key on `window`. When pressed and `!isLoading`, calls `onClose()`.
4. **Outside Click Handling**:
   - Clicking the backdrop overlay dismisses the modal, provided `!isLoading`.
5. **Double-Click & Mutex Prevention**:
   - When `isLoading` is true:
     - Cancel button is disabled (`disabled={isLoading}`).
     - Delete button is disabled (`disabled={isLoading}`).
     - Header "X" close button is disabled (`disabled={isLoading}`).
     - Backdrop click is ignored.
     - Escape key press is ignored.
6. **Destructive Feedback**:
   - Danger accent icon (`AlertTriangle` / `TriangleAlert` from `lucide-react`) rendered in a red circular/rounded badge.
   - Delete button styled with `bg-red-600 hover:bg-red-700 text-white`.
   - When `isLoading` is true, Delete button renders `Loader2` with `animate-spin` and "Deleting..." text.
7. **Semantic ARIA Attributes**:
   - `role="dialog"`
   - `aria-modal="true"`
   - `aria-labelledby="confirm-delete-title"`
   - `aria-describedby="confirm-delete-message"`

---

## 4. Visual Design & Tailwind Tokens

The component adheres strictly to the project's CRM design tokens defined in `src/index.css`:
- **Font**: "Outfit", sans-serif.
- **Backdrop Overlay**: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity`
- **Modal Card**: `relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 z-10`
- **Danger Badge**: `w-12 h-12 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0`
- **Title**: `text-lg font-bold text-slate-900`
- **Body Message**: `text-sm text-slate-600 leading-relaxed`
- **Entity Highlight**: `font-semibold text-slate-900 break-words`
- **Warning Callout Box**: `p-3 rounded-lg bg-red-50/70 border border-red-100 text-xs text-red-700 flex items-center gap-2`
- **Cancel Button**: `px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer`
- **Delete Button**: `inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-xs transition-colors disabled:opacity-50 cursor-pointer min-w-[5.5rem]`

---

## 5. Complete Source Code: `ConfirmDeleteModal.jsx`

```jsx
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

/**
 * Reusable Confirmation Modal for Destructive (Delete) Actions.
 *
 * Replaces window.confirm across the entire application with an accessible,
 * styled dialog conforming to project design tokens.
 */
function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  entityName = "",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  isLoading = false,
  confirmText = "Delete",
  cancelText = "Cancel",
}) {
  // Prevent background body scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle ESC key to dismiss modal when not loading
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-message"
    >
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 z-10 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          {/* Warning Icon Badge */}
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} className="text-red-600" />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h3
              id="confirm-delete-title"
              className="text-lg font-bold text-slate-900 leading-tight"
            >
              {title}
            </h3>

            <div id="confirm-delete-message" className="mt-2 text-sm text-slate-600 leading-relaxed">
              {entityName ? (
                <p>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-900 break-words">
                    &ldquo;{entityName}&rdquo;
                  </span>
                  ?
                </p>
              ) : null}
              <p className={entityName ? "mt-1 text-slate-500 text-xs" : ""}>
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-w-[5.5rem]"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmDeleteModal;
```

---

## 6. Migration Blueprint for All 6 Call Sites

### Call Site 1: `Front-end/src/features/Items/Item.jsx`

#### Context
Items in the Item catalog have variants and modifiers. Deletion is handled by `useDeleteItem`.

#### Before (Lines 60-70)
```jsx
<button
  type="button"
  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
  onClick={() => {
    if (window.confirm(`Delete item "${item.name}"?`)) {
      deleteItem(item.itemId);
    }
  }}
  disabled={isDeleting}
  title="Delete item"
>
  {isDeleting ? <Spinner size={16} /> : <Trash2 size={16} />}
</button>
```

#### After
```jsx
// 1. Import component
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";

// 2. Add local modal open state in Item component
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

// 3. Update delete trigger button
<button
  type="button"
  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
  onClick={() => setIsDeleteModalOpen(true)}
  disabled={isDeleting}
  title="Delete item"
>
  <Trash2 size={16} />
</button>

// 4. Render ConfirmDeleteModal before closing root div
<ConfirmDeleteModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  onConfirm={() => {
    deleteItem(item.itemId, {
      onSettled: () => setIsDeleteModalOpen(false),
    });
  }}
  title="Delete Item"
  entityName={item.name}
  message="Are you sure you want to delete this item? All associated variants, attributes, and modifier bindings will also be removed."
  isLoading={isDeleting}
/>
```

---

### Call Site 2: `Front-end/src/features/Category/CategoryListItem.jsx`

#### Context
Categories group items in the POS and catalog. Deletion is handled by `useDeleteCategory`.

#### Before (Lines 29-41)
```jsx
<button
  type="button"
  disabled={isDeleting}
  onClick={() => {
    if (window.confirm(`Delete category "${category.name}"?`)) {
      deleteCategory(category.categoryId);
    }
  }}
  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
  title="Delete category"
>
  {isDeleting ? <Spinner size={16} /> : <Trash2 size={16} />}
</button>
```

#### After
```jsx
// 1. Import component
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";

// 2. Add local state
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

// 3. Update button
<button
  type="button"
  disabled={isDeleting}
  onClick={() => setIsDeleteModalOpen(true)}
  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
  title="Delete category"
>
  <Trash2 size={16} />
</button>

// 4. Render ConfirmDeleteModal
<ConfirmDeleteModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  onConfirm={() => {
    deleteCategory(category.categoryId, {
      onSettled: () => setIsDeleteModalOpen(false),
    });
  }}
  title="Delete Category"
  entityName={category.name}
  message="Are you sure you want to delete this category? Items under this category will no longer be grouped."
  isLoading={isDeleting}
/>
```

---

### Call Site 3: `Front-end/src/features/Users/UserItem.jsx`

#### Context
System user accounts. Deletion is handled by `useDeleteUser`.

#### Before (Lines 20-32)
```jsx
<button
  type="button"
  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
  onClick={() => {
    if (window.confirm(`Delete user "${user.name}"?`)) {
      deleteUser(user.userId);
    }
  }}
  disabled={isDeleting}
  title="Delete user"
>
  {isDeleting ? <Spinner size={16} /> : <Trash2 size={16} />}
</button>
```

#### After
```jsx
// 1. Import component & useState
import { useState } from "react";
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";

// 2. Add local state
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

// 3. Update button
<button
  type="button"
  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
  onClick={() => setIsDeleteModalOpen(true)}
  disabled={isDeleting}
  title="Delete user"
>
  <Trash2 size={16} />
</button>

// 4. Render ConfirmDeleteModal
<ConfirmDeleteModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  onConfirm={() => {
    deleteUser(user.userId, {
      onSettled: () => setIsDeleteModalOpen(false),
    });
  }}
  title="Delete User"
  entityName={user.name}
  message="Are you sure you want to delete this user? They will immediately lose login access and system privileges."
  isLoading={isDeleting}
/>
```

---

### Call Site 4: `Front-end/src/features/Modifiers/ModifierGroupList.jsx`

#### Context
Lists modifier groups in a filtered container. Managed by `useDeleteModifierGroup`.

#### State Strategy (Lifting State)
Because `ModifierGroupList` renders a list of cards in a `.map()` loop, rather than introducing state into each row, store `deletingGroup` (the selected group object) in `ModifierGroupList`.

#### Before (Lines 66-79)
```jsx
<button
  type="button"
  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
  onClick={() => {
    if (window.confirm(`Delete modifier group "${group.name}"?`)) {
      deleteModifierGroup(group.groupId);
    }
  }}
  disabled={isDeleting}
  title="Delete group"
>
  <Trash2 size={15} />
</button>
```

#### After
```jsx
// 1. Import ConfirmDeleteModal
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";

// 2. Add state to ModifierGroupList
const [deletingGroup, setDeletingGroup] = useState(null);

// 3. Update button onClick in map
<button
  type="button"
  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
  onClick={() => setDeletingGroup(group)}
  disabled={isDeleting}
  title="Delete group"
>
  <Trash2 size={15} />
</button>

// 4. Render ConfirmDeleteModal once at component bottom
<ConfirmDeleteModal
  isOpen={!!deletingGroup}
  onClose={() => setDeletingGroup(null)}
  onConfirm={() => {
    if (!deletingGroup) return;
    deleteModifierGroup(deletingGroup.groupId, {
      onSettled: () => setDeletingGroup(null),
    });
  }}
  title="Delete Modifier Group"
  entityName={deletingGroup?.name}
  message="Are you sure you want to delete this modifier group? Modifiers associated with menu items will be detached."
  isLoading={isDeleting}
/>
```

---

### Call Site 5: `Front-end/src/pages/ManageCustomers.jsx`

#### Context
Customers table page. Managed by `useDeleteCustomer` (`removeCustomer`).

#### Before (Lines 245-257)
```jsx
<button
  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
  onClick={() => {
    if (window.confirm(`Delete customer "${customer.name}"?`)) {
      removeCustomer(customer.customerId);
    }
  }}
  disabled={isDeleting}
  title="Delete Customer"
>
  <Trash2 size={15} />
</button>
```

#### After
```jsx
// 1. Import ConfirmDeleteModal
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";

// 2. Add state to ManageCustomers
const [deletingCustomer, setDeletingCustomer] = useState(null);

// 3. Update table row button
<button
  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
  onClick={() => setDeletingCustomer(customer)}
  disabled={isDeleting}
  title="Delete Customer"
>
  <Trash2 size={15} />
</button>

// 4. Render ConfirmDeleteModal at page bottom
<ConfirmDeleteModal
  isOpen={!!deletingCustomer}
  onClose={() => setDeletingCustomer(null)}
  onConfirm={() => {
    if (!deletingCustomer) return;
    removeCustomer(deletingCustomer.customerId, {
      onSettled: () => setDeletingCustomer(null),
    });
  }}
  title="Delete Customer"
  entityName={deletingCustomer?.name}
  message="Are you sure you want to delete this customer record? Loyalty points and order history linkages will be removed."
  isLoading={isDeleting}
/>
```

---

### Call Site 6: `Front-end/src/pages/ManagePromotions.jsx`

#### Context
Promotions table page. Managed by `useDeletePromotion` (`removePromotion`).

#### Before (Lines 601-613)
```jsx
<button
  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
  onClick={() => {
    if (window.confirm(`Delete promotion "${promo.name}"?`)) {
      removePromotion(promo.promotionId);
    }
  }}
  disabled={isDeleting}
  title="Delete Promotion"
>
  <Trash2 size={15} />
</button>
```

#### After
```jsx
// 1. Import ConfirmDeleteModal
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";

// 2. Add state to ManagePromotions
const [deletingPromo, setDeletingPromo] = useState(null);

// 3. Update table row button
<button
  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
  onClick={() => setDeletingPromo(promo)}
  disabled={isDeleting}
  title="Delete Promotion"
>
  <Trash2 size={15} />
</button>

// 4. Render ConfirmDeleteModal at page bottom
<ConfirmDeleteModal
  isOpen={!!deletingPromo}
  onClose={() => setDeletingPromo(null)}
  onConfirm={() => {
    if (!deletingPromo) return;
    removePromotion(deletingPromo.promotionId, {
      onSettled: () => setDeletingPromo(null),
    });
  }}
  title="Delete Promotion"
  entityName={deletingPromo?.name}
  message="Are you sure you want to delete this promotion? Active discounts and coupons will no longer apply to customer orders."
  isLoading={isDeleting}
/>
```

---

## 7. Verification & Testing Matrix

| Test Case | Scenario | Expected Behavior |
|---|---|---|
| **TC-MODAL-01** | `isOpen={false}` | Nothing renders in the DOM. |
| **TC-MODAL-02** | `isOpen={true}` | Portal renders into `document.body` with backdrop blur and centered dialog. |
| **TC-MODAL-03** | Entity Display | If `entityName="Espresso"`, bold text `"Espresso"` appears clearly in confirmation message. |
| **TC-MODAL-04** | Cancel Dismissal | Clicking "Cancel" or "X" calls `onClose()`. |
| **TC-MODAL-05** | Backdrop Dismissal | Clicking outside the modal card triggers `onClose()`. |
| **TC-MODAL-06** | Escape Key Dismissal | Pressing `Escape` triggers `onClose()`. |
| **TC-MODAL-07** | Deletion Trigger | Clicking "Delete" invokes `onConfirm()`. |
| **TC-MODAL-08** | Loading State (`isLoading={true}`) | Spinner (`Loader2` + `animate-spin`) appears in delete button; Cancel, Delete, and X buttons disabled; Backdrop click and Escape key disabled. |
| **TC-MODAL-09** | Zero `window.confirm` | Grep verification confirms zero occurrences of `window.confirm` across the entire codebase. |
| **TC-MODAL-10** | Lint & Build | `npm run lint` and `npm run build` pass with zero errors. |
