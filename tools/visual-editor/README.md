# Visual Editor

Click any element in a running dev site, get a ready-to-paste context block with
its **source file, line, tag, classes and current text** — then hand it to OpenCode
(the coding agent) together with what you want changed.

Built for Vite + React projects. Dev-only: production builds are untouched.

---

## How it works

| Layer | What it does |
| --- | --- |
| `vite-plugin-source-map.ts` | Dev-server plugin. Stamps every intrinsic JSX tag with `data-source-file` / `data-source-line` / `data-source-col`, so DOM nodes know where they came from. |
| `useVisualEditor.ts` | Edit-mode state + hit-testing + context extraction (closest mapped ancestor, classes, text, CSS selector). |
| `VisualEditor.tsx` | Floating toggle, hover highlight, click-to-select, hotkey. |
| `SelectionPanel.tsx` | Side panel: source location, content, classes, prompt box, copy button. |
| `formatContext.ts` | Builds the copy-paste block and handles clipboard write. |

The plugin splices attributes into the original source string (no AST
regeneration), so line numbers and formatting stay exact.

---

## Install in under a minute

### 1. Copy the folder into your project

```powershell
Copy-Item -Recurse C:\Users\joshi\tools\visual-editor <your-project>\tools\visual-editor
```

### 2. Add the one dev dependency

```powershell
npm i -D @babel/parser
```

### 3. Register the Vite plugin (`vite.config.ts`)

```ts
import { visualEditorSourceMap } from './tools/visual-editor/vite-plugin-source-map';

export default defineConfig({
  plugins: [
    react(),
    // dev-only; `apply: 'serve'` keeps it out of production builds
    visualEditorSourceMap(),
  ],
});
```

### 4. Render the overlay (`src/main.tsx`)

```tsx
import { VisualEditor } from './tools/visual-editor';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {import.meta.env.DEV ? <VisualEditor /> : null}
  </StrictMode>,
);
```

Restart the dev server. A small **Edit UI** pill appears bottom-right.

---

## Daily use

1. Click **Edit UI** (or press `Ctrl / Cmd + Shift + E`).
2. Hover — the element under the cursor is outlined and labelled with
   `file:line`.
3. Click it. The right-hand panel opens with the source location, the current
   text, the class list and a selector.
   - Clicking text lands on the inline element (a `<span>` inside the heading).
     Hold **Alt** while hovering/clicking to grab the parent element instead.
4. Type what should change.
5. **Copy context** (`Ctrl / Cmd + Enter`), paste it into OpenCode.

`Esc` closes the panel, then leaves edit mode.

### What gets copied

```md
### Target element
- Source: src/components/landing/HeroSection.tsx:124
- Tag: <h1>
- Classes: text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950
- Selector: section > div > h1.text-3xl.font-extrabold
- Parent: <div class="max-w-3xl mx-auto text-center">

### Current content
> Run your store operations. Without the complexity.

### Requested change
make the headline shorter and drop the gradient
```

---

## Props

```tsx
<VisualEditor
  defaultActive={false}        // start with edit mode on
  position="bottom-right"      // or "bottom-left"
  hotkey                    // Ctrl/Cmd + Shift + E (default true)
/>
```

## Using the hook directly

```tsx
const { active, toggle, selected, select, clearSelection } = useVisualEditor();
```

`selected` is an `ElementInfo`; pass it to `formatElementContext(selected, prompt)`
to build the same copy block elsewhere (e.g. a custom command palette action).

---

## Limits & troubleshooting

- **"source not mapped" in the panel** — the Vite plugin is not running, or the
  dev server was not restarted after adding it. Vite config changes need a
  restart.
- **Custom components (`<Hero />`) are not mapped.** Stamping a prop on a typed
  component is legal TypeScript, but React will not forward it to the DOM, so
  there is nothing to select. Member expressions that do forward props —
  `<motion.h1>`, `<motion.div>` — are mapped. The nearest intrinsic ancestor
  inside a component is still selectable.
- **Elements inside `<svg>` are skipped** to avoid attribute noise on paths.
- **Iframes are not inspected** (cross-document).
- **Production is untouched** — `apply: 'serve'` plus `import.meta.env.DEV`.
- **Clicks are captured** while edit mode is on: links, forms and buttons on the
  page will not activate. Exit edit mode to use the site normally.
- **Alt + click** selects the nearest mapped ancestor, for when the element you
  want is the heading/card wrapping the text you clicked.

---

## Files

```
tools/visual-editor/
├── vite-plugin-source-map.ts   # dev-server JSX annotation
├── useVisualEditor.ts          # state + context extraction
├── VisualEditor.tsx            # overlay UI
├── SelectionPanel.tsx          # selection panel
├── formatContext.ts            # clipboard payload
├── styles.ts                   # namespaced (ve-*) injected CSS
├── index.ts                    # client exports
├── install.mjs                 # copy into another project
└── README.md
```

`install.mjs` automated copying:

```powershell
node C:\Users\joshi\tools\visual-editor\install.mjs <path-to-project>
```
