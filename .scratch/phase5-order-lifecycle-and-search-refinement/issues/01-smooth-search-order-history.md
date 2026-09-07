# 01: Smooth Search and UI Stability on Order History

**What to build:** An intuitive, stutter-free search experience on the Order History page. When a cashier or store manager types into the search box or changes filters, the existing table data remains visible while the new page loads, accompanied by an unobtrusive fetching indicator. The entire page and search input must never unmount or drop frames, and input focus must be preserved across keystrokes.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Query caching retains previous data during parameter changes, preventing the dataset from dropping to an uninitialized state while new results are fetched.
- [x] The full-page loading spinner is restricted strictly to the initial cold load when no data has ever been loaded.
- [x] During debounced search or filter updates, the current table remains in place with an inline or subtle loading indicator, eliminating layout thrashing and frame drops.
- [x] Typing in the search input retains keyboard focus seamlessly throughout the debounce and fetch cycle.
