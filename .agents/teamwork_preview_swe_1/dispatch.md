## 2026-09-06T07:15:13Z

Resolve frontend authentication state loss on page refresh and complete the migration of the React frontend from Bootstrap 5 to Tailwind CSS with unified CRM design tokens, preserving 100% of existing business logic across POS, Admin Management, Dashboard, and Order History screens.

Original request reference: e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\ORIGINAL_REQUEST.md
Specification: e:\Learn JavaSpringBoot with ReactJs\Billing-app\.scratch\phase3-auth-state-ui-migration\spec.md
Sub-issues: e:\Learn JavaSpringBoot with ReactJs\Billing-app\.scratch\phase3-auth-state-ui-migration\issues\01-auth-state-usecurrentuser.md through 06-explore-pos-migration.md

Requirements:
1. R1. Auth State Persistence & Menubar Interaction: Auth state and user role must persist across browser page reloads (F5) without losing Admin access or navigation entries. Menubar dropdowns toggle on click, close on outside clicks/route changes, mobile nav auto-collapses on navigate, login form fields initialize empty.
2. R2. Styling System Migration & Design Tokens: Bootstrap 5 and Bootstrap Icons completely removed from dependencies and stylesheets (zero lingering Bootstrap classes, zero Bootstrap CSS/JS imports). Unified CRM light theme with Tailwind CSS tokens.
3. R3. Core & Management Pages Migration: Dashboard, Order History, Admin Management interfaces migrated to Tailwind CSS with 100% business logic, validation, image uploads, variants, and promotion configurations preserved.
4. R4. POS / Explore Screen Migration: POS screen migrated to Tailwind CSS (product selection left, order cart right), modals, modifier selections, receipt printing updated to design system with operational behavior retained.
5. Verification: npm run build and npm run lint in Front-end must complete with zero errors.

Protocol:
- Run the SWE Light loop: dispatch teamwork_preview_implementer on the task, then conduct repeated adversarial teamwork_preview_reviewer rounds carrying a cumulative open-issues ledger. Correctness must be established by running builds and tests.
- Maintain your BRIEFING.md and progress.md in your working directory e:\Learn JavaSpringBoot with ReactJs\Billing-app\.agents\teamwork_preview_swe_1.
- When all criteria are satisfied and reviewers pass with zero open issues, report completion back to Sentinel.
