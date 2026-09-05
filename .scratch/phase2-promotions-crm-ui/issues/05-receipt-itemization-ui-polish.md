# 05: Receipt Itemization & POS UI Modernization

**What to build:** 
A modernized customer receipt and payment interface displaying a clear, itemized breakdown of original subtotal, applied promotion name, total money saved, tax, and grand total. The Admin portal includes seamless navigation for Promotions and Customers, and the POS header displays active store promotional banners.

**Blocked by:** 04: Order Checkout with Promotions & Usage Sync.

**Status:** closed

- [x] Cashier and customer can view the order receipt popup displaying original subtotal, promotion name, savings discount amount, and final total.
- [x] Printed receipt explicitly itemizes promotional savings for customer clarity.
- [x] PayOS payment modal displays the final discounted amount with an applied discount indicator.
- [x] Admin navigation bar includes accessible links to Manage Promotions and Manage Customers.
- [x] POS screen features a clean banner/indicator for store-wide active promotions.
- [x] Frontend build and linting pass without errors or warnings.

## Comments
- Implemented `ReceiptPopup.jsx` featuring thermal/standard POS receipt styling, itemized breakdowns (subtotal, promotion name, discount amount, VAT, grand total), savings badges, and `@media print` scoped styles for clean physical or PDF printing.
- Connected `ReceiptPopup` to cash checkout in `CartSummary.jsx`, PayOS checkout completion in `CompletedPayment.jsx`, and historical order review in `OrderHistory.jsx`.
- Enhanced `QRCode.jsx` PayOS payment modal to display itemized breakdown (subtotal, applied discount with promotion name, tax, grand total) with Vietnamese currency formatting.
- Updated `Explore.jsx` POS header with an active promotions banner displaying store-wide deals (Happy Hour, BOGO, Coupons).
- Verified `Menubar.jsx` has active admin navigation for Promotions and Customers.
- Frontend linting (`npm run lint`) and production build (`npm run build`) passed with zero errors or warnings. All 52 backend integration tests pass.
