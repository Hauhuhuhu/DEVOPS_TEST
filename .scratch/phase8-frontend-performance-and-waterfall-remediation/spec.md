# Spec: Phase 8 - Frontend Performance and Waterfall Remediation

Status: ready-for-agent

## Problem Statement

Cashiers and store administrators operating the BillingApp web application experience noticeable UI lag, unexpected data overwrites, and excessive network traffic during high-volume retail operations:
1. **POS Keystroke Stutter**: While entering a customer's phone number or name on the POS sales screen (`Explore`), the entire user interface stutters and drops frames. Typing each character re-renders the complete catalog grid (dozens of product cards), the category carousel, the active promotions banner, and the current cart item list.
2. **Promotional Calculation Race Conditions**: When cashiers rapidly adjust quantities or add modifier-heavy items to the cart, promotional discount calculations executed via raw background effects conflict with each other. Out-of-order network responses cause outdated promotional calculations to overwrite newer totals, displaying incorrect invoice balances.
3. **Search Keystroke Flooding**: Searching for customers or filtering system audit logs sends an unrestricted barrage of API requests (one per keystroke) to the Spring Boot backend server. This causes the UI table to flash loading spinners repeatedly, shifting layout and straining network bandwidth.
4. **Listener Memory Churn**: Navigating the application repeatedly attaches and detaches global click listeners to the document on every render cycle due to unstable callback references.
5. **DOM Bloat in Management Views**: Administrative lists for Items, Categories, and Users instantiate individual deletion hooks and separate modal dialog instances inside every table row, degrading browser memory and responsiveness when catalogs grow large.
6. **Monolithic Bundle Loading**: All application pages (including heavy administrative CRUD views) are loaded upfront in a single JavaScript bundle, increasing initial load time on low-spec terminal hardware.

## Solution

Implement a comprehensive frontend performance refactor aligned with the Vercel React Best Practices standards and ADR 0009:
1. **POS State Colocation**: Confine customer search and draft typing states entirely within the customer form component, propagating settled customer data to the invoice summary without triggering parent sales grid re-renders.
2. **Query-Driven Promotional Evaluation**: Encapsulate promotional price calculations inside a dedicated TanStack Query hook that generates a deterministic cart signature key, automatically deduplicating in-flight evaluations, leveraging stale caching, and canceling obsolete requests.
3. **Search Throttling & Deferral**: Equip all search inputs with 300ms debouncing and React 19 deferred values alongside placeholder caching (`keepPreviousData`), ensuring instantaneous typing responsiveness while curbing network requests by over 80%.
4. **Stable Event Listeners**: Refactor outside-click detection using mutable handler references, ensuring global document listeners bind once on mount and eliminate listener churn.
5. **Hoisted Single Modal Architecture**: Centralize deletion and editing modal dialogs at the list container level, transforming row items into pure visual elements that emit action callbacks.
6. **Route-Level Code Splitting**: Convert page routes into asynchronous chunks loaded on-demand through `React.lazy` and `Suspense`, accelerating initial POS terminal startup.

## User Stories

1. As a store cashier, I want to type a customer's phone number or name in the POS screen without any input lag, so that checkout flow remains smooth and responsive during rush hours.
2. As a store cashier, I want the product catalog grid and category selector to remain completely static while I type customer details, so that my terminal does not waste GPU/CPU cycles re-rendering unchanged products.
3. As a store cashier, I want rapid clicks on item quantity increment/decrement buttons to reliably calculate final bill discounts, so that an older delayed response never overwrites the correct final total.
4. As a store cashier, I want promotional evaluation requests to cancel automatically when I change cart items in quick succession, so that unnecessary calculation requests do not clog my network connection.
5. As a cashier or admin, I want typing in customer search or activity log search boxes to maintain a silky 60fps typing feel, so that my keystrokes are never blocked by synchronous network calls.
6. As a store manager, I want customer and audit log searches to wait briefly until I pause typing before querying the server, so that the system does not flood the backend with dozens of partial search queries.
7. As a store manager, I want search tables to maintain their current rows with a subtle corner spinner while fetching new search results, so that the screen does not violently flicker full-page loading indicators.
8. As a cashier, I want clicking outside the profile or management dropdown menus to dismiss them reliably, without the browser constantly thrashing global window event listeners.
9. As a store administrator, I want catalog lists with hundreds of products to scroll fluidly without consuming hundreds of hidden modal DOM nodes in memory, so that low-powered POS computers do not freeze.
10. As a store administrator, I want clicking "Delete" or "Edit" on any item, category, or user row to open a single, centralized modal dialog, so that dialog state is cleanly isolated and predictable.
11. As a store cashier, I want the POS terminal to load only the essential sales interface on initial startup, so that cash register startup time is as fast as possible.
12. As an administrator, I want administrative management pages to load on-demand when I navigate to them, so that unused admin code does not slow down normal store checkout operations.
13. As a store cashier, I want product filtering by category and search keyword to combine in a single evaluation pass, so that searching through hundreds of items is immediate.
14. As a store cashier, I want memoized product cards to ignore parent re-renders when their props have not changed, so that product list scrolling and interaction remains consistently smooth.
15. As a developer, I want all frontend state colocation, data fetching, and modal architecture rules documented as system invariants in ADR 0009, so that future features adhere to the same performance standards.

