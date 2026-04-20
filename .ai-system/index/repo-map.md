# Repository Map

> **Overview:** Visual map of the Along App folder structure with a brief description of each directory's purpose. Agents read this first when navigating the codebase. Updated whenever the folder structure changes significantly.

---

## Folder Structure

```
along-app/                          → Project root
│
├── .ai-system/                     → AI development system (this directory)
│   ├── agents/                     → Core agent instructions and protocols
│   ├── commands/                   → Reusable AI workflow commands
│   ├── planning/                   → Project plans and task queues
│   ├── checkpoints/                → Session logs and progress tracking
│   ├── memory/                     → Project decisions and lessons learned
│   ├── index/                      → Repository maps and dependency graphs
│   ├── summaries/                  → Development history
│   ├── testing/                    → Test plans and results
│   └── operations/                 → Operational runbooks
│
├── app/                            → Next.js App Router root
│   ├── (auth)/                     → Auth route group (no dashboard layout)
│   │   ├── login/                  → Login page
│   │   ├── register/               → Registration page
│   │   └── otp/                    → OTP verification page
│   │
│   ├── (dashboard)/                → Main app route group (with layout/nav)
│   │   ├── layout.tsx              → Dashboard layout (sidebar/bottom nav)
│   │   ├── home/                   → Feed page
│   │   ├── explore/                → Discover routes and users
│   │   ├── posts/                  → Post creation and detail view
│   │   ├── profile/                → User profiles
│   │   ├── bookmarks/              → Saved posts
│   │   ├── notifications/          → User notifications
│   │   └── marketplace/            → Marketplace (planned)
│   │
│   ├── api/                        → Next.js API routes (REST endpoints)
│   │   ├── auth/                   → Auth endpoints (login, register, logout, otp)
│   │   ├── posts/                  → Post CRUD, likes, comments, bookmarks
│   │   ├── users/                  → User profile, follow, unfollow
│   │   └── notifications/          → Notification list and read status
│   │
│   ├── components/                 → Shared React components
│   │   ├── features/               → Feature-specific components
│   │   │   ├── auth/               → Auth forms and flows
│   │   │   ├── dashboard/          → Dashboard layout components
│   │   │   ├── navigation/         → Nav components (sidebar, bottom bar)
│   │   │   ├── posts/              → Post cards, creation, detail
│   │   │   ├── profile/            → Profile display and editing
│   │   │   └── pwa/                → PWA install prompt, offline banner
│   │   └── ui/                     → Generic UI primitives
│   │
│   ├── lib/                        → Shared application logic
│   │   ├── types/                  → TypeScript types and interfaces (auto-imported)
│   │   │   ├── types.ts            → Core type definitions
│   │   │   └── interfaces.ts       → Interface definitions
│   │   ├── utils/                  → Utility functions
│   │   │   ├── auth.ts             → Client-side auth utilities
│   │   │   ├── auth-server.ts      → Server-side auth utilities
│   │   │   ├── cloudinary.ts       → Image upload helpers
│   │   │   ├── validation.ts       → Zod validation schemas
│   │   │   ├── rateLimiter.ts      → Rate limiting utilities
│   │   │   ├── security.ts         → Security helpers
│   │   │   ├── format.ts           → Formatting utilities
│   │   │   ├── feedHelpers.ts      → Feed algorithm helpers
│   │   │   ├── geolocation.ts      → Geolocation utilities
│   │   │   └── push-notifications.ts → Web Push helpers
│   │   ├── db/                     → Prisma client singleton
│   │   ├── cache/                  → Redis (Upstash) cache helpers
│   │   ├── services/               → Business logic services
│   │   ├── hooks/                  → Custom React hooks
│   │   ├── config/                 → Configuration (Cloudinary, etc.)
│   │   ├── constants/              → App-wide constants
│   │   └── data/                   → Mock data (dev only, to be removed)
│   │
│   ├── providers/                  → React context providers
│   │   ├── AntdProvider.tsx        → Ant Design SSR registry + theme
│   │   ├── AuthProvider.tsx        → Authentication context
│   │   └── ThemeProvider.tsx       → Theme context
│   │
│   ├── generated/                  → Auto-generated files (do not edit manually)
│   │   └── prisma/                 → Generated Prisma client
│   │
│   ├── fonts/                      → Custom fonts (Geist)
│   ├── globals.css                 → Global CSS styles
│   ├── layout.tsx                  → Root layout (wraps all providers)
│   ├── page.tsx                    → Root redirect page
│   ├── not-found.tsx               → 404 page
│   ├── robots.ts                   → robots.txt generation
│   └── sitemap.ts                  → sitemap.xml generation
│
├── prisma/                         → Prisma ORM configuration
│   ├── schema.prisma               → Database schema
│   ├── seed.ts                     → Database seed script
│   ├── prisma.config.ts            → Prisma configuration
│   └── migrations/                 → Database migration history
│
├── mock-backend/                   → json-server mock API (dev only)
│
├── public/                         → Static assets (PWA manifest, icons, SW)
│
├── scripts/                        → Build and utility scripts
│
├── .github/                        → GitHub configuration and summaries
│   └── summaries/                  → AI-generated summaries
│
├── .ai-context.md                  → Project AI context (read first)
├── next.config.mjs                 → Next.js configuration
├── tailwind.config.ts              → Tailwind CSS configuration
├── tsconfig.json                   → TypeScript configuration
├── jest.config.js                  → Jest testing configuration
└── package.json                    → Dependencies and scripts
```

---

## Directory Descriptions

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `app/(auth)/` | Unauthenticated pages | `login/page.tsx`, `register/page.tsx`, `otp/page.tsx` |
| `app/(dashboard)/` | Main authenticated app | `layout.tsx`, `home/`, `explore/`, etc. |
| `app/api/` | REST API endpoints | `auth/`, `posts/`, `users/`, `notifications/` |
| `app/components/features/` | Feature UI components | Per-feature subdirectories |
| `app/lib/types/` | All TS types/interfaces | `types.ts`, `interfaces.ts` |
| `app/lib/utils/` | Utility functions | `cloudinary.ts`, `auth.ts`, `validation.ts` |
| `app/lib/db/` | Prisma client | Singleton export |
| `app/lib/cache/` | Redis helpers | Cache get/set/invalidate |
| `app/lib/services/` | Business logic | Service layer functions |
| `app/providers/` | Context providers | `AntdProvider`, `AuthProvider`, `ThemeProvider` |
| `prisma/` | DB schema & migrations | `schema.prisma`, `migrations/` |
| `mock-backend/` | Dev mock API | `server.js` (json-server) |
| `public/` | PWA assets | `manifest.json`, icons, service worker |

---

## Entry Points

| Purpose | File |
|---------|------|
| Root redirect | `app/page.tsx` |
| Root layout | `app/layout.tsx` |
| Dashboard layout | `app/(dashboard)/layout.tsx` |
| Auth layout | `app/(auth)/layout.tsx` |
| API entry | `app/api/[route]/route.ts` |
| Prisma schema | `prisma/schema.prisma` |
| Next.js config | `next.config.mjs` |
