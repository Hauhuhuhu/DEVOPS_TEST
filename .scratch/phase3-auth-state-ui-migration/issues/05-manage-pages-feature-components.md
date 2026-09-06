# 05 — Pages: Manage Pages + Feature Components Migration

Status: ready-for-agent
Type: task
Blocked by: 03

## Summary

Migrate all Admin management pages and their feature components from Bootstrap to Tailwind. Preserve 100% of business logic (form state, mutations, file uploads, variants, modifier groups). Apply consistent two-column layout pattern.

## Acceptance Criteria

### Layout Pattern (applies to ManageItems, ManageCategory, ManageModifiers, ManageUsers)
- [ ] Two-column layout: left panel `w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5`, right panel `flex-1 overflow-auto`
- [ ] Page wrapper: `flex gap-6 p-6 h-[calc(100vh-4rem)] bg-slate-50`
- [ ] No `item-container`, `left-column`, `right-column` CSS classes remaining

### ManageCustomers
- [ ] Form panel converted to Tailwind (labels, inputs, buttons)
- [ ] Search bar: input with search icon, clear button on right
- [ ] Table: sticky header, hover row highlight, action buttons with icons
- [ ] Customer count badge: `bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-medium`
- [ ] Edit/Delete buttons: icon-only with tooltip, Tailwind outline style

### ManagePromotions (24KB — largest file)
- [ ] All Bootstrap utility classes replaced with Tailwind equivalents
- [ ] ALL business logic preserved: promotion creation, editing, activation toggle, discount logic
- [ ] Form layout, table layout, modal/dialog — all converted

### Feature Components
- [ ] `features/Items/ItemForm.jsx`: Bootstrap classes → Tailwind, image upload section, variant accordion, modifier group chips — all preserved functionally
- [ ] `features/Items/ItemList.jsx` + `Item.jsx`: search input, item cards → Tailwind
- [ ] `features/Users/UserForm.jsx` + `UsersList.jsx` + `UserItem.jsx` → Tailwind
- [ ] `features/Category/CategoryForm.jsx` + `CategoryList.jsx` → Tailwind (check existing files)
- [ ] `features/Modifiers/ModifierGroupForm.jsx` + `ModifierGroupList.jsx` → Tailwind
- [ ] `features/Dashboard/*` → Tailwind

### Shared UI Patterns
- [ ] Form inputs: `w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`
- [ ] Labels: `block text-sm font-medium text-slate-700 mb-1`
- [ ] Error messages: `text-xs text-red-600 mt-1`
- [ ] Primary button: `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`
- [ ] Danger button: `bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm`
- [ ] Ghost button: `border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm`

## Modules Affected

- `src/pages/ManageItems.jsx` — MODIFY
- `src/pages/ManageCategory.jsx` — MODIFY
- `src/pages/ManageModifiers.jsx` — MODIFY
- `src/pages/ManageUsers.jsx` — MODIFY
- `src/pages/ManageCustomers.jsx` — MODIFY
- `src/pages/ManagePromotions.jsx` — MODIFY
- `src/features/Items/ItemForm.jsx` — MODIFY
- `src/features/Items/ItemList.jsx` — MODIFY
- `src/features/Items/Item.jsx` — MODIFY
- `src/features/Users/UserForm.jsx` — MODIFY
- `src/features/Users/UsersList.jsx` — MODIFY
- `src/features/Users/UserItem.jsx` — MODIFY
- `src/features/Category/*` — MODIFY
- `src/features/Modifiers/*` — MODIFY
- `src/features/Dashboard/*` — MODIFY
