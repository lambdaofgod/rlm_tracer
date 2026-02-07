# RLM Visualizer -- App Summary

## Global Behavior

This is a Next.js 16 single-page app for debugging **Recursive Language Model (RLM)**
execution traces. An RLM works by repeatedly prompting an LLM that can write and execute
Python code in a REPL, optionally spawning sub-RLM calls at deeper recursion depths.

The app has two views:

1. **Dashboard** -- landing page. Upload a `.jsonl` log file or pick one from a
   demo log listing (fetched from an API that doesn't exist in-repo, see
   Architecture > Data loading). Shows an ASCII architecture diagram.
2. **LogViewer** -- full-screen debugger. Displays the selected log file with an
   iteration timeline, a conversation trajectory panel, and a code execution panel.
   Keyboard navigation with arrow keys; Esc returns to Dashboard.

Data flow is pure prop-drilling (no Redux/Context for app state). `Dashboard` holds the
list of loaded log files and which one is selected. `LogViewer` holds the selected
iteration index and passes it down to all children.


## ASCII Wireframes

### Dashboard view

```
+------------------------------------------------------------------+
| RLM Visualizer                          [theme toggle] . READY   |
+------------------------------------------------------------------+
|                                                                   |
|  01 Upload Log File          |  02 Recent Traces (latest 10)     |
|  +------------------------+  |  +------------------------------+  |
|  |  Drag & drop .jsonl    |  |  | o log_001.jsonl   [5 iter]  |  |
|  |  or [Choose File]      |  |  | o log_002.jsonl   [3 iter]  |  |
|  +------------------------+  |  | o log_003.jsonl   [8 iter]  |  |
|                               |  |          ...                 |  |
|  * RLM Architecture          |  +------------------------------+  |
|  +------------------------+  |                                    |
|  |  ASCII diagram of       |  |  03 Loaded Files                  |
|  |  Depth 0: LM <-> REPL  |  |  +------------------------------+ |
|  |  Depth 1: sub-RLMs     |  |  | o my_upload.jsonl  [4 iter]  | |
|  +------------------------+  |  +------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
| RLM Visualizer . Recursive Language Models                        |
+------------------------------------------------------------------+
```

### LogViewer view

```
+------------------------------------------------------------------+
| [<- Back] | * filename.jsonl                  [Errors] [Done] [T] |
|             model . backend . env                                 |
+------------------------------------------------------------------+
| Context / Question            | Final Answer                      |
| "What is 2+2?"               | "4"                               |
|                        [Iterations: 5] [Code: 8] [Sub: 2] [3.2s] |
+------------------------------------------------------------------+
| Recursive Language Model Trajectory           [x] Vertical        |
| +------+ +------+ +------+ +------+ +------+                     |
| |  1   | | *2*  | |  3   | |  4   | | 5 F  |  <- scroll ->      |
| | snip | | snip | | snip | | snip | | snip |                     |
| +------+ +------+ +------+ +------+ +------+                     |
+------------------------------------------------------------------+
|  TrajectoryPanel       ||       ExecutionPanel                    |
|                        ||                                         |
|  [system] Setup msg    ||  [Code Execution] [Sub-LM Calls]       |
|  [user]   Question     ||                                         |
|  [assistant] Prior     ||  Code Block #1          0.45s           |
|  ---- iter 2 ----      ||  +----------------------------+         |
|  [LM Response]         ||  | python code with line nums |         |
|  "Let me try..."       ||  +----------------------------+         |
|                        ||  stdout: ...                            |
|  +-- Final Answer --+  ||  stderr: ...                            |
|  | = 4              |  ||  Variables: x=1, y=2                    |
|  +------------------+  ||                                         |
+------------------------------------------------------------------+
| [<- ->] Navigate    [Esc] Back                                    |
+------------------------------------------------------------------+
```


## File Tree

