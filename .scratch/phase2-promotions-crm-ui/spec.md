Status: ready-for-agent

# Spec: Phase 2 - Promotions Engine, CRM, and POS UI Modernization

## Problem Statement

Currently, the POS system only supports sales at standard base prices and modifier add-on prices. Store owners and managers have no capabilities to define marketing promotions such as coupon discount codes, happy hour time-based deals, or Buy-One-Get-One (BOGO) campaigns. Consequently, store operations miss crucial opportunities to drive sales volume, retain customers, and run seasonal campaigns.

Furthermore, customer identification is rudimentary: customer names and phone numbers are stored as unstructured text directly on each order without a central Customer database. There is no customer purchase history, no tracking of lifetime value, and no way for cashiers to look up returning customers quickly at the counter.

Finally, the POS checkout interface lacks promotional discount workflows: there is no input for coupon redemption, no automatic detection of active happy hours, no breakdown of discounts in cart totals, and no savings itemization on receipts.

## Solution

We will introduce a complete Promotions Engine coupled with a Customer Relationship Management (CRM) directory and modernized POS/Admin user interfaces.

The Promotion Engine will support three primary promotion strategies:
1. **Coupon Codes**: Configurable voucher codes offering percentage or fixed cash discounts, governed by minimum spend thresholds, usage quotas, and validity periods.
2. **Happy Hour**: Automated time-window promotions that automatically apply discounts during configured hours and days of the week.
3. **BOGO (Buy-One-Get-One)**: Targeted product promotions where purchasing a specific variant unlocks another variant for free or at a discounted rate.

In strict accordance with ADR-0003, the system will enforce **No Promotion Stacking**: when an order qualifies for multiple promotions (e.g., an active Happy Hour and an entered Coupon), the engine evaluates all candidates and automatically applies only the single promotion yielding the highest discount for the customer.

We will also build a central Customer Directory to record customer profiles, order counts, and total spending, with instant phone number search at checkout. The POS interface will be enhanced to display active happy hour alerts, provide instant coupon validation, display an itemized price breakdown (Subtotal, Discount, Tax, Grand Total), and print clear savings details on receipts.

## User Stories

1. As a store manager, I want to create a percentage-based coupon code (e.g., 10% off), so that I can run promotional campaigns on social media.
2. As a store manager, I want to create a fixed-amount coupon code (e.g., 20,000 VND off), so that I can give direct cash discounts to attract shoppers.
3. As a store manager, I want to set a minimum order amount for a coupon, so that customers must spend a qualifying threshold to receive the discount.
4. As a store manager, I want to set a maximum discount cap for percentage coupons, so that huge orders do not produce unsustainable losses.
5. As a store manager, I want to configure a start date and an end date for each promotion, so that promotions automatically start and expire without manual intervention.
6. As a store manager, I want to set an overall usage limit on a coupon (e.g., valid for the first 100 uses), so that promotional expenses remain within budget.
7. As a store manager, I want to configure Happy Hour rules with active days of the week and specific time ranges (e.g., 14:00 - 17:00 Monday to Friday), so that discounts apply automatically during off-peak hours.
8. As a store manager, I want to configure BOGO rules (e.g., Buy Variant A, get Variant B free or discounted), so that I can incentivize volume sales for high-margin items.
9. As a store manager, I want to view a list of all active and past promotions along with their redemption counts, so that I can evaluate campaign effectiveness.
10. As a store manager, I want to deactivate or activate any promotion with a single toggle, so that I can halt any campaign immediately if necessary.
11. As a store manager, I want to view a centralized Customer Directory with names, phone numbers, total orders, and total lifetime spend, so that I understand who my top customers are.
12. As a store manager, I want to create and edit customer profiles from the Admin portal, so that customer contact information is kept up to date.
13. As a cashier, I want to search for an existing customer by typing their phone number at the POS, so that customer details are populated without re-typing.
14. As a cashier, I want to create a new customer profile directly from the POS checkout screen if the customer is not found, so that new customers are captured without disrupting the sales flow.
15. As a cashier, I want to see an on-screen banner or badge when a Happy Hour promotion is currently active, so that I can inform customers of the available deal.
16. As a cashier, I want to type or scan a coupon code into the POS cart and click Apply, so that the customer receives their entitled discount immediately.
17. As a cashier, I want to see immediate, friendly error messages if a coupon code is invalid, expired, already fully redeemed, or if the cart does not meet the minimum spend, so that I can explain the issue to the customer clearly.
18. As a cashier, I want to remove an applied coupon code from the cart, so that I can recalculate the total if the customer changes their mind.
19. As a customer, I want the system to automatically apply the single best promotion for my order when multiple promotions qualify (ADR-0003), so that I always receive the best possible savings without confusing stacking calculations.
20. As a customer, I want to see the exact discount amount and the name of the applied promotion displayed on the POS screen and printed on my receipt, so that I know exactly how much money I saved.
21. As a store auditor, I want every order to persist the applied promotion ID, promotion name, and exact discount amount, so that accounting and revenue records remain accurate and verifiable.
22. As a system, I want the coupon usage counter to increment atomically upon successful order creation, so that usage quotas cannot be exceeded by concurrent transactions.
23. As a system, I want the customer's lifetime spending and order count to automatically update upon successful order placement, so that CRM metrics remain synchronized in real time.

## Implementation Decisions

