# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start Vite dev server (localhost:3000)

# Build & Quality
npm run build            # Lint + typecheck + production build
npm run typecheck        # TypeScript type checking only
npm run lint             # ESLint check
npm run lint:fix         # ESLint with auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without writing

# Preview & Testing
npm run preview          # Preview production build locally
npx playwright test      # Run E2E tests
npm run build && npx wrangler pages dev dist  # Test Cloudflare Pages Functions locally
```

## Architecture

### Frontend Stack
- React 19 + TypeScript with Vite
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- React Router v7 for client-side routing
- Three.js with @react-three/fiber for 3D elements

### Backend / Infrastructure
- Cloudflare Pages for hosting (deployed at yunwustudio.com)
- Cloudflare Pages Functions (serverless API in `functions/` directory)
- Cloudflare R2 for image storage (media served from media.yunwustudio.com)
- Cloudflare KV for metadata storage

### Key Patterns

**View State Management**: The `ViewState` enum in `types.ts` defines all page views. URL paths are mapped to views via the `viewToPath` record in `App.tsx`. Navigation uses React Router's `useNavigate`.

**Styling**: Tailwind utility classes throughout with centralized design tokens in `styles.ts` (TYPOGRAPHY, COLORS, LAYOUT). Custom colors: `coral`, `offwhite`, `darkgray`.

**State Persistence**:
- Language preference: `localStorage`
- Splash screen shown state: `sessionStorage`

**Splash/Content Transition**: The app uses scroll/swipe gesture detection in `App.tsx` to transition between splash screen overlay and main content. Thresholds are configured in `constants.ts`.

### Project Layout
- `components/` - React components (page views, UI elements)
- `components/admin/` - Admin portal for photo metadata management
- `functions/api/` - Cloudflare Pages Functions (serverless API endpoints)
- `public/images/` - Static assets
- `styles.ts` - Design system constants
- `types.ts` - TypeScript type definitions
- `constants.ts` - App configuration values

### TypeScript Configuration
Strict mode with additional checks enabled:
- `noUnusedLocals`, `noUnusedParameters`
- `noImplicitReturns`, `noFallthroughCasesInSwitch`
- `noUncheckedIndexedAccess`
- Path alias: `@/*` maps to project root

### ESLint Rules
Uses typescript-eslint strict type-checked config with:
- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/prefer-nullish-coalescing`: error
- `@typescript-eslint/prefer-optional-chain`: error
- `@typescript-eslint/no-floating-promises`: error (ignoreVoid: true)
- React Hooks and React Refresh plugins enabled