```
src/
  app/
    layout.tsx            Root layout: Geist fonts, ThemeProvider, TooltipProvider
    page.tsx              Entry point: renders <Dashboard />
    globals.css           Tailwind base + custom CSS variables for theming
    favicon.ico
  components/
    Dashboard.tsx         Landing page: upload area, demo log list, loaded files
    LogViewer.tsx         Full-screen debugger: header, stats, timeline, split panels
    IterationTimeline.tsx Horizontal/vertical scrollable row of iteration cards
    TrajectoryPanel.tsx   Left panel: conversation messages + final answer
    ExecutionPanel.tsx    Right panel: tabs for code execution and sub-LM calls
    CodeBlock.tsx         Collapsible card: code, stdout, stderr, variables, sub-calls
    CodeWithLineNumbers.tsx  Code display with left-aligned line numbers
    SyntaxHighlight.tsx   Custom Python syntax highlighter (regex-based, no deps)
    StatsCard.tsx         Small colored stat card (iterations, code, sub-LM, time)
    FileUploader.tsx      Drag-and-drop .jsonl file upload widget
    AsciiGlobe.tsx        Animated ASCII diagram of RLM architecture (exports AsciiRLM)
    ThemeProvider.tsx      Thin wrapper around next-themes
    ThemeToggle.tsx       Light/dark/system theme dropdown
    ui/                   Shadcn/Radix UI primitives:
      accordion.tsx         Collapsible sections (unused by app components)
      badge.tsx             Colored label pills
      button.tsx            Button variants
      card.tsx              Card + CardContent containers
      collapsible.tsx       Expand/collapse wrapper (CodeBlock)
      dropdown-menu.tsx     Popover menu (ThemeToggle)
      resizable.tsx         Resizable split panels (LogViewer)
      scroll-area.tsx       Custom scrollbar wrapper
      separator.tsx         Divider (unused by app components)
      tabs.tsx              Tab switcher (ExecutionPanel)
      tooltip.tsx           Hover tooltips (provider in layout, but unused)
  lib/
    types.ts              TypeScript interfaces for the RLM log format
    parse-logs.ts         JSONL parser, metadata extraction, context helpers
    utils.ts              cn() -- Tailwind class merging (clsx + tailwind-merge)
```


## Component Summary

| Component           | Role                                             | State                          | Key props                                  |
|---------------------|--------------------------------------------------|--------------------------------|--------------------------------------------|
| Dashboard           | Root view, file management                       | logFiles[], selectedLog, demoLogs[] | --                                    |
| LogViewer           | Debugger shell, keyboard nav                     | selectedIteration              | logFile, onBack                            |
| IterationTimeline   | Scrollable iteration card strip                  | vertical (layout toggle)       | iterations, selectedIteration, onSelect    |
| TrajectoryPanel     | Conversation history display                     | --                             | iterations, selectedIteration              |
| ExecutionPanel      | Code + sub-LM tabs                               | --                             | iteration                                  |
| CodeBlock           | Single code block with output                    | isOpen (collapse)              | block, index                               |
| FileUploader        | Drag-and-drop upload                             | isDragging, isLoading          | onFileLoaded                               |
| StatsCard           | Stat display pill                                | --                             | label, value, icon, variant                |
| AsciiGlobe (AsciiRLM) | Animated ASCII architecture diagram            | pulse (animation counter)      | --                                         |
| SyntaxHighlight     | Python syntax coloring                           | --                             | code, language                             |
| CodeWithLineNumbers | Code + line number gutter                        | --                             | code, language, startLine                  |
| ThemeToggle         | Dark/light/system switcher                       | mounted (hydration guard)      | --                                         |
| ThemeProvider        | next-themes wrapper                              | (managed by next-themes)       | children                                   |


## Data Model (lib/types.ts)

```
RLMLogFile
  +-- fileName, filePath
  +-- iterations: RLMIteration[]
  |     +-- iteration (number), timestamp
  |     +-- prompt: {role, content}[]
  |     +-- response: string
  |     +-- code_blocks: CodeBlock[]
  |     |     +-- code: string
  |     |     +-- result: REPLResult
  |     |           +-- stdout, stderr, locals, execution_time
  |     |           +-- rlm_calls: RLMChatCompletion[]
  |     +-- final_answer: string | [string,string] | null
  |     +-- iteration_time: number
  +-- metadata: { totalIterations, totalCodeBlocks, totalSubLMCalls, ... }
  +-- config: RLMConfigMetadata { root_model, max_depth, backend, ... }
```


