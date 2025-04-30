**prompt_plan.md – CSV Charting Web App**

  

> **Purpose**  A sequenced collection of LLM prompts (Harper Reed “LLM Codegen” style) that will bootstrap, implement, and ship the _CSV Charting Web App_ in a fully test‑driven, incremental manner.

>   

> • Each prompt is self‑contained, written for a code‑generation agent with filesystem access (e.g. Cursor).

> • Every prompt specifies **acceptance criteria** (tests, lint, CI) so no step merges red.

> • Prompts are ordered; copy–paste each into the agent _one at a time_, commit when green.

---

**Global Context**

  

_React + Vite (TS) · Recharts · Papa Parse · React Context + useReducer (no Zustand) · Vitest + RTL + Playwright • Desktop‑only UI • Local‑only build._

  

Key non‑functional reqs from **spec.md**:

• restart button, loading overlay, modal error surfacing, duplicate‑header warning, CSV row cap (50 k), log key actions to console, helper text, skip blank headers, no mobile breakpoints.*

---

**Prompt Index**

| **#** | **Filename / Title**                                         |
| ----- | ------------------------------------------------------------ |
| 0.1   | Initialise repo & branch protection                          |
| 0.2   | Vite + React‑TS scaffold                                     |
| 0.3   | ESLint + Prettier (+ Husky)                                  |
| 0.4   | Vitest & RTL setup                                           |
| 0.5   | Playwright smoke test + CI workflow                          |
| 0.6   | EditorConfig                                                 |
| 1.1   | Clean _Hello Vite_ app shell                                 |
| 1.2   | Snapshot test for heading                                    |
| 2.1   | Install Papa Parse + parseCsv() util                         |
| 2.2   | <FilePicker> component (vanilla <input> w/ drag style)       |
| 2.3   | Duplicate‑header detection util                              |
| 2.4   | DatasetContext (useReducer)                                  |
| 2.5   | Console logger.ts helper                                     |
| 3.1   | Install Recharts + <SampleBarChart>                          |
| 4.1   | <ChartCanvas> ties dataset → chart (auto numeric col detect) |
| 4.2   | Playwright E2E upload fixture → chart appears                |
| 5.1   | <ColumnSelector> UI (skip blank headers)                     |
| 6.1   | Loading overlay & restart button                             |
| 6.2   | Modal error system (Headless UI)                             |
| 6.3   | CSV row‑cap guard throws CsvTooBigError                      |
| 6.4   | Wire duplicate‑header warning modal                          |
| 7.1   | Row filter builder (stretch)                                 |
| 8.1   | Production build, README, license                            |

  

---

**Prompts**

  

> **Copy each fenced block into your agent, run, commit, then proceed.**

  

**0.1 – Initialise Repo & Branch Rules**

```
You are a dev‑ops assistant.
Task:
1. Create new GitHub repo **csv‑charts**.
2. Add `main` branch.
3. Enable branch protection: require CI success + at least 1 PR review before merge.
4. Output GitHub CLI commands to execute locally.
Deliverable: only shell commands.
```

**0.2 – Vite + React‑TS Scaffold**

```
Context: A desktop‑only SPA that will run via `vite dev`.
Task:
1. Run `npm create vite@latest csv-charts -- --template react-ts`.
2. Remove sample assets; keep minimal `/src`.
3. Output resulting file tree (omit node_modules).
Acceptance: project builds with `npm run dev`.
```

**0.3 – Lint, Format & Husky**

```
Add tooling:
* ESLint (Airbnb+Typescript), Prettier, EditorConfig, Husky pre‑commit hook.
Steps:
1. Install required deps.
2. Configure `.eslintrc.cjs`, `.prettierrc`, `.editorconfig`.
3. Add npm scripts `lint`, `format`, `prepare`.
4. Husky pre‑commit runs `npm run lint && npm test`.
Return: diff of `package.json` and new config files.
Tests must still pass (empty suite ok).
```

**0.4 – Vitest & RTL Setup**

```
Install:
- vitest
- @testing-library/react
- @testing-library/jest-dom
Create `vitest.setup.ts` (jest‑dom import) and update `vite.config.ts` to expose vitest config with JSDOM.
Add first test `src/__tests__/sanity.test.ts` → `expect(true).toBe(true)`.
```

**0.5 – Playwright Smoke Test & CI**

```
Install Playwright (`npx playwright install --with-deps`).
Add `playwright.config.ts` (headless, baseURL http://localhost:5173).
E2E spec `e2e/home.spec.ts`:
- serve dev server (`startServer` helper) and visit `/`.
- expect page title contains "CSV Charts".
Update GitHub Actions workflow `.github/workflows/ci.yml`:
- run lint -> unit tests -> build -> e2e.
Return new files & workflow YAML.
```

**0.6 – EditorConfig (optional quality gate)**

```
Add `.editorconfig` enforcing LF, utf‑8, 2‑space indent, final newline.
```

  

---

**1.1 – Clean App Shell**

```
Replace boilerplate with:
* `src/App.tsx` -> `<main className="h-screen flex items-center justify-center bg-slate-100">\n  <h1 className="text-3xl font-semibold">CSV Charts</h1>\n</main>`
* Global CSS: Tailwind CDN import in `index.html` (simple, no build plugin)
Tests: Update Playwright title expectation (already ok). Add RTL snapshot for `<App />`.
```

