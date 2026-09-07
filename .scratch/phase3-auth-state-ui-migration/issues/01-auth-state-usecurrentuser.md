# 01 — Auth State: useCurrentUser Hook + Sync Fix

Status: resolved
Type: task

## Summary

Fix the auth state split between `localStorage` and React Query cache. Create a `useCurrentUser` hook that seeds the cache with `initialData` from `localStorage` on app boot.

## Acceptance Criteria

- [x] `useCurrentUser` hook returns `{ user, isAdmin }` correctly on first render (before any navigation) and after F5 reload
- [x] `isAdmin` is `true` when `localStorage.role === "ROLE_ADMIN"`, `false` otherwise
- [x] `useLogin` stores `{ token, role }` in both `localStorage` and React Query cache with key `["user"]`
- [x] `useLogout` uses `queryClient.clear()` (consistent with the 401 interceptor in axiosConfig)
- [x] Hardcoded default credentials in `LoginForm` are removed (security fix)
- [x] `Menubar` uses `useCurrentUser` instead of raw `useQuery({ queryFn: () => null })`
- [x] Admin "Manage" dropdown remains visible after F5 for Admin users

## Key Decision

- No new React Context. React Query cache is the in-memory layer; `localStorage` is the persistence layer. `initialData` is the bridge.
- `ProtectedRoute` and `AdminRoute` continue to read `localStorage` directly — they are routing guards, not UI components, and must be synchronous.

## Modules Affected

- `src/hooks/useCurrentUser.js` — NEW
- `src/features/Auth/useLogin.js` — MODIFY (ensure setQueryData includes role)
- `src/features/Auth/useLogout.js` — MODIFY (use `queryClient.clear()`)
- `src/features/Auth/LoginForm.jsx` — MODIFY (remove hardcoded credentials)
- `src/ui/Menubar.jsx` — MODIFY (use `useCurrentUser`)

## Comments

- Implemented via commit `0bd6123`.
- Verified with tests 3, 4, 5, 13 in `Front-end/test-verification.mjs`. All passed.
