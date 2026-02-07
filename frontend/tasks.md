# RLM Visualizer -- Implementation Tasks

## Phase 1: Scaffolding

- [ ] 1.1 Move `app/` to `src/app/`, update tsconfig `@/*` -> `./src/*`, install all deps, create `components.json`
- [ ] 1.2 TEST: `bun run build` passes with the restructured project

## Phase 2: Data layer

- [ ] 2.1 `src/lib/utils.ts` (cn function), `src/lib/types.ts` (all interfaces)
- [ ] 2.2 `src/lib/parse-logs.ts` -- real JSONL parser with metadata extraction
- [ ] 2.3 Create a sample `.jsonl` fixture file for testing (`src/lib/__tests__/fixture.jsonl`)
- [ ] 2.4 TEST (`bun test`): unit tests for `parseLogFile` -- parses fixture, correct iteration count, metadata, config extraction, handles malformed input (`src/lib/__tests__/parse-logs.test.ts`)

## Phase 3: UI primitives

- [ ] 3.1 All `src/components/ui/*` files (shadcn/ui wrappers: button, card, badge, tabs, collapsible, scroll-area, dropdown-menu, resizable, accordion, separator, tooltip)
- [ ] 3.2 Theme: ThemeProvider, ThemeToggle, globals.css with OKLCH vars
- [ ] 3.3 TEST: `bun run build` still passes with all primitives

## Phase 4: Core components (bare bones)

- [ ] 4.1 Leaf components: SyntaxHighlight, CodeWithLineNumbers, StatsCard, AsciiGlobe (exports AsciiRLM)
- [ ] 4.2 FileUploader (drag-and-drop, reads .jsonl via FileReader, calls onFileLoaded)
- [ ] 4.3 CodeBlock (collapsible card: code, stdout, stderr, variables)
- [ ] 4.4 ExecutionPanel (tabs: code execution + sub-LM calls, renders CodeBlock list)
- [ ] 4.5 TrajectoryPanel (conversation messages list + final answer)
- [ ] 4.6 IterationTimeline (scrollable card strip with selection callback)
- [ ] 4.7 LogViewer (header, stats, timeline, resizable split panels, keyboard nav)
- [ ] 4.8 Dashboard (upload area, loaded files list, renders LogViewer when log selected)
- [ ] 4.9 Entry points: layout.tsx (fonts, providers), page.tsx (renders Dashboard)
- [ ] 4.10 TEST: `bun run build` passes
- [ ] 4.11 TEST (`bun test`): component smoke tests -- Dashboard renders, LogViewer renders with mock data, FileUploader triggers callback on file input (`src/components/__tests__/`)

## Phase 5: Integration test

- [ ] 5.1 TEST (`bun test`): end-to-end flow test -- render Dashboard, simulate file upload with fixture, verify LogViewer appears, verify iteration navigation works

Test runner: `bun test` (built-in, native TypeScript). Will need `@happy-dom/global-registrator` or similar for DOM APIs in component tests.

## Phase 6: Design language and styling

- [ ] 6.1 Tinted cards, gradient icon squares, message card styling
- [ ] 6.2 Highlighted response card, final answer card, empty states
- [ ] 6.3 Iteration timeline visual polish (color-coded circles, badges, selected state)
- [ ] 6.4 Dashboard background (grid pattern, blurred radial gradients)
- [ ] 6.5 Syntax highlighting OKLCH token colors

## Phase 7: Features

- [ ] 7.1 Demo log loading: `/api/logs` route + sample `.jsonl` in `public/logs/`
- [ ] 7.2 Sub-LM call visualization with depth indicators
- [ ] 7.3 Error handling: error boundaries, parse error feedback

## Phase 8: Polish

- [ ] 8.1 Responsive layout / mobile breakpoints
- [ ] 8.2 Accessibility (ARIA, focus management)
- [ ] 8.3 Performance (virtualize long lists)
- [ ] 8.4 Tests (additional unit + component interaction tests)
