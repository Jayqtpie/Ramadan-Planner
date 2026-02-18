# Test Coverage Analysis

## Current State

The Ramadan Planner PWA has **zero test coverage**. There is no test framework installed, no test files, no testing libraries, and no test scripts in `package.json`. The only automated quality check is ESLint linting.

### Codebase Summary

| Category | Files | Lines (approx) | Description |
|----------|-------|-----------------|-------------|
| Pages | 10 | ~1,700 | Route-level components (Home, DailyPage, etc.) |
| Components | 4 | ~45 | Reusable UI (SectionBar, StarRating, SavedToast, Footer) |
| Hooks | 2 | ~65 | `useAutoSave`, `useRamadanDay` |
| Lib/Utility | 5 | ~1,140 | db.js, data.js, prayerTimes.js, shareProgress.js, exportPdf.js |
| App Root | 2 | ~250 | App.jsx (routing, unlock system), main.jsx |
| **Total** | **23** | **~3,200** | Excluding CSS (8,700 lines) |

---

## Recommended Testing Infrastructure

### Framework: Vitest + React Testing Library

Since the project uses Vite, **Vitest** is the natural choice — it shares the same config, transforms, and plugin pipeline. Pair it with `@testing-library/react` for component tests and `jsdom` as the DOM environment.

