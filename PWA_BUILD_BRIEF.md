# Build Brief: Protein Kitchen PWA

Paste this entire file to Claude as a single prompt. It is self-contained.

---

## Role

You are a senior full-stack engineer. Build a complete, installable **Progressive Web App (PWA)** called **Protein Kitchen** — a high-protein, Indian-first recipe app. Deliver production-ready code I can run locally and install to my phone's home screen.

## Product summary

Protein Kitchen helps a user hit a daily protein goal (default **100 g**) by browsing high-protein recipes, viewing per-serving protein, and tracking what they've eaten today. Indian cuisine first, but not exclusive.

## Tech stack (use exactly this)

- **Vite + React + TypeScript**
- **Tailwind CSS** for styling
- **vite-plugin-pwa** (Workbox) for service worker + manifest + offline
- **IndexedDB** (via `idb`) for the user's daily protein log; recipe/ingredient data ships as static JSON
- No backend. Fully client-side. Deployable to any static host (Netlify/Vercel/GitHub Pages).

## Data model

Recipe and ingredient JSON live in `src/data/`. Use these shapes (extend with sensible optional fields, but keep the required ones):

### Recipe (required: `id`, `title`, `proteinPerServing`)
```json
{
  "id": "recipe_air_fryer_chicken_tikka",
  "title": "Air Fryer Chicken Tikka",
  "category": "chicken",
  "proteinPerServing": 48,
  "difficulty": "easy"
}
```
Add these optional fields and populate them for the seed data: `description`, `cuisine` (default `"indian"`), `servings`, `caloriesPerServing`, `carbsPerServing`, `fatPerServing`, `timeMinutes`, `prepMinutes`, `cookMinutes`, `mealType` (`"breakfast" | "lunch" | "dinner" | "snack"`), `dietType` (`"veg" | "nonveg" | "egg" | "vegan"`), `ingredients` (array of `{ ingredientId, quantityGrams, display }`), `steps` (string array), `tags` (string array, e.g. `["vegetarian","high-protein","gluten-free","meal-prep"]`), `spiceLevel` (`0–3`), `imageUrl` (optional).

### Ingredient
```json
{
  "id": "ingredient_chicken_breast",
  "name": "Chicken Breast",
  "proteinPer100g": 31
}
```
Optional ingredient fields: `caloriesPer100g`, `dietType` (`"veg" | "nonveg" | "egg" | "vegan"`), `aisle` (for grocery grouping, e.g. `"produce"`, `"dairy"`, `"meat"`, `"pantry"`, `"spices"`), `defaultUnit` (e.g. `"g"`, `"ml"`, `"piece"`).

### App config
```json
{ "name": "Protein Kitchen", "version": "1.0.0", "defaultProteinGoal": 100 }
```

### Seed data
Ship **at least 12 recipes** across categories: `chicken`, `paneer`, `egg`, `lentil/dal`, `fish`, `tofu/soy`, `yogurt/raita`, `chickpea`. Indian-first. Include the two seed records above. Each recipe needs full `ingredients` + `steps`. Ship **at least 20 ingredients** with real `proteinPer100g` values.

## Features

### Core (must ship)

1. **Browse / discover**
   - Responsive card grid. Card shows: image (or colored category placeholder), title, category badge, **protein/serving (big, prominent)**, time, difficulty, diet-type dot (green veg / red nonveg / brown egg / teal vegan), spice meter.
   - **Search** by title + ingredient name (debounced, fuzzy-ish substring).
   - **Filter chips** (multi-select, horizontal scroll): category, diet type, meal type, difficulty, max time, tags.
   - **Sort**: protein desc (default), time asc, calories asc, protein-per-calorie desc.
   - "**High protein**" quick toggle (≥ 25 g/serving).
   - Active filter count badge + one-tap "Clear all".

2. **Recipe detail**
   - Hero image, title, key stats row: protein / calories / carbs / fat / time / servings.
   - **Macro breakdown bar** (protein/carbs/fat as stacked bar with grams + %).
   - **Servings stepper** — changing servings live-recomputes ingredient quantities and all macros.
   - Ingredient list with per-ingredient computed protein contribution (sorted by contribution). Each row has a checkbox (cook-mode tick-off).
   - Numbered steps; optional **cook mode**: full-screen, large text, keep-screen-awake (Wake Lock API), step-by-step next/prev.
   - Sticky bottom action bar: **Add to today's log** (with serving qty + meal-type picker), **♥ Favorite**, **Add ingredients to grocery list**, **Share** (Web Share API).

3. **Today / tracker**
   - Big **protein progress ring** (animated) toward goal: `consumed / goal g`, remaining, % — color shifts as it fills (red → amber → green; subtle celebrate at 100%).
   - Secondary mini-rings/bars for **calories, carbs, fat** if logged.
   - Logged items grouped by meal type (breakfast/lunch/dinner/snack), each with qty, protein, swipe-to-delete (or delete button).
   - **Quick add**: log protein freehand (custom name + grams) without a recipe; "+ shake/snack" shortcuts.
   - **Date navigator** — arrows to view/edit previous days; "Today" jumps back. Entries keyed by local date; auto-resets at midnight.

4. **Goal & settings**
   - Editable daily protein goal (slider + numeric). Optional calorie/macro goals.
   - **Body-weight protein helper**: enter weight + activity → suggests goal (e.g. 1.6–2.2 g/kg) the user can accept.
   - Units toggle (g / oz). Theme: light / dark / system. Diet preference (hides nonveg by default if veg/vegan).
   - Data: **export JSON** (logs + settings), **import**, **reset today**, **clear all data**.

