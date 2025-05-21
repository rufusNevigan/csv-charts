# TODO – CSV Charting Web App

A milestone-driven checklist.  
Each task line ends with `<!-- prompt:XX-YY -->`, where **XX** = milestone and **YY** = step.  
An LLM or script can search for the tag, flip `[ ]` → `[x]`, and commit without risk.

---

## Milestone 0 – Repo, Tooling & CI

- [x] **0.1** Create GitHub repo `csv-charts`, set `main` default, enable branch protection (require CI green). <!-- prompt:00-01 -->
- [x] **0.2** Bootstrap Vite + React-TS (`npm create vite@latest`). <!-- prompt:00-02 -->
- [x] **0.3** Add ESLint (airbnb + typescript), Prettier, `.editorconfig`, Husky pre-commit. <!-- prompt:00-03 -->
- [x] **0.4** Install Vitest + React Testing Library; configure JSDOM. <!-- prompt:00-04 -->
- [x] **0.5** Add Playwright smoke test (`home.spec.ts`). <!-- prompt:00-05 -->
- [x] **0.6** GitHub Actions workflow for lint, unit, e2e. <!-- prompt:00-05 -->

---

## Milestone 1 – Hello Vite

- [x] **1.1** Replace boilerplate with minimal `<App />` + heading. <!-- prompt:01-01 -->
- [x] **1.2** Snapshot test for heading. <!-- prompt:01-02 -->

---

## Milestone 2 – CSV Upload & Parse

- [x] **2.1** Install Papa Parse and implement `parseCsv(file)` function. <!-- prompt:02-01 -->
- [x] **2.2** Build `<FilePicker>` (plain file input, drag style optional). <!-- prompt:02-02 -->
- [x] **2.3** Unit-test FilePicker fires `onFile`. <!-- prompt:02-02 -->
- [x] **2.4** Detect duplicate headers; store non-blocking warning. <!-- prompt:02-03 -->
- [x] **2.5** Create `DatasetContext` + `useReducer`. <!-- prompt:02-04 -->
- [x] **2.6** Implement `logger.ts` util; log key actions. <!-- prompt:02-05 -->

---

## Milestone 3 – Basic Bar Chart

- [x] **3.1** Install Recharts; `<SampleBarChart>` with static data + test. <!-- prompt:03-01 -->

---

## Milestone 4 – Wire Upload → Chart

- [x] **4.1** Build `detectNumericColumns` util. <!-- prompt:04-01 -->
- [x] **4.2** Create `<ChartCanvas>` auto-rendering first two numeric cols. <!-- prompt:04-02 -->
- [x] **4.3** E2E: upload sample CSV → bars visible. <!-- prompt:04-03 -->
- [x] **4.4** Hide canvas when no dataset. <!-- prompt:04-04 -->

---

## Milestone 5 – Column Mapping UI

- [x] **5.1** Add `<ColumnSelector>` (X & Y dropdowns, skip empty headers). <!-- prompt:05-01 -->
- [ ] **5.2** Disable Y options if non-numeric. <!-- prompt:05-02 -->
- [ ] **5.3** Wire selections into context reducer. <!-- prompt:05-03 -->
- [ ] **5.4** RTL test: dropdown change updates chart. <!-- prompt:05-04 -->

---

## Milestone 6 – UX Polish & Robustness

- [ ] **6.1** Add `<AppErrorBoundary>` + `<LoadingOverlay>`. <!-- prompt:06-01 -->
- [ ] **6.2** Add `<ResetButton>` clearing context. <!-- prompt:06-01 -->
- [ ] **6.3** Large-file guard (>50 000 rows) with friendly copy. <!-- prompt:06-03 -->
- [ ] **6.4** Modal error system. <!-- prompt:06-02 -->
- [ ] **6.5** Duplicate-header warning modal. <!-- prompt:06-04 -->

---

## Milestone 7 – Row Filter & Cap (Stretch)

- [ ] **7.1** DSL parser (`col > value`, etc.) + tests. <!-- prompt:07-01 -->
- [ ] **7.2** `<FilterBuilder>` UI with helper text. <!-- prompt:07-02 -->
- [ ] **7.3** Apply filter to dataset; show filtered count badge. <!-- prompt:07-03 -->
- [ ] **7.4** Row-cap constant (10 k) with warning modal. <!-- prompt:07-04 -->

---

## Milestone 8 – Packaging & Docs

- [ ] **8.1** Production build (`vite build`) < 250 kB gzip. <!-- prompt:08-01 -->
- [ ] **8.2** Write comprehensive `README.md` (desktop-only note). <!-- prompt:08-01 -->
- [ ] **8.3** Add MIT `LICENSE`. <!-- prompt:08-01 -->
- [ ] **8.4** Create GitHub Release v0.1. <!-- prompt:08-01 -->

---

### Done? 🎉  
When every box is ticked, tag release `v0.1` and celebrate!