**Packages to install:**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom fake-indexeddb
```

**Add to `package.json` scripts:**

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

---

## Priority Areas for Testing

Tests are ranked by **impact** (how much breakage they'd catch) and **feasibility** (how easy they are to write without a backend or complex mocking).

### Priority 1: Pure Logic — Highest Value, Easiest to Test

These modules contain pure functions with zero UI dependencies. They are the highest-ROI targets.

#### 1.1 `src/lib/data.js` — Factory Functions & Static Data

**What to test:**
- `getDefaultDailyPage(day)` returns correct structure with the right `id` (`day-1`, `day-30`), all salah tracker keys, 3 gratitude slots, etc.
- `getDefaultNiyyah()` returns 5 habit slots, all unchecked
- `getDefaultGoals()` returns 4 goal quadrants with 5 empty strings each
- `getDefaultQuranTracker()` returns 30 juz entries, all `completed: false`
- `getDefaultWeeklyReflection(week)` returns correct `id` format (`week-1` through `week-4`)
- `getDefaultLastTenNight(night)` returns correct worship checklist keys
- `getDefaultEidChecklist()` returns correct number of beforeEid/eidDay items matching `EID_BEFORE`/`EID_DAY` arrays
- `getDefaultPostRamadan()` returns 5 habit slots and 6 Shawwal days
- Static data arrays have expected lengths: `HADITHS` (30), `MUHASABAH` (30), `JUZ_DATA` (30), `EID_BEFORE` (7), `EID_DAY` (8), `LAST_TEN_DUAS` (10 entries for nights 21-30)

**Why it matters:** These factories define the data schema for the entire app. If a key is renamed or missing, every page that reads it will silently break. Tests here act as a schema contract.

#### 1.2 `src/App.jsx` — `validateCode()` Function

**What to test:**
- Valid codes in format `GB-XXXX-XXXX` return `true`
- Various invalid formats return `false`: wrong prefix, too short, bad checksum, random strings
- Case insensitivity: `gb-xxxx-xxxx` works the same as `GB-XXXX-XXXX`
- Whitespace tolerance: codes with leading/trailing spaces are accepted
- Dash-less format (`GBXXXXXXXX`) is accepted

**Why it matters:** This is the unlock gate for the entire app. A regression here locks users out. This function is pure (no side effects) and trivial to test, but currently buried inside `App.jsx`. Consider extracting it to `src/lib/validateCode.js` to make it independently testable.

#### 1.3 `src/hooks/useRamadanDay.js` — `getRamadanDay()` Pure Function

**What to test:**
- Returns `1` when `startDate` is null/undefined
- Returns `1` on the start date itself
- Returns `15` when 14 days have passed
- Clamps to `1` for dates before start
- Clamps to `30` for dates well after start (e.g., 40 days later)
- Handles edge cases: string date formats, DST transitions

**Why it matters:** This drives which day is shown across the app. Off-by-one errors here affect the entire daily tracking flow.

#### 1.4 `src/lib/prayerTimes.js` — `getDefaultMethodForTimezone()`

**What to test:**
- North American timezones (`America/*`) return method `'2'` (ISNA)
- European timezones (`Europe/*`) return method `'3'` (MWL)
- Middle Eastern timezones return their specific methods (Dubai → `'16'`, Kuwait → `'9'`, etc.)
- Southeast Asian timezones (Jakarta, Kuala Lumpur, Singapore) return correct methods
- Null/undefined input returns `'3'` (MWL fallback)
- Unknown timezones return `'3'` (fallback)

**Why it matters:** Wrong calculation method means wrong prayer times displayed to users — a serious issue for a religious app. This is a pure function and straightforward to test exhaustively.

---

### Priority 2: Data Layer — Critical Path, Moderate Effort

#### 2.1 `src/lib/db.js` — IndexedDB Wrapper

**What to test (using `fake-indexeddb`):**
- `setSetting(key, value)` → `getSetting(key)` round-trip returns the value
- `setData(store, data)` → `getData(store, id)` round-trip returns the data
- `getAllData(store)` returns all records in a store
- `deleteData(store, id)` removes a record
- `clearStore(store)` empties a store
- `exportAllData()` returns all 9 stores
- `importAllData(data)` clears existing data and imports new data correctly
- `importAllData` ignores store names not in the schema
- `clearAllData()` empties all 9 stores

**Why it matters:** This is the persistence layer for the entire app. Every page reads and writes through these functions. A bug in `importAllData` could destroy user data during a restore. Using `fake-indexeddb` as a polyfill allows these tests to run in Node without a browser.

#### 2.2 `src/lib/shareProgress.js` — Progress Aggregation Logic

**What to test:**
- Empty daily pages produce zeroed stats
- Correctly counts prayers marked as `done` across 5 fard prayers
- Correctly counts `onTime: 'Y'` values
- Averages khushu rating, skipping days with no rating
- Sums Quran pages, good deeds, and water intake
- Counts `daysTracked` based on presence of prayers, pages, or niyyah
- Reads juz completion count from quranTracker store
- Generates expected text format (line-by-line)

**Why it matters:** Users share this summary socially. Incorrect stats would be embarrassing and erode trust. The aggregation logic is the testable core — you can mock `exportAllData` and test the computation in isolation.

---

### Priority 3: Custom Hooks — Core UX Behavior

#### 3.1 `src/hooks/useAutoSave.js`

**What to test (using `@testing-library/react` `renderHook`):**
- On mount, loads existing data from IndexedDB for the given `store`/`id`
- On mount with no existing data, initializes with `defaultValue` (both object and factory function forms)
- `update()` with an object merges into current state
- `update()` with a function receives previous state
- Debounces writes: calling `update()` rapidly only triggers one `setData` call after 500ms
- `showSaved` becomes `true` after a write and resets to `false` after 1300ms
- Changing `store`/`id` reloads data (covers navigating between daily pages)

**Why it matters:** This hook powers every single page's data flow. A debounce bug could cause data loss; a loading bug could show stale data from another day/page.

---

### Priority 4: Component Tests — Targeted Coverage

Full page-level integration tests are expensive. Focus on components with interactive logic.

#### 4.1 `src/components/StarRating.jsx`

**What to test:**
- Renders the correct number of stars (default 5)
- Clicking star N calls `onChange` with value N
- Clicking the currently-selected star deselects it (calls `onChange(0)`)
- Visual state: active stars vs inactive stars

#### 4.2 `src/components/SectionBar.jsx`

**What to test:**
- Renders the label text
- Applies the correct variant CSS class (`section-bar-primary`, etc.)
- Renders the icon when provided

#### 4.3 `UnlockScreen` in `src/App.jsx`

**What to test:**
- Renders the input and submit button
- Submit button is disabled when input is empty
- Shows error message on invalid code
- Calls `onUnlock` callback on valid code
- Shows "Verifying..." while checking

---

### Priority 5: Integration / Smoke Tests — Safety Net

#### 5.1 Route Smoke Tests

Verify each route renders without crashing (no import errors, no missing props):

```
/, /niyyah, /goals, /daily/1, /daily/15, /daily/30,
/tracker, /reflect, /reflect/week/1, /reflect/last10,
/reflect/eid, /reflect/post, /settings
```

These don't need to assert content — just that they mount without throwing.

#### 5.2 Navigation

- Bottom nav has 5 tabs
- Clicking each tab navigates to the correct route
- `/daily` tab defaults to day 1
- Unknown routes redirect to `/`

---

### Priority 6: PDF Export — Complex but Lower Frequency

#### 6.1 `src/lib/exportPdf.js`

**What to test:**
- `exportPdf()` returns/creates a PDF document without throwing
- PDF has expected number of sections (cover, niyyah, goals, daily tracker, etc.)
- Handles empty data gracefully (no crashes when user has entered nothing)
- Handles full data (30 days of entries) without page overflow issues

**Why this is lower priority:** PDF export is a "generate-and-download" action — users can visually verify the output. But a crash during export is a bad experience, so a smoke test that confirms it runs without errors is still valuable.

---

## Suggested File Organization

```
src/
├── __tests__/
│   ├── lib/
│   │   ├── data.test.js          # Factory functions + static data contracts
│   │   ├── db.test.js            # IndexedDB CRUD operations
│   │   ├── prayerTimes.test.js   # Timezone → method mapping
│   │   ├── shareProgress.test.js # Progress aggregation logic
│   │   └── exportPdf.test.js     # PDF generation smoke tests
│   ├── hooks/
│   │   ├── useAutoSave.test.js   # Debounce, load, save behavior
│   │   └── useRamadanDay.test.js # Day calculation edge cases
│   ├── components/
│   │   ├── StarRating.test.jsx   # Interactive rating component
│   │   └── SectionBar.test.jsx   # Variant rendering
│   ├── App.test.jsx              # Unlock flow + route smoke tests
│   └── setup.js                  # Test setup (fake-indexeddb, jest-dom matchers)
```

---

## Suggested Vitest Configuration

Add a `test` block to `vite.config.js`:

```js
export default defineConfig({
  // ...existing plugins...
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
    css: false,
  },
});
```

`src/__tests__/setup.js`:

```js
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
```

---

## Summary: Recommended Implementation Order

| Phase | Scope | Files | Est. Tests |
|-------|-------|-------|------------|
| **1** | Pure functions | data.js, validateCode, getRamadanDay, getDefaultMethodForTimezone | ~40-50 |
| **2** | Data layer | db.js, shareProgress.js | ~20-25 |
| **3** | Hooks | useAutoSave.js, useRamadanDay.js | ~10-15 |
| **4** | Components | StarRating, SectionBar, UnlockScreen | ~10-15 |
| **5** | Integration | Route smoke tests, navigation | ~15-20 |
| **6** | PDF export | exportPdf.js | ~5 |
| | **Total** | | **~100-130** |

Phase 1 alone would cover the most critical business logic with minimal setup effort. Each subsequent phase adds a layer of confidence. Consider also adding the `test` step to the GitHub Actions deploy workflow (`.github/workflows/deploy.yml`) so tests run on every push.
