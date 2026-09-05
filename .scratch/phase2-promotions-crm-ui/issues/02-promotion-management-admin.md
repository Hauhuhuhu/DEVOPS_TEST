# 02: Promotion Management (Admin Campaign Configuration)

**What to build:** 
Store managers can create, view, update, and toggle marketing promotions (Coupon Codes with percentage or fixed discounts, Happy Hour time-window rules, and Buy-One-Get-One/BOGO deals) with configurable spending thresholds, validity periods, and usage limits through an Admin portal down to the database.

**Blocked by:** None (can start immediately).

**Status:** closed
Completed: true

- [x] Store manager can view a list of all active and inactive promotions along with their current redemption counts.
- [x] Store manager can create percentage or fixed-amount discount coupons with minimum spend, discount caps, validity dates, and usage limits.
- [x] Store manager can create Happy Hour promotions configured with specific active days of the week and daily time ranges.
- [x] Store manager can create BOGO rules linked to target variants.
- [x] Store manager can toggle any promotion active or inactive with a single action.
- [x] Backend API securely validates and persists promotion entities and enforces unique coupon codes.
- [x] API integration tests confirm creation, retrieval, validation, and status toggles of promotional campaigns.
