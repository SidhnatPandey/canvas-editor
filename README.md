# Canvas Designer Pro

## Project info

**URL**: REPLACE_WITH_PROJECT_URL

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE (recommended)**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <GIT_URL>

# Step 2: Navigate to the project directory.
cd <PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

---

## Design & Implementation Details 🔧

This section explains key decisions and how core features are implemented.

### State management & architecture 💡

- The editor uses a local custom hook `useEditorState` (React `useState` + `useCallback`) to keep state scoped and simple. This avoids external dependencies and keeps the render surface predictable.
- Main state includes `elements`, `selectedIds`, `activeTool`, `zoom`, theme flags, and grid settings. Changes that should persist in history use helper methods like `updateElementWithHistory`.

### Undo / Redo implementation ↩️↪️

- Undo/redo is implemented as a **history array** of snapshots (`HistoryEntry[]`) with a `historyIndex` pointer.
- `pushHistory` slices future states when new actions occur and caps history to the most recent 50 entries to bound memory usage.
- `undo`/`redo` update `historyIndex` and restore `elements`. Keyboard bindings are provided in `CardEditor` (Ctrl/Cmd+Z, Shift for redo, Ctrl/Cmd+Y for redo).

### Snapping logic 📐

- The canvas can render a visible grid (`showGrid` + `gridSize`) and elements can be nudged with arrow keys (1px step or 10px with Shift).
- Rotation snapping is implemented in `ResizableElement` — holding Shift while rotating snaps to 45° increments.
- Note: snap-to-grid on move/resize is not applied automatically in the current implementation but can be added easily by rounding positions to `gridSize` on move/resize end.

### Export handling 🖼️➡️📄

- Exports are performed in `CardEditor` using dynamic imports to avoid bundling heavy libs: `html-to-image` (image capture) and `jspdf` (PDF output).
- Pixel density is increased (`pixelRatio = Math.max(1, devicePixelRatio) * 2`) to produce higher-resolution captures.
- Supports PNG (transparent), JPEG (white background), and PDF (via embedding a PNG into a generated PDF). Downloads are triggered by creating an `<a>` element and programmatically clicking it.

### Performance optimizations ⚡

- Heavy libraries are imported dynamically only when exporting is triggered (reduces initial bundle size).
- Event listeners for pointer movement are only attached while dragging/resizing/rotating and are removed afterward to minimize overhead.
- `useCallback` is used to memoize handlers and avoid unnecessary re-renders on child components.
- History is capped (50 entries) to limit memory growth.
- Further improvements that could be added: debouncing or throttling move updates, using `requestAnimationFrame` for smooth pointer-based updates, and selective rendering or virtualization for very large numbers of elements.

---

If you'd like, I can add a short diagram or a small developer note showing where to add snap-to-grid behavior or how to extend the history model to use diffs instead of full snapshots. ✅

