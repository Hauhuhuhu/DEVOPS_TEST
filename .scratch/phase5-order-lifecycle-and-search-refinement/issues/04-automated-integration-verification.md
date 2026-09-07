# 04: Automated Integration and Regression Verification

**What to build:** An automated integration test suite validating the entire in-flight order lifecycle, ensuring inventory ledger integrity, accurate quota reconciliation, and error-free frontend and backend builds.

**Blocked by:** 01: Smooth Search and UI Stability on Order History, 02: End-to-End In-Flight Order Cancellation, 03: End-to-End In-Flight Switch to Cash.

**Status:** resolved

- [x] Automated tests verify that cancelling a pending order creates a compensating IN transaction, restores cached stock quantity, decrements the promotion usage count, rolls back customer CRM metrics, and marks the status as CANCELLED.
- [x] Automated tests verify that converting a pending QR order to cash updates the payment method and status to COMPLETED without generating duplicate inventory deductions.
- [x] Automated tests verify that cancelling or switching an already completed or cancelled order is rejected with an HTTP 400 Bad Request error.
- [x] Backend test suite ./mvnw test passes completely without regressions.
- [x] Frontend build 
pm run build completes successfully with zero type or bundling errors.