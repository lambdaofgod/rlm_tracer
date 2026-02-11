# RLM Visualizer -- Implementation Tasks

## Phase 1: Scaffolding

- [x] 1.1 Move `app/` to `src/app/`, update tsconfig `@/*` -> `./src/*`, install all deps, create `components.json`
- [x] 1.2 TEST: `bun run build` passes with the restructured project

## Phase 2: Data layer

- [x] 2.1 `src/lib/utils.ts` (cn function), `src/lib/types.ts` (all interfaces)
- [x] 2.2 `src/lib/parse-logs.ts` -- real JSONL parser with metadata extraction
- [x] 2.3 Create a sample `.jsonl` fixture file for testing (`src/lib/__tests__/fixture.jsonl`)
- [x] 2.4 TEST (`bun test`): unit tests for `parseLogFile` -- parses fixture, correct iteration count, metadata, config extraction, handles malformed input (`src/lib/__tests__/parse-logs.test.ts`)

## Phase 3: UI primitives

- [x] 3.1 All `src/components/ui/*` files (shadcn/ui wrappers: button, card, badge, tabs, collapsible, scroll-area, dropdown-menu, resizable, accordion, separator, tooltip)
- [x] 3.2 Theme: ThemeProvider, ThemeToggle, globals.css with OKLCH vars
- [x] 3.3 TEST: `bun run build` still passes with all primitives

## Phase 4: Core components (bare bones)

- [x] 4.1 Leaf components: SyntaxHighlight, CodeWithLineNumbers, StatsCard, AsciiGlobe (exports AsciiRLM)
- [x] 4.2 FileUploader (drag-and-drop, reads .jsonl via FileReader, calls onFileLoaded)
- [x] 4.3 CodeBlock (collapsible card: code, stdout, stderr, variables)
- [x] 4.4 ExecutionPanel (tabs: code execution + sub-LM calls, renders CodeBlock list)
- [x] 4.5 TrajectoryPanel (conversation messages list + final answer)
- [x] 4.6 IterationTimeline (scrollable card strip with selection callback)
- [x] 4.7 LogViewer (header, stats, timeline, resizable split panels, keyboard nav)
- [x] 4.8 Dashboard (upload area, loaded files list, renders LogViewer when log selected)
- [x] 4.9 Entry points: layout.tsx (fonts, providers), page.tsx (renders Dashboard)
- [x] 4.10 TEST: `bun run build` passes
- [x] 4.11 TEST (`bun test`): component smoke tests -- Dashboard renders, LogViewer renders with mock data, FileUploader triggers callback on file input (`src/components/__tests__/`)

## Phase 5: Integration test

- [x] 5.1 TEST (`bun test`): end-to-end flow test -- render Dashboard, simulate file upload with fixture, verify LogViewer appears, verify iteration navigation works

Test runner: `bun test` (built-in, native TypeScript). Will need `@happy-dom/global-registrator` or similar for DOM APIs in component tests.

## Phase 6: Design language and styling

- [x] 6.1 Tinted cards, gradient icon squares, message card styling
- [x] 6.2 Highlighted response card, final answer card, empty states
- [x] 6.3 Iteration timeline visual polish (color-coded circles, badges, selected state)
- [x] 6.4 Dashboard background (grid pattern, blurred radial gradients)
- [x] 6.5 Syntax highlighting OKLCH token colors

## Phase 6b: Layout bug fixes

BUG: When loading a real JSONL log where the final answer is large, the final
answer card (rendered inside TrajectoryPanel's ScrollArea) overflows the resizable
panel and covers the entire viewport. The final answer renders on top of other
components, hiding header, stats, timeline, execution panel, and footer.

Root causes:
1. The final answer card lives inside TrajectoryPanel's ScrollArea alongside
   iteration responses. When the answer is huge, it blows out the scroll container.
2. The flex/height chain from h-screen down to ScrollArea has gaps where overflow
   is not constrained, allowing content to expand instead of scroll.

- [x] 6b.1 Extract final answer into a separate collapsible strip in LogViewer (between Q/A summary and timeline), outside TrajectoryPanel's scroll area
- [x] 6b.2 Fix the height/overflow chain in LogViewer: add overflow-hidden wrappers on ResizablePanel contents
- [x] 6b.3 Cap individual content blocks: add max-h-96 + overflow-auto on `<pre>` elements in TrajectoryPanel (MessageCard and LM responses)
- [x] 6b.4 Code formatting in TrajectoryPanel: parse fenced code blocks in LM responses and render with SyntaxHighlight instead of plain `<pre>`
- [ ] 6b.5 TEST: verify with a real large log file that all panels remain visible and scroll correctly

BUG: Variable values in CodeBlock are rendered as raw text with no formatting or
truncation. Long values (e.g. full HTML page in `webpage_content`) spill across
the 2-column grid and are unreadable.

- [x] 6b.6 Python-format variable values in CodeBlock: use SyntaxHighlight or styled `<pre>` with Python repr formatting instead of raw text
- [x] 6b.7 Collapsible long variable values: values > 1024 chars should be collapsed by default with a click-to-expand toggle

BUG: IterationTimeline horizontal scroll doesn't work. The ScrollArea renders all
cards in a flex row but the horizontal scrollbar has no effect -- only cards that
fit the viewport width are visible (e.g. 9 out of 15).

- [x] 6b.8 Fix IterationTimeline horizontal scroll: add `overflow-hidden` or width constraint on the parent wrapper so ScrollArea engages horizontal scrolling

## Phase 7: Features

- [ ] 7.1 Demo log loading: `/api/logs` route + sample `.jsonl` in `public/logs/`
- [ ] 7.2 Sub-LM call visualization with depth indicators
- [ ] 7.3 Error handling: error boundaries, parse error feedback

## Phase 8: Polish

- [ ] 8.1 Responsive layout / mobile breakpoints
- [ ] 8.2 Accessibility (ARIA, focus management)
- [ ] 8.3 Performance (virtualize long lists)
- [ ] 8.4 Tests (additional unit + component interaction tests)
