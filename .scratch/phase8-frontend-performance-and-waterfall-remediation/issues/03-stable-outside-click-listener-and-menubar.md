# 03: Stable Outside-Click Listener and Menubar Optimization

**What to build:**
Store cashiers and administrators can open and close the Profile and Management navigation dropdowns smoothly without the browser continually detaching and reattaching global click listeners to the document on every render cycle. Navigation configuration lists are preserved statically at the module level.

**Blocked by:** None (can start immediately)

**Status:** closed
<!-- closed: 2026-09-12 by agent -->

- [x] `useOutsideClick` stores the click handler callback inside a mutable `useRef`, decoupling listener attachment from handler identity.
- [x] The document `click` listener attaches strictly once on mount and detaches on unmount.
- [x] Static navigation configuration arrays in `Menubar` are hoisted outside the component function scope.
- [x] Route change handling in `Menubar` uses standard side-effect hooks without executing state updates directly in the component render body.
