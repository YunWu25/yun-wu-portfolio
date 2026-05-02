# Yun Wu Portfolio

```
╦ ╦╦ ╦╔╗╔  ╦ ╦╦ ╦  ╔═╗╔═╗╦═╗╔╦╗╔═╗╔═╗╦  ╦╔═╗
╚╦╝║ ║║║║  ║║║║ ║  ╠═╝║ ║╠╦╝ ║ ╠╣ ║ ║║  ║║ ║
 ╩ ╚═╝╝╚╝  ╚╩╝╚═╝  ╩  ╚═╝╩╚═ ╩ ╚  ╚═╝╩═╝╩╚═╝
```

<div align="center">

Portfolio website for Yun Wu - Visual Designer & Photographer, Seattle, WA.

**Live Site**: [yunwustudio.com](https://yunwustudio.com)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Deployment](#deployment)
- [Contact](#contact)

---

## About

Portfolio website showcasing Yun Wu's work in visual design, video, and photography...

---

## Features

### Navigation

- Home (with submenu: Design, Video, Photography)
- About
- Project Flow
- Bilingual support (EN/中文)
- Mobile-responsive hamburger menu

### Key Features

- Session-based splash screen with typewriter animation
- Photography gallery with portrait images
- Video section with two-column grid layout
- Full-screen layout with responsive design
- Smooth transitions and hover effects

---

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YunWu25/yun-wu-portfolio.git
   ```

2. **Navigate to the project directory**

   ```bash
   cd yun-wu-portfolio
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   Navigate to: http://localhost:3000
   ```

---

## Usage

| Command                       | Description                                                      |
| ----------------------------- | ---------------------------------------------------------------- |
| `npm run dev`                 | Start Vite development server                                    |
| `npm run build`               | Build for production                                             |
| `npm run preview`             | Preview production build                                         |
| `npx wrangler pages dev dist` | Test with Cloudflare Pages Functions (run `npm run build` first) |

---

## Project Structure

```
yun-wu-portfolio/
│
├── index.html              # Entry point with Tailwind CDN
├── index.tsx               # React root rendering
├── App.tsx                 # Main app with routing & scroll logic
├── types.ts                # TypeScript type definitions
├── styles.ts               # Centralized design system
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript compiler settings
├── wrangler.toml           # Cloudflare Pages configuration
├── _routes.json            # Pages Functions route config
├── playwright.config.ts    # E2E test configuration
├── package.json            # Dependencies and scripts
│
├── functions/
│   └── api/
│       ├── photos.ts       # Public API for photo listing
│       └── admin/
│           └── photos.ts   # Admin API for metadata management
│
├── components/
│   ├── Splash.tsx          # Animated splash screen
│   ├── MainContent.tsx     # Main layout container
│   ├── Home.tsx            # Landing page
│   ├── About.tsx           # Biography & services
│   ├── Design.tsx          # Design portfolio
│   ├── Video.tsx           # Video projects grid
│   ├── Photography.tsx     # Photography gallery
│   ├── ProjectFlow.tsx     # Project flow
│   ├── Typewriter.tsx      # Typing animation
│   └── WaveDecoration.tsx  # Wave decoration
│
├── public/
│   ├── admin/
│   │   └── index.html      # Admin portal UI
│   └── images/
│       ├── about-page-yun.jpg
│       └── brand-logo/     # 9 brand partner logos
│
└── tests/
    └── example.spec.ts     # Playwright test examples
```

---

## Technology Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS (CDN)
- React Router
- Lucide React (icons)

---

## Deployment

The site is deployed at **yunwustudio.com** via Cloudflare Pages.

To build for production:

```bash
npm run build
```

The build output will be in the `dist/` directory.

---

## Admin Portal

Photo metadata editor at `/admin/`. Protect with Cloudflare Access (Zero Trust → Access → Applications → add path `admin` with email allowlist).

---

## Contact

**Yun Wu** - Visual Designer & Photographer

- Email: [Yunwustudio@gmail.com](mailto:Yunwustudio@gmail.com)
- Phone: +1 425-837-2524
- Instagram: [@yun\_\_\_wu](https://instagram.com/yun___wu)
- LinkedIn: [yun-w-0532b5190](https://linkedin.com/in/yun-w-0532b5190)

**Website**: [yunwustudio.com](https://yunwustudio.com)

---

<div align="center">

Made with ❤️ in Seattle, WA

**2025 Yun Wu** • Built with React & TypeScript

</div>