## Architecture

**Component hierarchy.** Every component is `'use client'`. There is no server-side
data fetching; the app loads log files from user uploads (FileReader API) or by
fetching static files via the browser.

**State management.** Pure prop-drilling with two state hubs:

```
Dashboard                          -- logFiles[], selectedLog, demoLogs[]
  |
  +-- (selectedLog != null)
  |     |
  |     LogViewer                  -- selectedIteration (number)
  |       +-- IterationTimeline    -- vertical (local layout toggle)
  |       +-- TrajectoryPanel      -- stateless
  |       +-- ExecutionPanel       -- stateless
  |             +-- CodeBlock      -- isOpen (local collapse toggle)
  |
  +-- (selectedLog == null)
        +-- FileUploader           -- isDragging, isLoading
        +-- AsciiGlobe             -- pulse (animation counter)
```

No Redux, no Zustand, no React Context for app data. The only Context is
`next-themes` for the dark/light theme.

**Communication.** Parent-to-child via props. Child-to-parent via callback props
(`onSelectIteration`, `onFileLoaded`, `onBack`). No event bus, no pub/sub.

**Keyboard navigation.** `LogViewer` registers a global `keydown` listener
(ArrowLeft/j, ArrowRight/k, Esc) and passes setters down.

**Component library pattern.** Shadcn/ui "new-york" style: each primitive lives in
`components/ui/` as a thin wrapper around a Radix UI headless primitive. Variants
are defined with `class-variance-authority` (CVA). Class merging uses `cn()` =
`clsx` + `tailwind-merge` (from `lib/utils.ts`). App-level components compose these
primitives freely.

**Data loading.** Two paths:
1. Upload: `FileUploader` reads a `.jsonl` file via `FileReader`, calls back with
   raw text. `Dashboard` passes it to `parseLogFile()`.
2. Demo logs: on mount, `Dashboard` tries to fetch `/api/logs` for a file listing,
   then fetches each file from `/logs/{name}`. However, no API route handler exists
   in the repo (`src/app/api/` is missing), so this path silently fails and the demo
   list stays empty unless the route is provided externally.

`parseLogFile()` in `lib/parse-logs.ts` handles JSONL parsing, iteration extraction,
config extraction, and metadata computation (totals, context question, final answer).

**Layout.** `LogViewer` fills the viewport (`h-screen flex flex-col`). The main
content area uses `react-resizable-panels` for a draggable 50/50 split between
TrajectoryPanel and ExecutionPanel. The iteration timeline is a horizontally
scrollable strip (or vertically scrollable with the toggle).


## Design Language

### UI element catalog

**Tinted cards.** The primary visual building block. A `Card` (from Shadcn/ui) with
a colored border and a faint tinted background. Formula:
`border-{color}-500/30 bg-{color}-500/5` (light) / `dark:border-{color}-400/30
dark:bg-{color}-400/5` (dark). Used for: iteration cards, code blocks, sub-LM call
cards, stats cards, demo log list items.

**Collapsible cards.** Code blocks wrap a tinted card in a `Collapsible` (Radix).
The card header is the trigger; clicking it toggles the body. Header shows a
chevron indicator, title, execution time badge, and status badges.

**Gradient icon squares.** 32x32px rounded-lg squares with a `bg-gradient-to-br`
two-tone fill and a white SVG icon inside. Used as role indicators in
TrajectoryPanel (violet for system, emerald for user, sky for assistant) and as
panel header icons. Larger variant (40x40 rounded-full) for the final answer
checkmark.

**Badges.** Small pills (`Badge` from Shadcn/ui) used everywhere for metadata:
- Outline variant for neutral info (token counts, execution time, iteration count)
- Destructive variant for errors
- Custom-colored for domain meaning: emerald for "Answer", fuchsia for sub-LM,
  amber for "FINAL"

