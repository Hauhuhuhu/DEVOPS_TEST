# Handoff Report: Investigation of window.confirm Call Sites (Milestone 1 — R3)

## 1. Observation

A direct search across `Front-end/src` using `grep_search` confirmed exactly **6 call sites** of `window.confirm`:

1. **`Front-end/src/features/Items/Item.jsx` (Line 62):**
   ```jsx
   onClick={() => {
     if (window.confirm(`Delete item "${item.name}"?`)) {
       deleteItem(item.itemId);
     }
   }}
   ```
   - Component hook: `const { isDeleting, deleteItem } = useDeleteItem();` (`useDeleteItem.js` line 9: `isPending: isDeleting`).
   - Prop received: `item` (`item.itemId`, `item.name`).

2. **`Front-end/src/features/Category/CategoryListItem.jsx` (Line 33):**
   ```jsx
   onClick={() => {
     if (window.confirm(`Delete category "${category.name}"?`)) {
       deleteCategory(category.categoryId);
     }
   }}
   ```
   - Component hook: `const { isDeleting, deleteCategory } = useDeleteCategory();` (`useDeleteCategory.js` line 8: `isPending: isDeleting`).
   - Prop received: `category` (`category.categoryId`, `category.name`).

3. **`Front-end/src/features/Users/UserItem.jsx` (Line 24):**
   ```jsx
   onClick={() => {
     if (window.confirm(`Delete user "${user.name}"?`)) {
       deleteUser(user.userId);
     }
   }}
   ```
   - Component hook: `const { isDeleting, deleteUser } = useDeleteUser();` (`useDeleteUser.js` line 8: `isPending: isDeleting`).
   - Prop received: `user` (`user.userId`, `user.name`).

4. **`Front-end/src/pages/ManageCustomers.jsx` (Line 248):**
   ```jsx
   onClick={() => {
     if (window.confirm(`Delete customer "${customer.name}"?`)) {
       removeCustomer(customer.customerId);
     }
   }}
   ```
   - Component hook: `const { isDeleting, removeCustomer } = useDeleteCustomer();` (`useDeleteCustomer.js` line 8: `{ mutate: removeCustomer, isPending: isDeleting }`).
   - Rendered in table iteration: `customers.map((customer) => ...)`.
   - Entity properties: `customer.customerId`, `customer.name`.

5. **`Front-end/src/pages/ManagePromotions.jsx` (Line 604):**
   ```jsx
   onClick={() => {
     if (window.confirm(`Delete promotion "${promo.name}"?`)) {
       removePromotion(promo.promotionId);
     }
   }}
   ```
   - Component hook: `const { isDeleting, removePromotion } = useDeletePromotion();` (`useDeletePromotion.js` line 8: `{ mutate: removePromotion, isPending: isDeleting }`).
   - Rendered in table iteration: `filteredPromotions.map((promo) => ...)`.
   - Entity properties: `promo.promotionId`, `promo.name`.

6. **`Front-end/src/features/Modifiers/ModifierGroupList.jsx` (Line 70):**
   ```jsx
   onClick={() => {
     if (window.confirm(`Delete modifier group "${group.name}"?`)) {
       deleteModifierGroup(group.groupId);
     }
   }}
   ```
   - Component hook: `const { isDeleting, deleteModifierGroup } = useDeleteModifierGroup();` (`useDeleteModifierGroup.js` line 8: `{ mutate: deleteModifierGroup, isPending: isDeleting }`).
   - Rendered in list iteration: `filteredGroups?.map((group) => ...)`.
   - Entity properties: `group.groupId`, `group.name`.

7. **Search for bare `confirm(...)` calls**:
   Grep search for `confirm(` yielded only the exact same 6 lines. Zero bare calls or third-party wrappers exist.

8. **Existing Modal Architecture**:
   - `Front-end/src/ui/Modal.jsx` provides a compound component with `createPortal` and `useOutsideClick`.
   - `Front-end/src/ui/Spinner.jsx` uses `Loader2` from `lucide-react` with `size` and `className` props.
   - `Front-end/src/features/Inventory/StockOperationModal.jsx` implements a standalone modal pattern with backdrop overlay.

---

## 2. Logic Chain

