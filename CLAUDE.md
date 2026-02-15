# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

GuidedBarakah — a Muslim productivity brand selling digital products. This workspace contains multiple sub-projects: a Shopify storefront theme, standalone HTML products, and a React PWA.

## Sub-projects

### `ramadan-planner/` — React PWA (primary active development)

The Ramadan Reset Planner progressive web app. React 19 + Vite, Tailwind CSS v4, IndexedDB persistence, offline-capable PWA.

**Live URL**: https://guidedbarakah.app (hosted on Vercel)
**Repo**: https://github.com/Jayqtpie/Ramadan-Planner

### `Shopify/` — Shopify 2.0 Theme

Liquid-based storefront theme (has its own `Shopify/CLAUDE.md` with full details).

### `Products/` — Standalone HTML products

`Muslim_Productivity_Dashboard.html` and `The_Ramadan_Reset_Planner.html` — self-contained vanilla JS apps using localStorage. No build step.

## Ramadan Planner PWA — Commands

```bash
cd ramadan-planner

npm run dev        # Start Vite dev server (localhost:5173)
npm run dev --host # Expose to local network (for phone testing)
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint (flat config)
```

## Ramadan Planner PWA — Architecture

### Tech Stack
- **React 19** with Vite 7, JSX (no TypeScript)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config.js` — uses `@theme` directive in CSS)
- **IndexedDB** via `idb` library (not localStorage) — database: `ramadan-planner-db` with 9 object stores
- **PWA**: `vite-plugin-pwa` with Workbox service worker, `autoUpdate` + `skipWaiting` + `clientsClaim` for immediate updates
- **Routing**: React Router v7, BrowserRouter, lazy-loaded pages
- **Icons**: Lucide React
- **Font**: Plus Jakarta Sans (Google Fonts)
- **PDF export**: jsPDF + jspdf-autotable (dynamically imported when needed)

### Deployment
- **Vercel** — auto-deploys from `main` branch on GitHub
- **Domain**: `guidedbarakah.app` (registered on Namecheap, DNS pointed to Vercel)
- Note: `ramadan.guidedbarakah.com` cannot be used because Shopify's Cloudflare proxy intercepts all subdomain DNS for domains purchased through Shopify. The main domain is under a 60-day ICANN transfer lock.

### Data Layer (`src/lib/db.js`)

All user data persists in IndexedDB. The `idb` wrapper exposes: `getData`, `setData`, `getAllData`, `getSetting`, `setSetting`, `exportAllData`, `importAllData`, `clearAllData`.

**Object stores**: `settings`, `niyyah`, `goals`, `quranTracker`, `dailyPages`, `weeklyReflections`, `lastTenNights`, `eidChecklist`, `postRamadan`.

### Auto-Save Pattern (`src/hooks/useAutoSave.js`)

Every page uses `useAutoSave(storeName, id, defaultFactory)` which returns `{ data, update, loaded, showSaved }`. Calls to `update()` are debounced 500ms before writing to IndexedDB. The hook handles loading state and shows a "Saved" toast.

### Export & Share Features (`src/lib/exportPdf.js`, `src/lib/shareProgress.js`)

Settings page offers multiple export options:
- **Download PDF** — branded multi-page PDF of entire Ramadan journey (cover, niyyah, goals, daily tracker table, detailed entries, weekly reflections, last 10 nights, post-Ramadan). Uses `jsPDF` + `jspdf-autotable`, dynamically imported. On iOS/PWA uses Web Share API with file; on desktop uses anchor download.
- **Print This Page** — `window.print()` with `@media print` styles hiding nav/toast
- **Share Progress** — text summary of stats via Web Share API (native share sheet on mobile, clipboard fallback on desktop)
- **Backup/Restore** — JSON export/import for data backup

Daily pages also have a share button (top-right header) for sharing individual day summaries.

**Important**: jsPDF's built-in Helvetica font doesn't support Arabic glyphs. Use English text for Arabic terms (e.g. "peace be upon him" not ﷺ). Use `autoTable(doc, {...})` function-call style, not `doc.autoTable()`.

### Theming

Three themes: `forest` (default), `rose`, `midnight`. Theme selection sets `data-theme` attribute on `<html>`. CSS custom properties in `src/index.css` (`:root` and `[data-theme="..."]` selectors) define `--primary`, `--secondary`, `--accent`, `--bg`, etc. Gold accent (`#C8A96E`) is shared across all themes.

