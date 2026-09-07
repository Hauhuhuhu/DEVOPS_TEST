# Call Sites Analysis: Frontend window.confirm Replacement (Milestone 1 — R3)

## Executive Summary

Across the entire `Front-end` codebase, there are exactly **6 occurrences** of `window.confirm` (and zero occurrences of bare `confirm(...)`). All 6 instances are triggered during entity deletion in administrative and catalog management screens.

The call sites naturally divide into two architectural mounting patterns:
1. **Per-Item Leaf Components (3 sites):** `Item.jsx`, `CategoryListItem.jsx`, `UserItem.jsx`. Each component instance represents an individual entity. A simple local boolean state (`isDeleteModalOpen`) controls modal visibility per item.
2. **Container / List / Page Components (3 sites):** `ManageCustomers.jsx`, `ManagePromotions.jsx`, `ModifierGroupList.jsx`. These components render multiple items in a table or list loop. To avoid instantiating multiple modal portals and duplicate state, a single container-level state storing the selected entity (`customerToDelete`, `promoToDelete`, `groupToDelete`) is used to control modal visibility and populate the entity name.

---

## 1. Summary of Call Sites

| # | File Path | Line | Entity Deleted | Current Trigger | Hook / Mutation | Mutation Mutate Prop | Loading State | State Pattern |
|---|-----------|------|----------------|-----------------|-----------------|----------------------|---------------|---------------|
| 1 | `Front-end/src/features/Items/Item.jsx` | 62 | Item | `window.confirm(\`Delete item "${item.name}"?\`)` | `useDeleteItem` | `deleteItem(item.itemId)` | `isDeleting` (`isPending`) | Local Boolean (`isDeleteModalOpen`) |
| 2 | `Front-end/src/features/Category/CategoryListItem.jsx` | 33 | Category | `window.confirm(\`Delete category "${category.name}"?\`)` | `useDeleteCategory` | `deleteCategory(category.categoryId)` | `isDeleting` (`isPending`) | Local Boolean (`isDeleteModalOpen`) |
| 3 | `Front-end/src/features/Users/UserItem.jsx` | 24 | User | `window.confirm(\`Delete user "${user.name}"?\`)` | `useDeleteUser` | `deleteUser(user.userId)` | `isDeleting` (`isPending`) | Local Boolean (`isDeleteModalOpen`) |
| 4 | `Front-end/src/pages/ManageCustomers.jsx` | 248 | Customer | `window.confirm(\`Delete customer "${customer.name}"?\`)` | `useDeleteCustomer` | `removeCustomer(customer.customerId)` | `isDeleting` (`isPending`) | Page Selected Entity (`customerToDelete`) |
| 5 | `Front-end/src/pages/ManagePromotions.jsx` | 604 | Promotion | `window.confirm(\`Delete promotion "${promo.name}"?\`)` | `useDeletePromotion` | `removePromotion(promo.promotionId)` | `isDeleting` (`isPending`) | Page Selected Entity (`promoToDelete`) |
| 6 | `Front-end/src/features/Modifiers/ModifierGroupList.jsx` | 70 | Modifier Group | `window.confirm(\`Delete modifier group "${group.name}"?\`)` | `useDeleteModifierGroup` | `deleteModifierGroup(group.groupId)` | `isDeleting` (`isPending`) | List Selected Entity (`groupToDelete`) |

---

## 2. In-Depth Call Site Inspections

### Call Site 1: `Front-end/src/features/Items/Item.jsx`

#### 1. Context & Location
- **File**: `Front-end/src/features/Items/Item.jsx`
- **Line Number**: Line 62
- **Current Code**:
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

#### 2. Deletion State Handling
- Component uses `const { isDeleting, deleteItem } = useDeleteItem();` defined in `Front-end/src/features/Items/useDeleteItem.js`.
- In `useDeleteItem.js`, TanStack Query's `useMutation` is used:
  ```javascript
  const { isPending: isDeleting, mutate: deleteItem } = useMutation({
    mutationFn: deleteItemApi,
    onSuccess: async () => {
      toast.success("Item successfully deleted");
      await queryClient.invalidateQueries({ queryKey: ["items"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message),
  });
  ```
- `isDeleting` maps directly to `isPending`.

#### 3. Modal Mounting & State Strategy
- **Pattern**: Item-level state.
- Component already imports `useState`. Add a local state variable:
  ```jsx
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  ```
- The delete button's `onClick` simply opens the modal:
  ```jsx
  onClick={() => setIsDeleteModalOpen(true)}
  ```
- Mounting: Mount `<ConfirmDeleteModal />` at the bottom of `Item.jsx`, adjacent to `StockOperationModal`.
- Import:
  ```jsx
  import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";
  ```

