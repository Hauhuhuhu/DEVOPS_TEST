# 02 — Menubar: Bug Fixes + Dropdown Click-Control

Status: resolved
Type: task
Blocked by: 01

## Summary

Fix two Menubar bugs: (1) "Manage" dropdown uses CSS `group-hover` — replace with click-controlled state; (2) mobile menu does not close after navigating.

## Acceptance Criteria

- [x] "Manage" dropdown opens on button click (not hover)
- [x] "Manage" dropdown closes when a link inside it is clicked
- [x] "Manage" dropdown closes when clicking anywhere outside it (use existing `useOutsideClick` hook)
- [x] Mobile hamburger menu closes automatically when a NavLink is tapped/clicked
- [x] Profile dropdown shows role label ("Administrator" / "Standard Access") — not just A/U
- [x] Profile dropdown closes on outside click

## Key Decision

- Use `useState` + `useRef` + `useOutsideClick` (hook at `src/hooks/useOutsideClick.js`)
- Use `useLocation` from react-router-dom to detect navigation and close mobile menu

## Modules Affected

- `src/ui/Menubar.jsx` — MODIFY

## Comments

- Implemented via commit `0bd6123`.
- Verified with test 6 in `Front-end/test-verification.mjs`. All passed.