### Engagement / nice-to-have (build if scope allows)

5. **Favorites** — heart recipes; Favorites tab/filter; persisted in IndexedDB.
6. **Grocery list** — accumulate ingredients from multiple recipes, auto-merge same ingredient + sum quantities, group by `aisle`, check off items, clear checked.
7. **Streaks & history** — calendar/heatmap of days goal was met; current + best streak count; 7-day protein bar chart.
8. **Meal planner (lite)** — assign recipes to days of the week; weekly protein total; "send week's ingredients to grocery list".
9. **Smart suggestions** — on Today screen, given remaining protein, surface recipes whose `proteinPerServing` ≈ what's left ("**Need 28 g more — try these**").
10. **Onboarding** — 3-slide first-run: set goal (or use weight helper), pick diet preference, install prompt. Skippable; shown once.
11. **Reminders** (best-effort) — optional local notification nudge if goal not met by a chosen time (Notifications API; degrade gracefully where unsupported, esp. iOS).

## UX / design

### Layout & navigation
- Mobile-first. Single column on phones; 2–3 col grid ≥ `sm`, wider max-width centered on desktop.
- **Bottom tab bar** (thumb-reachable): **Browse · Today · Planner · Settings** (Favorites/Grocery reachable from Browse + Today; or 5th tab if it fits). Active tab: filled icon + label + accent underline.
- Sticky, shrinking top header on scroll. Detail page uses a back chevron, not a tab.
- Respect safe-area insets (`env(safe-area-inset-*)`) for notch/home-bar.

### Visual system
- Warm, appetite-forward palette: deep saffron/turmeric accent, paprika red for nonveg, basil green for veg/success, charcoal neutrals. Full **dark mode**.
- Protein is the hero metric everywhere — largest number on every card and the ring.
- Rounded cards, soft shadows, generous spacing, food photography or tasteful gradient placeholders.
- Typography: one clean sans (e.g. Inter); large tap targets (≥ 44px).
- Micro-interactions: ring fill animation, count-up numbers, chip press states, swipe-to-delete, subtle haptic via `navigator.vibrate` on log/complete (where supported).

### States & feedback
- **Empty states** with illustration + CTA: no search results ("No recipes match — clear filters"), empty log ("Log your first meal"), empty favorites, empty grocery list.
- **Loading**: skeleton cards (not spinners) for the grid; shimmer on detail hero.
- **Optimistic** log add with toast + undo.
- **Offline banner** when offline; everything still works from cache.
- Confirm dialogs only for destructive (clear all data, reset day).

### Accessibility
- Semantic HTML, labeled controls, focus-visible rings, full keyboard nav, ARIA on the ring (`role="progressbar"` + values).
- Color never the sole signal (diet dots also have a letter/icon; spice has count).
- Contrast ≥ WCAG AA in both themes. Honors `prefers-reduced-motion` (disable big animations).

### PWA polish
- Custom **install prompt** (capture `beforeinstallprompt`, show a tasteful "Install Protein Kitchen" card; iOS: show "Add to Home Screen" hint since iOS has no prompt).
- Standalone display, themed splash/status bar, maskable icons, app shortcuts in manifest (e.g. "Log meal", "Today").
- Update flow: detect new SW, show "New version — refresh" toast.

## Project structure (suggested)

```
src/
  data/        recipes.json, ingredients.json, app-config.json
  lib/         macros.ts (protein/macro math, serving scaling), db.ts (idb stores), date.ts
  store/        log, settings, favorites, grocery, planner (hooks or context)
  components/  RecipeCard, ProteinRing, MacroBar, FilterChips, BottomNav,
               ServingStepper, CookMode, Skeleton, Toast, EmptyState, InstallPrompt
  pages/       Browse, RecipeDetail, Today, Planner, Favorites, Grocery, Settings, Onboarding
  types.ts
public/        icons (maskable), manifest handled by plugin
```

**IndexedDB stores** (`idb`): `logEntries` (keyed by date+id), `settings` (goal, macros, units, theme, diet, weight), `favorites` (recipeId set), `grocery` (ingredientId → qty + checked), `plan` (date → recipeIds[]).

## Deliverables

1. Full source tree with all files written out (no placeholders/TODOs).
2. `package.json` with scripts: `dev`, `build`, `preview`.
3. Working `vite.config.ts` with `vite-plugin-pwa` configured (manifest + Workbox runtime caching for the JSON data).
4. Seed `recipes.json` + `ingredients.json` populated per "Seed data" above.
5. App icons (generate simple SVG-derived PNG placeholders if needed; tell me how to swap real ones).
6. A `README.md`: how to install deps, run dev, build, and install the PWA on a phone.

## Acceptance checks

- `npm install && npm run dev` runs with no errors.
- Lighthouse PWA: installable, has service worker, works offline (≥ 90 PWA + a11y).
- Adding a recipe to today's log updates the ring + macros and survives reload.
- Changing servings on detail live-rescales ingredients and macros.
- Filters + search + sort combine correctly; "clear all" resets.
- Changing the goal (and weight helper) persists across reloads.
- Favorites, grocery list, and planner persist in IndexedDB.
- Date navigator shows/edits past days; new day starts empty.
- Dark mode + `prefers-reduced-motion` respected; keyboard nav works.
- All TypeScript compiles with `strict: true`; no unused/placeholder code.

Build it now. Output every file's full contents.