### Routing & Navigation

`src/App.jsx` defines all routes with `React.lazy()` code splitting. Fixed bottom navigation with 5 tabs: Home (`/`), Daily (`/daily/:day`), Tracker (`/tracker`), Reflect (`/reflect`), Settings (`/settings`).

Sub-routes under Reflect: `/reflect/week/:week`, `/reflect/last10`, `/reflect/eid`, `/reflect/post`. Pre-Ramadan pages: `/niyyah`, `/goals`.

### Content Data (`src/lib/data.js`)

Static content arrays: `HADITHS` (30), `MUHASABAH` (30 reflection questions), `JUZ_DATA` (30 Juz-to-Surah mappings), `LAST_TEN_DUAS`, `EID_BEFORE`, `EID_DAY`. Also exports `getDefault*()` factory functions for initializing empty data records.

### Daily Page Features

- Salah tracker with done/on-time toggles for 7 prayers (5 fard + taraweeh + tahajjud)
- Khushu star rating (1-5)
- Quran progress (juz, surah, pages)
- Good deeds checklist (5 preset + 1 custom)
- Meal planner (suhoor/iftar times + notes, water intake 0-8)
- Gratitude (3 entries), Top 3 priorities
- Daily hadith and nightly muhasabah prompt with response field
- **Laylat al-Qadr tag**: gold pill badge on days 20, 22, 24, 26, 28 indicating the odd night that begins that evening
- **Share button**: top-right header, shares day summary via native share sheet

### Styling Conventions

- **Theme colors** applied via CSS custom properties and `style={{ background: 'var(--primary)' }}` — not Tailwind color classes
- **Card pattern**: `.card` wrapper + `.section-bar.section-bar-{variant}` header + `.card-body` content
- **Section bar variants**: `primary`, `gold`, `olive`, `dark`, `secondary`, `muhasabah`
- **Custom CSS classes** in `index.css`: `.spaced-caps`, `.hadith-block`, `.custom-check`, `.geo-pattern`, `.progress-bar`, `.water-glass`, `.on-time-toggle`, `.toast-saved`, `.star-rating`
- **Animations**: `.animate-fade-in`, `.animate-fade-in-up`, `.animate-slide-in` with staggered `animationDelay`
- **Print styles**: `@media print` block hides `.bottom-nav`, `.toast-saved`, `.no-print`; preserves card borders and section bar colors
- Tailwind used for layout utilities (flex, grid, spacing, responsive) — component-level styles in CSS

### Component Inventory

- `SectionBar` — themed header bar for card sections (variant + icon props)
- `StarRating` — clickable crescent moon rating (1-5)
- `SavedToast` — auto-save confirmation popup (positioned with safe-area-inset-bottom for PWA)
- `Footer` — GuidedBarakah logo + branding footer on every page

### PWA / iOS Notes

- `.toast-saved` uses `bottom: calc(5rem + env(safe-area-inset-bottom, 0px))` to clear the bottom nav in standalone mode
- Bottom nav uses padding-based height (not fixed height) with safe area inset
- PWA icons generated from `GuidedBarakah_Master_Logo.png` at 192x192 and 512x512
- `apple-touch-icon.png` at 180x180 with cream background
- Logo used in Home page hero and Footer (imported from `src/assets/logo.png`)

## Conventions

- No backend, no authentication, no server — everything is client-side
- Mobile-first responsive design (primary target: 375-428px width, Instagram-based audience)
- Page components follow a consistent structure: geo-pattern hero header → max-w-2xl content area → Footer
- Every form input auto-saves — no manual save buttons
- The full product specification lives in `Ramadan_Reset_Planner_WebApp_Prompt.md`
- Pushes to `main` auto-deploy to Vercel — no manual deploy step needed
