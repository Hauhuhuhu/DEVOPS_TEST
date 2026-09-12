# ADR 0009: Client Performance Invariants, State Colocation, and Data Fetching Architecture

## Context
As the retail billing application scaled with larger item catalogs, complex variant attributes, and active promotional campaigns, several frontend performance regressions emerged:
1. **State Colocation Violation**: Real-time customer search inputs in the POS `Explore` screen were lifted to the page root, triggering cascade re-renders of categories, product item cards, promotions, and cart summaries on every single keystroke.
2. **Data Fetching Waterfalls & Race Conditions**: Promotional evaluations in `CartSummary` relied on imperative `useEffect` calls against raw API services without cancellation tokens, causing render-then-fetch waterfalls and state overwrites when rapid cart modifications occurred.
3. **Keystroke API Flooding**: Text inputs in `ManageCustomers` and `ActivityLogs` fired immediate `useQuery` calls without debouncing or deferral, transmitting up to 10 HTTP requests sequentially for a single phone number or email search.
4. **Listener Churn**: Global event handlers in `useOutsideClick` were bound with unstable callback identities, constantly detaching and re-attaching document event listeners on every re-render.
5. **Component Duplication & Bundle Bloat**: Mutation hooks and modal dialogs were instantiated inside individual list row items instead of the list parent, and all route views were synchronously bundled in the initial application chunk.

## Decision
1. **POS State Colocation Invariant**:
   - High-frequency typing states (customer name, customer phone) must remain strictly localized to the input component (`CustomerForm`).
   - The parent POS screen (`Explore`) must only receive settled customer states via explicit callbacks or completion actions, never re-rendering the product grid during typing.
2. **Promotional Evaluation via TanStack Query**:
   - Imperative API calls inside `useEffect` for derived server state are forbidden.
   - Promotional evaluations must use a dedicated query hook (`usePromotionEvaluation`) with a deterministic `cartSignature` query key, enabling automatic request deduplication, stale caching, and cancellation of obsolete in-flight calculations.
3. **Input Search Throttling & Deferral**:
   - All text filter queries against backend search APIs must incorporate input debouncing (300ms) and React 19 `useDeferredValue`.
   - Queries must configure `placeholderData: keepPreviousData` to preserve existing table layouts without flickering full-page spinners during active user typing.
4. **Stable Outside Click Listener**:
   - `useOutsideClick` must store callback references in a mutable ref (`handlerRef`), keeping effect dependencies immutable (`[listenCapturing]`) and preventing listener churn.
5. **Hoisted Single Modal Architecture**:
   - Delete confirmation and edit modals in CRUD views (`Items`, `Categories`, `Users`, `Modifiers`) must be hoisted to the parent list component.
   - Child row components must only receive action triggers (`onEdit`, `onDelete`), never mounting their own redundant modal instances.
6. **Route-Level Code Splitting**:
   - All page-level route components must be dynamically imported via `React.lazy` and encapsulated within a top-level `Suspense` boundary.

## Consequences
- **Positive**: Guarantees a steady 60fps cashier interface at POS, eliminates race conditions in discount calculations, cuts redundant backend network traffic by over 80% during searches, and reduces initial bundle size for non-administrative terminals.
- **Negative**: Requires careful callback prop passing between parent lists and child rows, and introduces an asynchronous boundary on initial route transitions.
