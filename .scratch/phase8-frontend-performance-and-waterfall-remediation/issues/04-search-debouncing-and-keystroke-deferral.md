# 04: Search Debouncing and Keystroke Deferral across Tables

**What to build:**
Store managers and auditors can type in search boxes within Customer Management, Activity Logs, and Order History with an immediate, responsive 60fps input feel without flooding the Spring Boot server with sequential API requests per keystroke. Table contents remain visible with subtle loading indicators rather than resetting to full-page spinners during active typing.

**Blocked by:** None (can start immediately)

**Status:** closed
<!-- closed: 2026-09-12 by agent -->

- [x] A reusable `useDebounce` hook provides consistent 300ms query delay across search interfaces.
- [x] `ManageCustomers` buffers user input with debouncing and React 19 `useDeferredValue` before triggering customer queries.
- [x] `useCustomers` enables `placeholderData: keepPreviousData` to prevent table layout flashing during query refreshes.
- [x] `ActivityLogs` debounces user email filtering, avoiding raw network calls on individual keypresses.
- [x] `OrderHistory` replaces duplicated debounce state and timer effects with declarative deferred values.