#### 4. Entity Name & Props
- **Entity ID**: `item.itemId`
- **Entity Name**: `item.name`
- Props mapping:
  ```jsx
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
    message={`Are you sure you want to delete item "${item.name}"? This action cannot be undone.`}
    isLoading={isDeleting}
  />
  ```

#### 5. Prevention of Double-Submissions & Accidental Triggers
- Clicking the card trash icon only opens the modal; no mutation is initiated.
- Inside `ConfirmDeleteModal`, the confirm button is disabled and displays a spinner when `isLoading={isDeleting}` is true.
- Modal backdrop click, Escape key, and Cancel button are disabled during active deletion.
- Invalidation and toasts are automatically handled by `useDeleteItem`. On mutation settlement (`onSettled`), `isDeleteModalOpen` resets to `false`.

---

### Call Site 2: `Front-end/src/features/Category/CategoryListItem.jsx`

#### 1. Context & Location
- **File**: `Front-end/src/features/Category/CategoryListItem.jsx`
- **Line Number**: Line 33
- **Current Code**:
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

#### 2. Deletion State Handling
- Component uses `const { isDeleting, deleteCategory } = useDeleteCategory();` from `Front-end/src/features/Category/useDeleteCategory.js`.
- In `useDeleteCategory.js`:
  ```javascript
  const { isPending: isDeleting, mutate: deleteCategory } = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      toast.success("Category successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message),
  });
  ```
- Deletion is tracked via `isDeleting` (`isPending`).

#### 3. Modal Mounting & State Strategy
- **Pattern**: Item-level state.
- Currently `CategoryListItem.jsx` does not import `useState`. Must add `import { useState } from "react";`.
- Add local state:
  ```jsx
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  ```
- The delete button's `onClick`:
  ```jsx
  onClick={() => setIsDeleteModalOpen(true)}
  ```
- Mounting: Mount inside the root container `div` of `CategoryListItem`.
- Import:
  ```jsx
  import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";
  ```

#### 4. Entity Name & Props
- **Entity ID**: `category.categoryId`
- **Entity Name**: `category.name`
- Props mapping:
  ```jsx
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
    message={`Are you sure you want to delete category "${category.name}"? This action cannot be undone.`}
    isLoading={isDeleting}
  />
  ```

#### 5. Prevention of Double-Submissions & Accidental Triggers
- Button disabled if `isDeleting`.
- Confirm button in modal disabled while `isLoading={isDeleting}`.
- Modal closes on `onSettled`.

---

### Call Site 3: `Front-end/src/features/Users/UserItem.jsx`

#### 1. Context & Location
- **File**: `Front-end/src/features/Users/UserItem.jsx`
- **Line Number**: Line 24
- **Current Code**:
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

#### 2. Deletion State Handling
- Component uses `const { isDeleting, deleteUser } = useDeleteUser();` from `Front-end/src/features/Users/useDeleteUser.js`.
- In `useDeleteUser.js`:
  ```javascript
  const { isPending: isDeleting, mutate: deleteUser } = useMutation({
    mutationFn: deleteCategoryApi, // (calls deleteUser in UserService)
    onSuccess: () => {
      toast.success("User successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => toast.error(err.message),
  });
  ```
- Deletion state is `isDeleting` (`isPending`).

#### 3. Modal Mounting & State Strategy
- **Pattern**: Item-level state.
- Currently `UserItem.jsx` does not import `useState`. Must add `import { useState } from "react";`.
- Add local state:
  ```jsx
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  ```
- Button `onClick`:
  ```jsx
  onClick={() => setIsDeleteModalOpen(true)}
  ```
- Mounting: Mount inside root `div` of `UserItem.jsx`.
- Import:
  ```jsx
  import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";
  ```

#### 4. Entity Name & Props
- **Entity ID**: `user.userId`
- **Entity Name**: `user.name`
- Props mapping:
  ```jsx
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
    message={`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`}
    isLoading={isDeleting}
  />
  ```

#### 5. Prevention of Double-Submissions & Accidental Triggers
- Direct click invokes modal only.
- Modal confirm button locks down while mutation is in-flight.
- Modal closes on mutation settlement.

---

### Call Site 4: `Front-end/src/pages/ManageCustomers.jsx`

#### 1. Context & Location
- **File**: `Front-end/src/pages/ManageCustomers.jsx`
- **Line Number**: Line 248
- **Current Code**:
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

#### 2. Deletion State Handling
- Component uses `const { isDeleting, removeCustomer } = useDeleteCustomer();` from `Front-end/src/features/Customers/useDeleteCustomer.js`.
- Notice the mutation execution function is named `removeCustomer` (destructured as `{ mutate: removeCustomer, isPending: isDeleting }`).
- In `useDeleteCustomer.js`:
  ```javascript
  const { mutate: removeCustomer, isPending: isDeleting } = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: async () => {
      toast.success("Customer successfully deleted");
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to delete customer");
    },
  });
  ```