**Stats cards.** (`StatsCard`) Compact metric display: icon + label + large value.
Five color variants (cyan, green, magenta, yellow, red) using the tinted card
pattern. Shown in a horizontal row in the LogViewer header.

**Message cards.** In TrajectoryPanel, each prompt message is a rounded-xl card
with a role-colored tint (violet/emerald/sky at 5% opacity), a role-colored border
(at 20% opacity), a header row (gradient icon + role label), and a nested
`bg-background/60` box for the monospace message content.

**Highlighted response card.** The current iteration's model response uses a
thicker border (`border-2`), a gradient background (`from-sky-500/10
to-indigo-500/10`), and a drop shadow -- making it visually distinct from the
prompt messages above it.

**Final answer card.** Large emerald-tinted card with `border-2`, gradient
background, drop shadow, a circular checkmark icon, and larger text (15px) for the
answer value.

**Empty states.** When a panel has no data, a centered card with `border-dashed`
shows a muted icon in a rounded square and a short explanation message.

**Drag-and-drop zone.** `FileUploader` uses a dashed-border card that changes color
and scales slightly (`scale-[1.01]`) on drag-over.

**Iteration timeline strip.** A horizontal (or vertical) row of fixed-width (w-72)
cards. Each card has a numbered circle (color-coded: primary=selected,
emerald=final, red=error, muted=normal), badge row, text snippet, and token stats.
The selected card gets `border-primary` + `shadow-md`.

**Resizable split.** The main content is a `ResizablePanelGroup` with a draggable
handle between two panels. Handle has a hover highlight.

**Tab bar.** ExecutionPanel uses a `Tabs` component with a two-column grid
`TabsList`. Tab content fills the remaining vertical space.

**Variable grid.** Code block locals are displayed in a 2-3 column grid of small
mono-font cells: `key = value` with sky-colored keys and amber-colored values.

**Keyboard hints footer.** A thin bar at the bottom with `<kbd>` styled keys and
labels.

### Recurring patterns

- **Section headers** use a small icon square + bold label + muted subtext, followed
  by a flex spacer and optional controls on the right.
- **Scrollable regions** use Radix `ScrollArea` (custom-styled scrollbars) rather
  than native overflow.
- **Content boxes** inside cards use `bg-background/60` or `bg-muted/50` with a
  `border border-border/50` and `rounded-lg`. Monospace text, 12px, `whitespace-pre-wrap`.
- **Color-coded output sections** in CodeBlock stack vertically with `border-t`
  dividers: code (muted bg), stdout (emerald tint), stderr (red tint), variables
  (muted bg), sub-LM calls (fuchsia tint). Each has a tiny uppercase label.
- **Hover effects** use `hover:border-primary/40`, `hover:bg-muted/50`, or
  `hover:scale-[1.01-1.02]`.
- **Transitions** are CSS-only: `transition-all duration-150` (cards) or
  `duration-200`/`duration-300` (upload, stats).

### Colors

All colors use the OKLCH color space. The theme is green-tinted (hue 145).

Semantic tokens defined as CSS custom properties in `globals.css`:
`--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`,
`--accent`, `--destructive`, `--border`, `--input`, `--ring`.

Light mode: high lightness (0.9+), low chroma.
Dark mode: low lightness (0.09-0.22), higher chroma.
Primary: `oklch(0.45 0.16 145)` (light) / `oklch(0.65 0.18 145)` (dark).

Accent color mapping:

| Color     | Tailwind prefix   | Meaning                     |
|-----------|-------------------|-----------------------------|
| emerald   | emerald-500/400   | Success, code, final answer |
| red       | red-500/400       | Errors, destructive         |
| sky       | sky-500/400       | Info, input tokens, assistant|
| fuchsia   | fuchsia-500/400   | Sub-LM calls                |
| amber     | amber-500/400     | Warnings, FINAL badge, time |
| violet    | violet-500/400    | System messages              |

### Syntax highlighting

