# 03 — Global: Bootstrap Removal + Design Tokens

Status: resolved
Type: task

## Summary

Remove Bootstrap. Set up Tailwind CSS as the sole styling system. Define design tokens as CSS variables. Update AppLayout, Spinner, NotFound, and global index.css.

## Acceptance Criteria

- [x] Bootstrap import removed from `index.css` (and `main.jsx` if present)
- [x] `bootstrap` classes (`btn`, `form-control`, `badge`, `card`, `table`, `d-flex`, `mb-3`, etc.) are absent from `index.css` and `App.css`
- [x] `App.css` is emptied or removed — all global styles migrated to Tailwind inline classes or `index.css` custom properties
- [x] CSS variables defined in `index.css`: `--color-primary`, `--color-accent`, `--color-border`, `--color-muted`, etc. (matching CRM palette)
- [x] `AppLayout` wraps `<Outlet>` in `min-h-screen bg-slate-50`; `<main>` gets appropriate padding wrapper
- [x] `Spinner` rewritten with Tailwind `animate-spin` — no `spinner-border` Bootstrap class
- [x] `NotFound` rewritten with Tailwind
- [x] `npm run build` passes without errors after this change

## Design Tokens (CSS Variables)

```css
--color-primary: #2563EB;
--color-primary-hover: #1d4ed8;
--color-accent: #059669;
--color-background: #F8FAFC;
--color-card: #FFFFFF;
--color-muted: #F1F5FD;
--color-muted-foreground: #475569;
--color-border: #E4ECFC;
--color-destructive: #DC2626;
--color-foreground: #0F172A;
```

## Modules Affected

- `src/index.css` — MODIFY
- `src/App.css` — CLEAR
- `src/main.jsx` — MODIFY (remove Bootstrap import if present)
- `src/ui/AppLayout.jsx` — MODIFY
- `src/ui/Spinner.jsx` — MODIFY
- `src/ui/NotFound.jsx` — MODIFY

## Comments

- Implemented via commit `0bd6123`.
- Verified with tests 1 & 2 in `Front-end/test-verification.mjs` and `npm run build`. All passed.