- **Domain Model & Entities**:
  - `Promotion`: Entity representing promotional campaigns. Fields include `id`, `name`, `type` (`COUPON`, `HAPPY_HOUR`, `BOGO`), `code` (unique, nullable for auto-rules like Happy Hour), `discountType` (`PERCENTAGE`, `FIXED_AMOUNT`), `discountValue`, `maxDiscountAmount` (cap for percentage discounts), `minOrderAmount`, `startDate`, `endDate`, `startTime`, `endTime`, `daysOfWeek` (JSON or bitmask for Happy Hour), `buyVariantId`, `getVariantId`, `bogoDiscountPercent` (for BOGO), `usageLimit`, `timesUsed`, and `isActive`.
  - `Customer`: Entity representing store patrons. Fields include `id`, `name`, `phoneNumber` (unique index), `email`, `totalSpent`, `orderCount`, and `createdAt`.
  - `OrderEntity` & `OrderResponse`: Expanded to include `customerId` (FK/UUID), `customerName`, `phoneNumber`, `promotionId` (FK/UUID nullable), `promotionName` (snapshot), `subtotal`, `discountAmount`, `tax`, and `grandTotal`.
- **Promotion Resolution Engine (ADR-0003)**:
  - The calculation module evaluates all candidate promotions for a given cart:
    - Step 1: Check active Happy Hour rules matching the current system time and day of week.
    - Step 2: Check matching BOGO rules against items present in the cart.
    - Step 3: Check submitted Coupon Code (validating active status, date range, usage limit, and minimum order amount).
    - Step 4: For each qualifying candidate, compute the absolute monetary discount.
    - Step 5: Select the candidate yielding the highest monetary discount. If no promotion qualifies or saves money, discount is 0. No stacking of multiple promotions is permitted.
- **Order Total Calculations**:
  - `subtotal` = Sum of all `(item.basePrice + modifierPrices) * item.quantity`.
  - `discountAmount` = Result of single best promotion calculation.
  - `discountedSubtotal` = `Math.max(0, subtotal - discountAmount)`.
  - `tax` = `discountedSubtotal * 0.1` (10% standard tax calculated on discounted base).
  - `grandTotal` = `discountedSubtotal + tax`.
- **API Contracts**:
  - `/api/v1.0/admin/promotions`: `GET` (list), `POST` (create), `PUT /{id}` (update), `PATCH /{id}/toggle` (toggle active status), `DELETE /{id}`.
  - `/api/v1.0/customers`: `GET` (list with search by phone or name), `GET /{id}`, `POST` (create new customer), `PUT /{id}`.
  - `/api/v1.0/promotions/evaluate`: `POST` accepting cart items and optional coupon code; returns the evaluated best promotion details, calculated discount amount, and pricing breakdown before placing the order.
  - `/api/v1.0/orders`: `POST` accepts `customerId`, `couponCode` alongside `cartItems` and `paymentMethod`. The backend independently recalculates and locks the discount and totals inside a database transaction to prevent client-side tampering.
- **Frontend Architecture & State Management**:
  - Use TanStack React Query for all server-state mutations and queries (`["promotions"]`, `["customers"]`, `["orders"]`).
  - Add Customer Search / Auto-suggest in `CartSummary` and `CustomerForm`.
  - Add Coupon Input and Promotion Evaluation in `CartSummary` with real-time feedback.
  - Add Admin pages: `ManagePromotions.jsx` and `ManageCustomers.jsx` protected by `AdminRoute`.
  - Update `ReceiptPopup.jsx` and `PaymentQRCode.jsx` to reflect discounts and promotions clearly.

## Testing Decisions

- **What makes a good test**:
  - Tests verify observable external system behavior and boundary contracts, not private calculation methods or implementation specifics.
  - Backend tests assert HTTP status codes (200, 201, 400, 404), JSON payload structures, and persisted database state changes (e.g., verifying coupon `timesUsed` increments and order totals reflect the correct discount).
  - Frontend tests assert user workflows: entering a coupon code updates the displayed cart summary, error messages appear on invalid codes, and placing an order dispatches the expected payload.
- **Test Modules**:
  - Backend Integration Tests:
    - Promotion CRUD and validation endpoints (`/api/v1.0/admin/promotions`).
    - Customer CRUD and lookup endpoints (`/api/v1.0/customers`).
    - Promotion Engine integration tests verifying single best promotion selection (ADR-0003), min spend enforcement, usage cap enforcement, Happy Hour detection, and order persistence (`/api/v1.0/orders`).
  - Frontend Component / User Flow Tests:
    - POS Cart Summary discount calculations, coupon apply/remove buttons, and receipt rendering.
    - Admin promotion creation form validation.
- **Prior Art**:
  - `PosCheckoutIntegrationTest.java` (Order creation and transaction tracking).
  - `StockCheckIntegrationTest.java` (Admin business operations and audits).
  - `InventoryLedgerIntegrationTest.java` (Immutable transaction logging).

## Out of Scope

- Offline-First PWA, IndexedDB offline order queuing, and Service Worker background sync (scheduled for Phase 3).
- Complex multi-tiered loyalty points systems, point redemption, and VIP tiering.
- Stacking multiple promotions on a single order (strictly forbidden by ADR-0003).
- Dynamic recipe / Bill of Materials (BOM) inventory deductions for promotional items.

## Further Notes

- All promotion operations and pricing calculations strictly conform to `CONTEXT.md` (Section 6 Glossary) and `ADR-0003: Prevent Promotion Stacking`.
