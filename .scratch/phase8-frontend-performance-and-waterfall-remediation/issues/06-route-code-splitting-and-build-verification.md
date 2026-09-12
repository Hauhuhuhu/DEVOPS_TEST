# 06: Route Code-Splitting and Build Verification

**What to build:**
POS terminals download a lightweight initial JavaScript bundle containing only core application essentials, loading administrative management pages on-demand when requested. The entire refactored frontend compiles cleanly under the production build and passes all strict React hooks linting checks.

**Blocked by:** 01: Core POS State Colocation and Callback Stabilization, 02: Declarative Promotional Evaluation via TanStack Query, 03: Stable Outside-Click Listener and Menubar Optimization, 04: Search Debouncing and Keystroke Deferral across Tables, 05: Hoisted Single Modal Architecture for Catalog and User Lists

**Status:** closed
<!-- closed: 2026-09-12 by agent -->

- [x] All primary route components in `App.jsx` are dynamically imported using `React.lazy`.
- [x] Route trees are encapsulated inside a top-level `<Suspense fallback={<RouteLoading />}>` boundary.
- [x] Running `npm run build` succeeds without compilation errors and generates split chunk artifacts for lazy routes.
- [x] Running `npm run lint` completes with zero ESLint or React Hooks dependency warnings/errors.
- [x] End-to-end POS checkout, promotion calculation, and management CRUD smoke tests pass smoothly.