- `isDeleting` is available at the page level.

#### 3. Modal Mounting & State Strategy
- **Pattern**: Container / Page-level selected entity state.
- Rather than rendering a separate modal in every table row (`customers.map(...)`), maintain a single state in `ManageCustomers`:
  ```jsx
  const [customerToDelete, setCustomerToDelete] = useState(null);
  ```
- Table row action button:
  ```jsx
  onClick={() => setCustomerToDelete(customer)}
  ```
- Mounting: Mount `<ConfirmDeleteModal />` at the very bottom of the page container (before the closing `</div>` of `ManageCustomers`).
- Import:
  ```jsx
  import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
  ```

#### 4. Entity Name & Props
- **Entity ID**: `customerToDelete?.customerId`
- **Entity Name**: `customerToDelete?.name`
- Props mapping:
  ```jsx
  <ConfirmDeleteModal
    isOpen={Boolean(customerToDelete)}
    onClose={() => setCustomerToDelete(null)}
    onConfirm={() => {
      if (customerToDelete) {
        removeCustomer(customerToDelete.customerId, {
          onSettled: () => setCustomerToDelete(null),
        });
      }
    }}
    title="Delete Customer"
    entityName={customerToDelete?.name || ""}
    message={`Are you sure you want to delete customer "${customerToDelete?.name}"? This action cannot be undone.`}
    isLoading={isDeleting}
  />
  ```

#### 5. Prevention of Double-Submissions & Accidental Triggers
- Table delete button only sets the target customer in state (`setCustomerToDelete(customer)`).
- Modal requires user interaction on the modal's "Delete" button.
- Modal confirm button is disabled and shows spinner while `isDeleting` is true.
- `onSettled` guarantees `customerToDelete` is reset to `null` whether the API call succeeds or fails.
- Deleting an entity does not interfere with the separate `editingCustomer` form state.

---

### Call Site 5: `Front-end/src/pages/ManagePromotions.jsx`

#### 1. Context & Location
- **File**: `Front-end/src/pages/ManagePromotions.jsx`
- **Line Number**: Line 604
- **Current Code**:
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

#### 2. Deletion State Handling
- Component uses `const { isDeleting, removePromotion } = useDeletePromotion();` from `Front-end/src/features/Promotions/useDeletePromotion.js`.
- Notice the mutation function is named `removePromotion`.
- In `useDeletePromotion.js`:
  ```javascript
  const { mutate: removePromotion, isPending: isDeleting } = useMutation({
    mutationFn: deletePromotion,
    onSuccess: async () => {
      toast.success("Promotion successfully deleted");
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await queryClient.invalidateQueries({ queryKey: ["active-promotions"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to delete promotion");
    },
  });
  ```
- Deletion state is `isDeleting`.

#### 3. Modal Mounting & State Strategy
- **Pattern**: Container / Page-level selected entity state.
- In `ManagePromotions`, declare:
  ```jsx
  const [promoToDelete, setPromoToDelete] = useState(null);
  ```
- Table row action button:
  ```jsx
  onClick={() => setPromoToDelete(promo)}
  ```
- Mounting: Mount `<ConfirmDeleteModal />` at the bottom of `ManagePromotions` before the closing `</div>`.
- Import:
  ```jsx
  import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
  ```

#### 4. Entity Name & Props
- **Entity ID**: `promoToDelete?.promotionId`
- **Entity Name**: `promoToDelete?.name`
- Props mapping:
  ```jsx
  <ConfirmDeleteModal
    isOpen={Boolean(promoToDelete)}
    onClose={() => setPromoToDelete(null)}
    onConfirm={() => {
      if (promoToDelete) {
        removePromotion(promoToDelete.promotionId, {
          onSettled: () => setPromoToDelete(null),
        });
      }
    }}
    title="Delete Promotion"
    entityName={promoToDelete?.name || ""}
    message={`Are you sure you want to delete promotion "${promoToDelete?.name}"? This action cannot be undone.`}
    isLoading={isDeleting}
  />
  ```

#### 5. Prevention of Double-Submissions & Accidental Triggers
- Table row action does not mutate immediately.
- Modal confirm button locks when `isDeleting` is true.
- `onSettled` ensures state is cleanly cleared upon completion.
- Form editing state (`editingPromo`) is completely uncoupled and unaffected.

---

### Call Site 6: `Front-end/src/features/Modifiers/ModifierGroupList.jsx`

#### 1. Context & Location
- **File**: `Front-end/src/features/Modifiers/ModifierGroupList.jsx`
- **Line Number**: Line 70
- **Current Code**:
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

