# 02 — Menubar: Bug Fixes + Dropdown Click-Control

Status: ready-for-agent
Type: task
Blocked by: 01

## Summary

Fix two Menubar bugs: (1) "Manage" dropdown uses CSS `group-hover` — replace with click-controlled state; (2) mobile menu does not close after navigating.

## Acceptance Criteria

- [ ] "Manage" dropdown opens on button click (not hover)
- [ ] "Manage" dropdown closes when a link inside it is clicked
- [ ] "Manage" dropdown closes when clicking anywhere outside it (use existing `useOutsideClick` hook)
- [ ] Mobile hamburger menu closes automatically when a NavLink is tapped/clicked
- [ ] Profile dropdown shows role label ("Administrator" / "Standard Access") — not just A/U
- [ ] Profile dropdown closes on outside click

## Key Decision

- Use `useState` + `useRef` + `useOutsideClick` (hook at `src/hooks/useOutsideClick.js`)
- Use `useLocation` from react-router-dom to detect navigation and close mobile menu

## Modules Affected

- `src/ui/Menubar.jsx` — MODIFY
