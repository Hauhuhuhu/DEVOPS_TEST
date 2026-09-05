# 01: Customer Management (CRM & POS Phone Lookup)

**What to build:** 
A centralized Customer Relationship Management (CRM) feature where cashiers can look up customer profiles by phone number during POS checkout or register new customers on the fly, and store managers can view and manage the full customer directory with order counts and lifetime spend metrics.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Cashier can search for a customer by typing their phone number in the POS checkout screen and have their details automatically populated.
- [ ] Cashier can create a new customer profile directly from the POS interface if the phone number is not found.
- [ ] Store manager can view, create, and update customer profiles in an Admin Customer Directory.
- [ ] Backend API securely persists customer entities with unique phone numbers and provides search and CRUD capabilities.
- [ ] API integration tests verify customer creation, phone lookup, and validation rules.
