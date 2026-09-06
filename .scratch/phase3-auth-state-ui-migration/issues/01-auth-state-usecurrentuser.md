# 01 — Auth State: useCurrentUser Hook + Sync Fix

Status: ready-for-agent
Type: task

## Summary

Fix the auth state split between `localStorage` and React Query cache. Create a `useCurrentUser` hook that seeds the cache with `initialData` from `localStorage` on app boot.

## Acceptance Criteria

- [ ] `useCurrentUser` hook returns `{ user, isAdmin }` correctly on first render (before any navigation) and after F5 reload
- [ ] `isAdmin` is `true` when `localStorage.role === "ROLE_ADMIN"`, `false` otherwise
- [ ] `useLogin` stores `{ token, role }` in both `localStorage` and React Query cache with key `["user"]`
- [ ] `useLogout` uses `queryClient.clear()` (consistent with the 401 interceptor in axiosConfig)
- [ ] Hardcoded default credentials in `LoginForm` are removed (security fix)
- [ ] `Menubar` uses `useCurrentUser` instead of raw `useQuery({ queryFn: () => null })`
- [ ] Admin "Manage" dropdown remains visible after F5 for Admin users

## Key Decision

- No new React Context. React Query cache is the in-memory layer; `localStorage` is the persistence layer. `initialData` is the bridge.
- `ProtectedRoute` and `AdminRoute` continue to read `localStorage` directly — they are routing guards, not UI components, and must be synchronous.

## Modules Affected

- `src/hooks/useCurrentUser.js` — NEW
- `src/features/Auth/useLogin.js` — MODIFY (ensure setQueryData includes role)
- `src/features/Auth/useLogout.js` — MODIFY (use `queryClient.clear()`)
- `src/features/Auth/LoginForm.jsx` — MODIFY (remove hardcoded credentials)
- `src/ui/Menubar.jsx` — MODIFY (use `useCurrentUser`)
