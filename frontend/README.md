# Protein Kitchen — Frontend

High-protein, Indian-first recipe + daily protein tracker. Installable PWA built with Vite + React.

## Stack
- Vite 5 + React 18
- `vite-plugin-pwa` (Workbox) — manifest, service worker, offline, installable, auto-update
- State: `useReducer` + Context, persisted to `localStorage` (`protein_kitchen_v1`)
- Zero UI deps — all components are inline-styled React, design tokens via CSS custom properties

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # -> dist/
npm run preview   # serve the production build
```

## Cloud sync, auth & push (optional)
Offline-first. With no env vars the app is fully usable on `localStorage` alone. Set these (`.env`, see `.env.example`) to turn on the backend:

| Var | Purpose |
|-----|---------|
| `VITE_API_URL` | Backend base URL (Render). Enables sync + push. |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web client ID (matches backend `GOOGLE_CLIENT_ID`). |

When signed in (Settings → Account): log/plan/favorites/grocery/settings sync per-user via `GET/PUT /api/sync` (pull on login, debounced push on change). "Daily reminders" subscribes the browser to Web Push against the server VAPID key. See `../backend/README.md`.

## Features
- **Onboarding** — 3-slide first run (goal, weight helper, diet).
- **Browse** — discover feed + full grid, search, filters, sort.
- **Recipe detail + Cook mode** — serving scaler, ingredient checklist, step-by-step with wake-lock.
- **Today** — animated liquid protein gauge, macro stats, quick-add, smart suggestions, log-by-meal, swipe-to-delete, date nav.
- **Planner** — streak + 7-day history, weekly plan, send week to grocery.
- **Favorites / Grocery** — grocery grouped by aisle, check-off, clear.
- **Settings** — goal slider, body-weight helper, units/theme/diet, JSON export/import, reset.

## PWA / install
- Real fullscreen installable app (no fake phone frame). On desktop it renders as a centered max-width column.
- Install: open the deployed URL → browser "Install app" (Chrome/Edge) or iOS Safari **Share → Add to Home Screen**.
- Service worker uses `autoUpdate`; new deploys refresh automatically.

## Icons
Brand mark lives at `public/icons/icon.svg`. PNGs (`pwa-192`, `pwa-512`, `maskable-512`, `apple-touch-icon`) were rendered from it. To regenerate after editing the SVG (macOS):

```bash
cd public/icons
qlmanage -t -s 512 -o . icon.svg
cp icon.svg.png pwa-512.png && cp icon.svg.png maskable-512.png
sips -z 192 192 icon.svg.png --out pwa-192.png
sips -z 180 180 icon.svg.png --out apple-touch-icon.png
rm icon.svg.png
```

## Structure
```
src/
  main.jsx              entry — mounts App, registers SW
  App.jsx               shell: theme, tab+stack routing, bottom nav, toast
  nav.jsx               nav context + getRecipe
  data/data.js          recipes, ingredients, aisles, config
  lib/lib.js            date/macro/storage helpers (PKLib)
  store/store.jsx       reducer + StoreProvider + selectors
  components/
    ui.jsx              CSS injection + primitives (Icon, LiquidGauge, Sheet, ...)
    cards.jsx           recipe cards + LogSheet
  pages/
    Onboarding.jsx Browse.jsx Detail.jsx Today.jsx
    Planner.jsx Lists.jsx Settings.jsx
```

> Backend lives in `../backend` (Spring Boot + Postgres + JWT + Google OAuth + Web Push). The app stays fully functional offline against `localStorage` when the API env vars are unset.