1. **State Isolation vs. Performance**:
   - In leaf components (`Item.jsx`, `CategoryListItem.jsx`, `UserItem.jsx`), each instance manages its own visual state. Adding a boolean `const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);` within each component is clean, self-contained, and preserves the component API.
   - In container/list components (`ManageCustomers.jsx`, `ManagePromotions.jsx`, `ModifierGroupList.jsx`), items are mapped inside a table/list. Rendering modal instances inside each row or card would duplicate DOM portals and create excessive state overhead. Therefore, lifting the modal to the parent container using a single selected entity state (`customerToDelete`, `promoToDelete`, `groupToDelete`) is the superior, idiomatic pattern.

2. **Mutation Hook Consistency**:
   - In all 6 cases, the mutation hook (`useDeleteItem`, `useDeleteCategory`, `useDeleteUser`, `useDeleteCustomer`, `useDeletePromotion`, `useDeleteModifierGroup`) is built on TanStack Query (`useMutation`).
   - All 6 hooks expose `isDeleting` (aliased from `isPending`) and handle query invalidation and toast feedback on `onSuccess` and `onError`.
   - TanStack Query's `mutate(id, { onSettled })` callback allows the calling component to close the modal or reset selection upon mutation settlement without interfering with the query cache.

3. **Portal Requirement**:
   - Container elements like `ModifierGroupList` (`overflow-hidden` with nested `overflow-y-auto`) and tables in `ManageCustomers` and `ManagePromotions` will clip or misplace modals rendered directly within the DOM hierarchy.
   - Hence, `ConfirmDeleteModal` must use `createPortal(..., document.body)` to escape local CSS stacking contexts.

4. **Double-Submission Safeguards**:
   - In raw `window.confirm`, browser execution blocks synchronously. With a custom React modal, asynchronous state must be guarded.
   - Setting `isLoading={isDeleting}` on `ConfirmDeleteModal` disables both the "Cancel" and "Delete" buttons, prevents outside click / escape dismissal during active mutations, and renders a loading spinner on the confirm button.

---

## 3. Caveats

- **Hook Mutation Function Naming Differences**:
  - `useDeleteItem` exports `deleteItem`
  - `useDeleteCategory` exports `deleteCategory`
  - `useDeleteUser` exports `deleteUser`
  - `useDeleteCustomer` exports `removeCustomer`
  - `useDeletePromotion` exports `removePromotion`
  - `useDeleteModifierGroup` exports `deleteModifierGroup`
  Implementers must take care not to confuse `deleteCustomer` vs `removeCustomer` and `deletePromotion` vs `removePromotion`.
- **Form Edit Coupling**:
  - In `ManageCustomers.jsx` and `ManagePromotions.jsx`, editing is active via `startEdit(...)`. Deletion states (`customerToDelete`, `promoToDelete`) must remain independent of `editingCustomer` / `editingPromo` so that initiating or canceling a delete modal does not clear an in-progress edit form.

---

## 4. Conclusion

1. **Exact Scope**: Milestone 1 (R3) requires creating `Front-end/src/ui/ConfirmDeleteModal.jsx` and updating exactly 6 files (`Item.jsx`, `CategoryListItem.jsx`, `UserItem.jsx`, `ManageCustomers.jsx`, `ManagePromotions.jsx`, and `ModifierGroupList.jsx`).
2. **Standard Component Contract**: `ConfirmDeleteModal` should accept `isOpen`, `onClose`, `onConfirm`, `title`, `entityName`, `message`, and `isLoading`, matching the interface specified in `PROJECT.md`.
3. **Execution Ready**: Complete component implementation code and exact call site modifications have been compiled and documented in `callsites_analysis.md`.

---

## 5. Verification Method

To independently verify the findings:

1. **Verify All Call Sites**:
   Run grep across `Front-end`:
   ```powershell
   git grep -n "window.confirm" Front-end/
   git grep -n "confirm(" Front-end/
   ```
   Expected: Exactly lines 62 (`Item.jsx`), 33 (`CategoryListItem.jsx`), 24 (`UserItem.jsx`), 248 (`ManageCustomers.jsx`), 604 (`ManagePromotions.jsx`), 70 (`ModifierGroupList.jsx`).

2. **Post-Implementation Verification**:
   After applying the migration:
   ```powershell
   # 1. Zero occurrences check
   git grep -n "window.confirm" Front-end/
   # Must return empty

   # 2. Frontend Lint Check
   cd Front-end; npm run lint

   # 3. Frontend Build Check
   npm run build
   ```
