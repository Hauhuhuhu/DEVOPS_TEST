# ADR 0002: Allow Negative Stock for Offline Sync

## Context
The POS frontend is evolving into an Offline-First PWA using IndexedDB. Cashiers will process orders without an active internet connection. When connection is restored, orders sync to the backend. It's highly probable that multiple offline POS terminals might sell the same limited stock item, or an item's backend inventory is 0 while a cashier physically hands it to a customer offline.

## Decision
We will allow the system to record **Negative Stock**. The backend sync API will successfully process offline orders even if the `Variant` inventory falls below 0.

## Consequences
- **Positive**: Prevents blocking the revenue stream. Cashiers are not punished for network desyncs when the physical item was already exchanged for money.
- **Negative**: Store managers will see negative numbers and must manually reconcile stock discrepancies later. A Low-Stock / Negative-Stock alert system must be built to surface these issues.