## Implementation Decisions

### POS State Isolation & Colocation
- The POS sales interface will separate customer input draft states from the broader sales view. Draft typing will be contained within the customer form, syncing to the order summary via a structured customer payload only upon customer lookup resolution, CRM creation, or checkout commitment.
- The cart management hook will stabilize all mutator actions (`addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`) using functional state setters and callback memoization, enabling child catalog components to maintain stable prop identities.

### Declarative Promotional Evaluation Hook
- Promotional calculations will be removed from imperative lifecycle effects. A dedicated query hook will compute a deterministic signature representing cart item identities, quantities, base prices, modifier combinations, and active coupon codes.
- TanStack Query will manage the evaluation lifecycle with request cancellation for superseded cart signatures and cached pricing for previously computed cart states.

### Search Debouncing and Deferral Architecture
- Search inputs across customer management, audit logs, and order history will employ a standardized debouncing mechanism (300ms) coupled with React 19 `useDeferredValue`.
- Associated queries will enforce `keepPreviousData` (or TanStack Query `placeholderData`), decoupling the active table view from intermediate pending query transitions.

### Global Listener Optimization
- The outside-click detection utility will decouple event registration from handler function identity by capturing the latest handler inside a mutable reference. Document event listeners will attach strictly on mount and detach on unmount.
- Module-level constants (such as navigation links) will be hoisted outside component definitions to avoid repetitive allocation.

### Single Hoisted Modal Pattern
- In management views (`Items`, `Categories`, `Users`), modal instances for confirmation of deletion and entity modification will be hoisted exclusively to the parent list component.
- Individual list row components will accept functional callbacks (`onEdit`, `onDelete`) and render purely presentation content, eliminating duplicate modal trees and duplicate mutation hooks per row.

### Route Code Splitting
- All secondary page routes in the application router will be converted to dynamic imports via `React.lazy`.
- A top-level `Suspense` boundary backed by the existing route loading placeholder will handle asynchronous chunk delivery seamlessly.

## Testing Decisions

### What Makes a Good Test
- Tests must verify external user-visible behavior and network contract compliance, not private implementation details or internal hook state.
- Focus on verifying that:
  - Rapid cart additions produce the correct grand total and applied discount without race-condition corruption.
  - Typing in search fields does not trigger immediate network requests on every keystroke.
  - Opening edit/delete dialogs opens the modal with the intended target entity.
  - Production build successfully compiles and produces split JavaScript chunks for lazy-loaded routes.

### Test Coverage & Prior Art
- **Frontend Build & Linter**: `npm run build` and `npm run lint` serve as the foundational build verification, ensuring all imports, JSX types, and chunk bundles compile cleanly.
- **End-to-End POS Verification**: Manual and script-based verification of POS checkout, customer selection, promotion calculations, and search debouncing.

## Out of Scope

- Backend database migration tools (Flyway/Liquibase) or JPA schema redesign (remains tracked in technical debt).
- Redesigning the Bootstrap/Tailwind visual theme or creating new business features.
- Introducing external state libraries (e.g., Redux, Zustand) — TanStack Query and localized React hooks satisfy all system invariants without extra runtime dependencies.

## Further Notes

- Governed by ADR 0009: *Client Performance Invariants, State Colocation, and Data Fetching Architecture*.
- Complies strictly with the architectural guidelines in `CONTEXT.md`.
