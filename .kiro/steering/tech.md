# Tech Stack

## Frontend
- React 19 with TypeScript
- Vite (build tool, dev server on port 3000)
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- React Router v7 for client-side routing
- Three.js with @react-three/fiber and @react-three/drei for 3D elements
- Lucide React and React Icons for iconography

## Backend / Infrastructure
- Cloudflare Pages for hosting
- Cloudflare Pages Functions (serverless API in `functions/` directory)
- Cloudflare R2 for image storage (bucket: `photography`)
- Cloudflare KV for metadata storage

## TypeScript Configuration
- Strict mode enabled with additional checks:
  - `noUnusedLocals`, `noUnusedParameters`
  - `noImplicitReturns`, `noFallthroughCasesInSwitch`
  - `noUncheckedIndexedAccess`
- Path alias: `@/*` maps to project root

## Testing
- Playwright for E2E tests
- Config in `playwright.config.ts`

## Common Commands

```bash
# Development
npm run dev              # Start Vite dev server (localhost:3000)

# Build & Quality
npm run build            # Lint + typecheck + production build
npm run typecheck        # TypeScript type checking only
npm run lint             # ESLint check
npm run lint:fix         # ESLint with auto-fix

# Preview
npm run preview          # Preview production build locally

# Cloudflare Pages Functions (local testing)
npm run build && npx wrangler pages dev dist
```

## Environment
- Node.js v20+
- Build output: `dist/` directory
- Wrangler config: `wrangler.toml`