#### 2. Deletion State Handling
- Component uses `const { isDeleting, deleteModifierGroup } = useDeleteModifierGroup();` from `Front-end/src/features/Modifiers/useDeleteModifierGroup.js`.
- In `useDeleteModifierGroup.js`:
  ```javascript
  const { mutate: deleteModifierGroup, isPending: isDeleting } = useMutation({
    mutationFn: deleteModifierGroupApi,
    onSuccess: () => {
      toast.success("Modifier group successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["modifierGroups"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
    },
  });
  ```
- Deletion state is `isDeleting`.

#### 3. Modal Mounting & State Strategy
- **Pattern**: Container / List-level selected entity state.
- In `ModifierGroupList`, declare:
  ```jsx
  const [groupToDelete, setGroupToDelete] = useState(null);
  ```
- Delete button in card:
  ```jsx
  onClick={() => setGroupToDelete(group)}
  ```
- Mounting: Mount at the bottom of `ModifierGroupList.jsx` before the closing `</div>`.
- Note on overflow: Since `ModifierGroupList` has `overflow-hidden` on parent and `overflow-y-auto` on the list container, `ConfirmDeleteModal` using React Portal (`createPortal(..., document.body)`) is essential so the modal is not clipped by the scroll container.
- Import:
  ```jsx
  import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";
  ```

#### 4. Entity Name & Props
- **Entity ID**: `groupToDelete?.groupId`
- **Entity Name**: `groupToDelete?.name`
- Props mapping:
  ```jsx
  <ConfirmDeleteModal
    isOpen={Boolean(groupToDelete)}
    onClose={() => setGroupToDelete(null)}
    onConfirm={() => {
      if (groupToDelete) {
        deleteModifierGroup(groupToDelete.groupId, {
          onSettled: () => setGroupToDelete(null),
        });
      }
    }}
    title="Delete Modifier Group"
    entityName={groupToDelete?.name || ""}
    message={`Are you sure you want to delete modifier group "${groupToDelete?.name}"? This action cannot be undone.`}
    isLoading={isDeleting}
  />
  ```

#### 5. Prevention of Double-Submissions & Accidental Triggers
- Card button opens modal.
- `ConfirmDeleteModal` locks confirm button during `isLoading={isDeleting}`.
- `onSettled` closes modal and resets `groupToDelete`.

---

## 3. Recommended Design for `ConfirmDeleteModal.jsx`

To ensure seamless integration across all 6 call sites, `Front-end/src/ui/ConfirmDeleteModal.jsx` should adhere to the following interface:

```jsx
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import Spinner from "./Spinner";

function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  entityName,
  message,
  isLoading = false,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6 z-10 w-full max-w-md mx-auto transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              id="confirm-delete-title"
              className="text-base font-bold text-slate-900"
            >
              {title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {message ? (
                message
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-900">
                    "{entityName}"
                  </span>
                  ? This action cannot be undone.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[5rem] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Spinner size={16} className="text-white" />
                <span>Deleting...</span>
              </>
            ) : (
              "Delete"
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

### Advantages of this Implementation:
1. **React Portal (`createPortal`)**: Renders into `document.body`, guaranteeing that CSS overflow (`overflow-y-auto`, `overflow-hidden`) in parent containers (e.g., `ModifierGroupList`, `ManageCustomers`, `ManagePromotions`) will never clip or displace the modal.
2. **Accessible Keyboard & Backdrop Controls**: Handles the `Escape` key and backdrop clicking gracefully while completely locking them during active deletions (`isLoading === true`).
3. **Consistent CRM Visual Design**: Matches Tailwind CSS color palette (Slate-900, Slate-600, Red-600, Red-100, border-slate-200) and Lucide icons (`AlertTriangle`, `X`, `Loader2`).
4. **Flexible Messaging**: Supports either a pre-formatted message or an automatic fallback formatting `Are you sure you want to delete "{entityName}"? This action cannot be undone.`

---

## 4. Verification Checkpoints

When the implementation agent executes Milestone 1:
1. **Zero Occurrences**: `grep -rn "window.confirm" Front-end/` and `grep -rn "confirm(" Front-end/` must return **zero** results.
2. **Build Integrity**: `npm run build` in `Front-end/` must pass without syntax, bundling, or module resolution errors.
3. **Lint Integrity**: `npm run lint` in `Front-end/` must pass with zero unused variable warnings or hook violations.
4. **UX Validation**:
   - Deleting an Item, Category, User, Customer, Promotion, or Modifier Group displays the styled modal with the exact entity name highlighted.
   - Hitting "Cancel" or "X" dismisses without side effects.
   - Hitting "Delete" shows the spinner and disables buttons until the mutation completes.
