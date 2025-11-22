## Quick goal
Help contributors and AI agents be immediately productive in this repo: a small React + Vite portfolio app (no backend). Focus on predictable edits (content, styles, small UX tweaks) and how to run/build locally.

## Big picture (what to know)
- Single-page React app mounted at `#root` (`index.html` → `index.tsx` → `App.tsx`).
- UI is organized under `components/`. `MainContent.tsx` handles the primary page layout and navigation. `Splash.tsx` is an overlay splash screen that blocks interaction until dismissed.
- View state is driven by the `ViewState` enum in `types.ts`. Components read/emit navigation changes via that enum.
- Styling is a hybrid: Tailwind is loaded via CDN from `index.html`, and design tokens/utils live in `styles.ts` (e.g., `TYPOGRAPHY`, `LAYOUT.mainCard`). Prefer updating tokens in `styles.ts` for consistent changes.

## Developer workflows (how to run / build / preview)
- Install deps: `npm install` (project uses Vite + React + TypeScript). See `package.json` scripts.
- Local dev server: `npm run dev` → Vite serves at port 3000 (see `vite.config.ts`, host 0.0.0.0). If you need to reach the app from another device, use the machine IP + :3000.
- Build for production: `npm run build` then `npm run preview` to locally preview the built output.

PowerShell example to start dev (Windows PowerShell):
```
npm install
npm run dev
```

## Project-specific conventions & patterns
- Splash overlay: `Splash.tsx` sits as a fixed overlay. `App.tsx` controls visibility with `showSplash` and uses wheel/touch handlers to toggle it. When changing scroll behavior, update the logic in `App.tsx` (debounce times, delta thresholds, and the helper `isScrollableAndNotAtTop`).
- Internal scrolling: The main content uses `overflow-y-auto` (see `MainContent.tsx`) and the code assumes internal containers use that class to detect scroll position. Keep that class if you add scrollable panels.
- Typography and spacing: Use `TYPOGRAPHY.*` and `LAYOUT.*` from `styles.ts` instead of hardcoding utility classes across components for consistent look-and-feel.
- Typewriter animation: `Typewriter.tsx` uses randomized typing jitter and a restart-on-key prop. If you need deterministic animation for tests, modify the random delay behavior there.
- Icons: `lucide-react` is used for icons. Note `index.html` provides an importmap to load some libs from CDN; the repo also installs them via `package.json`. Keep versions consistent if changing.

## Integration points & external deps
- TailwindCSS: injected via CDN inside `index.html` using `tailwind.config` inline — editing theme colors or fonts can be done directly in `index.html` or by switching to a local Tailwind setup. The project relies on the CDN setup today.

## Key files to review when modifying behavior
- `index.html` — mount point, Tailwind CDN config, importmap
- `vite.config.ts` — dev server settings
- `App.tsx` — global UX (splash, global wheel/touch logic)
- `components/MainContent.tsx` — header/navigation, main layout, internal scrollable area
- `components/Splash.tsx` & `components/Typewriter.tsx` — splash and typing UX
- `styles.ts` — tokens for colors, typography, layout
- `types.ts` — enums and shared shape definitions

## Small editing rules (do this / avoid doing that)
- When adding a scrollable region, add `overflow-y-auto` and `custom-scrollbar` to keep consistent behavior and allow `App.tsx` to detect inner scrolls.
- Prefer updating design tokens in `styles.ts` instead of editing utility classes across many components.
- Avoid changing `index.html` importmap unless you understand the CDN fallback; package.json also contains the same deps.
- Keep `LAYOUT.mainCard` height behavior in mind: it intentionally uses `h-[90vh]` to allow internal scrolling. Changing it affects how Splash and pointer events behave.

If anything is unclear or you'd like the file to include more examples (e.g., a guided edit for adding a new page or changing the splash timings), tell me which section to expand and I will iterate.
