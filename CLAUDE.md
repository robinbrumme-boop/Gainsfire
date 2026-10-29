# FlameLog

Strength-training log PWA. UI language is German; code and commits in English.

## Stack
- Vite 6 + React 18 + TypeScript (strict), `vite-plugin-pwa` for manifest/service worker
- No backend: all data in `localStorage` under key `flamelog:v1` (`src/store.ts`)
- Plain CSS in `src/styles.css` with CSS variables; dark by default, light via `prefers-color-scheme`
- No router: tabs are switched in `src/App.tsx`

## Layout
- `src/types.ts` – data model (`State` with `version: 2`; bump + extend `migrate()` in `src/store.ts` when changing shape)
- `src/seed.ts` – exercise catalog (append only: ids come from position), the Push FB / Pull FB plan, demo data
- `src/util.ts` – formatting and stats helpers (e1RM via Epley)
- `src/screens/*` – one file per tab; `src/components/*` – shared UI

## Commands
- `npm run build` – must pass (runs `tsc --noEmit` first)
- `npm run dev` / `npm run preview` – served under `/Gainsfire/` (set `BASE=/` for other hosts)

## Conventions
- State updates go through `setState(s => ({ ...s, ... }))`; never mutate.
- Mobile first: test at 390×844.