Custom regex-based Python highlighter (`SyntaxHighlight.tsx`), no external library.
Token colors are hardcoded OKLCH via Tailwind arbitrary values:

| Token      | OKLCH value              | Appearance  |
|------------|--------------------------|-------------|
| Keywords   | `oklch(0.7 0.2 320)`     | pink        |
| Builtins   | `oklch(0.8 0.15 195)`    | teal        |
| Strings    | `oklch(0.75 0.15 145)`   | green       |
| Numbers    | `oklch(0.85 0.15 45)`    | orange      |
| Comments   | `oklch(0.55 0.05 260)`   | grey-blue   |
| Operators  | `oklch(0.7 0.1 260)`     | blue        |
| Functions  | `oklch(0.85 0.12 220)`   | light blue  |

### Typography

Two font families via `next/font/google`:
- **Geist** (sans) -- UI text, labels, descriptions
- **Geist Mono** -- code, file names, stats, token counts, variables

Code blocks: 13px, line-height 1.6, tab-size 2.
Prose/trajectory: 14px, line-height 1.7.
Tiny labels: 9-10px uppercase tracking-wider.
Badge text: 9-10px.

### Backgrounds and chrome

- Dashboard: layered 50px CSS grid pattern at low opacity + two large blurred
  radial gradients (`blur-3xl`) for depth
- Custom WebKit scrollbars: `--muted` track, `--border` thumb
- Dark-first: `defaultTheme="dark"`, class-based toggle via `next-themes`

### Dead CSS in globals.css

The following classes are defined in `globals.css` but never used by any component:
`gradient-text`, `terminal-prompt`, `prose-trajectory` (and its nested rules),
`message-bubble`, `message-bubble-system`, `message-bubble-user`,
`message-bubble-assistant`. TrajectoryPanel uses inline Tailwind classes for message
styling instead of the pre-defined CSS classes.


## Stack

### Runtime dependencies

| Package                        | Purpose                                                      |
|--------------------------------|--------------------------------------------------------------|
| next                           | App framework (App Router)                                   |
| react / react-dom              | UI library                                                   |
| @radix-ui/react-accordion      | Collapsible sections primitive (unused by app components)    |
| @radix-ui/react-collapsible    | Collapse/expand primitive (CodeBlock)                        |
| @radix-ui/react-dropdown-menu  | Dropdown primitive (ThemeToggle)                             |
| @radix-ui/react-scroll-area    | Custom scrollbar primitive                                   |
| @radix-ui/react-separator      | Divider primitive (unused by app components)                 |
| @radix-ui/react-slot           | Polymorphic component slot (Button asChild)                  |
| @radix-ui/react-tabs           | Tab switcher primitive (ExecutionPanel)                      |
| @radix-ui/react-tooltip        | Hover tooltip primitive (provider mounted, but never used)   |
| react-resizable-panels         | Draggable split panel layout (LogViewer)                     |
| class-variance-authority (CVA) | Variant-based className builder (Button)                     |
| clsx                           | Conditional className joining                                |
| tailwind-merge                 | Deduplicates conflicting Tailwind classes                    |
| next-themes                    | Dark/light/system theme management                           |
| lucide-react                   | Icon library (imported by ui/ primitives only, app uses inline SVGs) |

### Dev dependencies

| Package                        | Purpose                            |
|--------------------------------|------------------------------------|
| tailwindcss                    | Utility-first CSS framework        |
| @tailwindcss/postcss           | PostCSS plugin for Tailwind v4     |
| tw-animate-css                 | Animation utilities for Tailwind   |
| typescript                     | Type checking                      |
| eslint / eslint-config-next    | Linting                            |

### Tooling config

| File              | Purpose                                                |
|-------------------|--------------------------------------------------------|
| components.json   | Shadcn/ui config: "new-york" style, lucide icons, rsc  |
| tsconfig.json     | Strict mode, `@/*` path alias to `./src/*`             |
| postcss.config.mjs| Loads `@tailwindcss/postcss`                           |
| next.config.ts    | Next.js config                                         |
