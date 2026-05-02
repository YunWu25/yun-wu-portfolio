# Project Structure

```
yun-wu-portfolio/
├── index.html           # HTML entry point
├── index.tsx            # React root rendering
├── App.tsx              # Main app with routing, splash/content state
├── types.ts             # TypeScript type definitions (ViewState, AdminPhoto, etc.)
├── styles.ts            # Design system constants (COLORS, FONTS, TYPOGRAPHY, LAYOUT)
├── constants.ts         # App configuration (scroll thresholds, animation timing)
│
├── components/          # React components
│   ├── Splash.tsx       # Animated splash screen
│   ├── MainContent.tsx  # Main layout container with navigation
│   ├── Home.tsx         # Landing page
│   ├── About.tsx        # Biography & services
│   ├── Design.tsx       # Design portfolio
│   ├── Video.tsx        # Video projects grid
│   ├── Photography.tsx  # Photography gallery (fetches from R2)
│   ├── ProjectFlow.tsx  # Project flow visualization
│   ├── Typewriter.tsx   # Typing animation component
│   ├── WaveDecoration.tsx
│   └── admin/           # Admin portal components
│       ├── PhotoManager.tsx
│       ├── PhotoCard.tsx
│       ├── PhotoFilters.tsx
│       └── hooks/
│           └── useAdminPhotos.ts
│
├── functions/           # Cloudflare Pages Functions (serverless API)
│   └── api/
│       ├── photos.ts         # GET /api/photos - public photo listing
│       └── admin/
│           └── photos.ts     # Admin API for metadata management
│
├── public/              # Static assets (copied to dist/)
│   └── images/
│       ├── about-page-yun.jpg
│       └── brand-logo/  # Partner brand SVGs
│
├── src/
│   └── index.css        # Global CSS with Tailwind imports
│
├── tests/
│   └── example.spec.ts  # Playwright E2E tests
│
└── Config files
    ├── vite.config.ts
    ├── tsconfig.json
    ├── eslint.config.js
    ├── wrangler.toml    # Cloudflare Pages config
    ├── _routes.json     # Pages Functions route config
    └── playwright.config.ts
```

## Key Patterns

### View State Management
- `ViewState` enum in `types.ts` defines all page views
- URL paths mapped to views in `App.tsx` via `viewToPath` record
- Navigation handled through React Router with `useNavigate`

### Styling Approach
- Tailwind CSS utility classes throughout
- Centralized design tokens in `styles.ts` (TYPOGRAPHY, COLORS, LAYOUT)
- Custom colors defined: `coral`, `offwhite`, `darkgray`

### API Layer
- Cloudflare Pages Functions in `functions/api/`
- R2 bucket binding named `PHOTOGRAPHY` for image storage
- Photos served from `https://media.yunwustudio.com/`

### State Persistence
- Language preference: `localStorage`
- Splash screen shown state: `sessionStorage`