**1.2 – Heading Snapshot Test**

```
Create `src/__tests__/AppHeading.test.tsx` verifying heading text content "CSV Charts".
```

  

---

**2.1 – Papa Parse Util**

```
Install `papaparse` + types.
Create `src/utils/parseCsv.ts`:
``ts
export interface ParsedCsv { headers:string[]; rows:Record<string,string>[]; }
export class CsvTooBigError extends Error {}
export async function parseCsv(file:File, rowCap=50000):Promise<ParsedCsv> { /* ... */ }
``
* Reject if >rowCap.
* Preserve header names exactly.
Unit tests with Vitest: valid small CSV & row‑cap error.
```

**2.2 – < FilePicker > Component**

```
Implement `src/components/FilePicker.tsx`:
* Renders `<input type="file" accept=".csv" />`.
* Adds drag‑hover styling via css only (no react-dropzone).
* On change, calls `props.onFile(file)`.
RTL test: fireEvent.change with mock File, expect handler called.
```

**2.3 – Duplicate‑Header Detection**

```
Add util `findDuplicateHeaders(headers:string[]):string[]`.
Unit tests cover duplicates & none.
```

**2.4 – DatasetContext (useReducer)**

```
Create context `DatasetProvider` managing state:
{
  headers:[];
  rows:[];
  loading:false;
  error?:string;
  warning?:string; // duplicates
  xKey?:string;
  yKey?:string;
}
Expose actions: `setFile`, `reset`, `setKeys`.
`setFile` uses parseCsv + duplicate check.
Tests: reducer unit tests (Vitest).
```

**2.5 – Console Logger Helper**

```
Create `src/utils/logger.ts` exporting `info`, `error` wrappers.
Log at: file selected, parse start/done, duplicate warning, key changes, reset.
Unit test: spy on console.log.
```

  

---

**3.1 – Sample Bar Chart**

```
Install `recharts`.
Create `src/components/SampleBarChart.tsx` with static data (name/value pairs).
RTL test: bars rendered count === 3 (queryAllByRole('img', {hidden:true}) length check).
```

  

---

**4.1 – ChartCanvas (auto numeric detect)**

```
Add util `detectNumericColumns(headers, rows)` returning first numeric X/Y keys.
Create `src/components/ChartCanvas.tsx`:
* Consumes context; if no dataset → prompt to upload.
* If dataset present and xKey/yKey undefined → run detect util & dispatch `setKeys`.
* Render `<ResponsiveContainer><BarChart>` from Recharts.
RTL unit tests: detect util, component renders chart when store seeded.
```

**4.2 – E2E Upload Fixture**

```
Add `fixtures/sample.csv` (small numeric dataset).
Playwright test: attach file to FilePicker, wait for SVG bars.
```

  

---

**5.1 – ColumnSelector UI**

```
Component `src/components/ColumnSelector.tsx`:
* Dropdowns for X and Y (options = headers.filter(Boolean)).
* Disable Y options that are non‑numeric (based on first row check).
* onChange -> dispatch `setKeys`.
RTL: change dropdown value updates context, ChartCanvas props change.
```

  

---

**6.1 – Loading Overlay & Reset Button**

```
Add `src/components/LoadingOverlay.tsx` – full‑screen semi‑transparent spinner shown when `loading` true.
Add `ResetButton` (top‑right) clearing context.
Tests: parseCsv with artificial delay (mock) shows overlay; click reset empties dataset.
```

**6.2 – Modal Error System**

```
Install `@headlessui/react`.
Create `src/components/ErrorModal.tsx` subscribed to `error` in context.
ErrorModal appears with message + Close resets error.
RTL: trigger parseCsv rejection, expect modal visible.
```

**6.3 – Row‑Cap Guard**

```
Ensure parseCsv throws `CsvTooBigError`; ErrorModal shows "File too big" copy.
Unit test added.
```

**6.4 – Duplicate Header Warning Modal**

```
If `warning` string set (from duplicate detection), show modal styled as non‑blocking (secondary color).
Test: duplicate header fixture triggers warning modal.
```

  

---

**7.1 – Row‑Filter Builder (stretch)**

```
Add util `applyFilter(rows, dsl)` with support for `col > value`, `col == "foo"` (simple eval).
Component `<FilterBuilder>` text input; onEnter updates filtered rows before chart.
Unit tests for parser; RTL typing filter updates row count.
```

  

---

**8.1 – Production Build & Docs**

```
* `vite build` – ensure bundle < 250 kB gzipped (use rollup‑plugin‑visualizer, fail build if >).
* Add README: prerequisites, dev, test, build, limitations (desktop only), license.
* MIT LICENSE.
* Tag GitHub release v0.1.
Playwright against `dist` folder to ensure prod bundle works.
```

  

---

**Usage Tips**

1. **One prompt, one commit** – keep history clean.

2. If tests fail, fix _within the same branch_ until green.

3. Squash‑merge PR; branch protection ensures quality.

---

Happy coding! 🎉