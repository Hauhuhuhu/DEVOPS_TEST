# ADR 0003: Prevent Promotion Stacking

## Context
The system is introducing a CRM and Pricing/Promotions engine (Coupons, BOGO, Happy Hour). Customers might qualify for multiple promotions simultaneously (e.g. a Happy Hour discount + a specific Coupon Code).

## Decision
We will explicitly **prevent promotion stacking**. The system will evaluate all applicable promotions for an order/item and automatically apply only the **single best promotion** that yields the highest discount for the customer.

## Consequences
- **Positive**: Drastically simplifies the Promotion Engine logic. Eliminates edge cases where stacked percentages result in a 100% discount or negative prices.
- **Negative**: Marketing teams cannot design complex stacked campaigns (e.g., "Use this coupon ON TOP of the clearance sale").
