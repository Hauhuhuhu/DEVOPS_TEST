# 07: End-to-End System Integration and Regression Verification

**What to build:**
Deliver automated integration test suites and end-to-end verification covering all Phase 7 improvements. Ensure backend tests verify error handling on login, user name in auth response, order deletion compensation invariants (rejecting completed orders, rolling back pending orders), unified activity logging across mutations, and category/user/item update endpoints. Verify frontend builds and linting pass with zero errors, confirming no regressions in existing point-of-sale sales flows, inventory operations, or role-based route protections.

**Blocked by:** 01: Auth Error Feedback and Menubar Identity, 02: Compensating Order Deletion Invariant, 04: Category Update Management, 05: User Update Management, 06: Item Update Management

**Status:** ready-for-agent

- [ ] Automated integration test verifies login failure returns 401 and valid login/refresh returns user name
- [ ] Automated integration test verifies order deletion rules: rejecting completed orders and compensating pending orders
- [ ] Automated integration test verifies activity logs are captured across create, update, and delete actions
- [ ] Automated integration tests verify category, user, and item update endpoints
- [ ] Frontend build (
pm run build) and linting (
pm run lint) pass cleanly
- [ ] Regression verification confirms cashier POS exploration and order history flows continue functioning properly
