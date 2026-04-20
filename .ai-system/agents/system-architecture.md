# System Architecture

> **Overview:** Along App is a full-stack social platform built entirely within Next.js 15+ using the App Router. The frontend uses React 19 Server Components with Tailwind CSS and Ant Design. The backend layer consists of Next.js API Routes and Server Actions, backed by PostgreSQL via Prisma ORM, Cloudinary for media, and Upstash Redis for caching. Authentication is JWT-based with tokens stored in HTTP-only cookies. The codebase is organized into route groups (`(auth)`, `(dashboard)`) with a shared `app/lib/` for all shared logic.

---

## Architecture Diagram

> **Section summary:** Text-based overview of system layers and how they connect.

```
Client Browser / PWA
        ↓
  Next.js App Router (React 19 Server + Client Components)
        │
        ├── app/(auth)/          → Login, Register, OTP pages
        ├── app/(dashboard)/     → Home, Explore, Posts, Profile, Bookmarks, etc.
        └── app/components/      → Reusable UI (features/, ui/)
        │
        ↓
  Next.js API Routes (app/api/)
        │
        ├── /auth               → Login, register, OTP, logout
        ├── /users              → Profile CRUD, follow/unfollow
        ├── /posts              → Post CRUD, likes, comments, bookmarks
        └── /notifications      → Notification list and read status
        │
        ↓
  Service / Data Layer (app/lib/)
        │
        ├── db/                 → Prisma client singleton
        ├── cache/              → Redis (Upstash) cache helpers
        ├── utils/              → Auth, Cloudinary, validation, rate limiting
        ├── services/           → Business logic services
        ├── hooks/              → Custom React hooks
        ├── config/             → Configuration (Cloudinary, etc.)
        └── data/               → Mock data + in-memory DB (dev only)
        │
        ↓
  External Services
        ├── PostgreSQL          → Primary data store (via Prisma)
        ├── Cloudinary          → Image upload and storage
        ├── Upstash Redis       → Caching and rate limiting
        └── Web Push            → PWA push notifications
```

---

## Module Breakdown

> **Section summary:** Each module listed here has a single defined responsibility. Agents should not modify a module's scope without updating this document.

| Module | Responsibility | Key Files | Dependencies |
|--------|----------------|-----------|--------------|
| Auth Pages | Login, register, OTP flows | `app/(auth)/login/`, `register/`, `otp/` | AuthProvider, API routes |
| Dashboard Pages | All main app pages | `app/(dashboard)/home/`, `explore/`, `posts/`, `profile/`, etc. | Components, API routes |
| API Routes | REST endpoints | `app/api/auth/`, `users/`, `posts/`, `notifications/` | Prisma, Redis, utils |
| Components/features | Feature-specific UI | `app/components/features/` | Ant Design, Tailwind |
| Components/ui | Generic UI primitives | `app/components/ui/` | Ant Design, Tailwind |
| Providers | Global context | `app/providers/AntdProvider.tsx`, `AuthProvider.tsx`, `ThemeProvider.tsx` | React Context |
| lib/db | Prisma client | `app/lib/db/` | Prisma ORM |
| lib/cache | Redis helpers | `app/lib/cache/` | Upstash Redis |
| lib/utils | Shared utilities | `app/lib/utils/` | Cloudinary, JWT, Zod |
| lib/types | Type definitions | `app/lib/types/types.ts`, `interfaces.ts` | None (auto-imported) |
| lib/services | Business logic | `app/lib/services/` | Prisma, Redis |
| lib/hooks | React hooks | `app/lib/hooks/` | React |
| lib/data | Mock data (dev) | `app/lib/data/` | None |
| Prisma Schema | DB model definitions | `prisma/schema.prisma` | PostgreSQL |
| Mock Backend | json-server for dev | `mock-backend/` | json-server |
| PWA | Service worker, manifest | `public/` | Web Push |

---

## Data Flow

> **Section summary:** How a typical request moves through the system from entry point to response.

### Standard API Request Flow
```
Client Component / Server Component
    → fetch() or Server Action call
    → app/api/[route]/route.ts
    → Auth check (cookies / JWT)
    → Rate limit check (Upstash Redis)
    → Redis cache check → return if hit
    → Prisma query → PostgreSQL
    → Cache result in Redis
    → Return JSON response
```

### Authentication Flow
```
User submits login form
    → POST /api/auth/login
    → Validate input (Zod)
    → Look up user in DB (Prisma)
    → Compare password (bcrypt)
    → Generate JWT (jsonwebtoken)
    → Set HTTP-only cookie
    → Return user data

Server Component auth check:
    → import { cookies } from 'next/headers'
    → Read 'accessToken' cookie
    → Verify JWT
    → Redirect if invalid
```

### Image Upload Flow
```
Client selects file
    → Validate file (type, size) client-side
    → Convert to base64
    → POST to API route
    → uploadImage() from lib/utils/cloudinary.ts
    → Cloudinary stores image, returns URL
    → Store URL in DB via Prisma
```

### Data Persistence Flow
```
Mutation (create/update/delete)
    → API route or Server Action
    → Zod validation
    → Prisma transaction (if multi-step)
    → PostgreSQL write
    → Invalidate relevant Redis cache keys
    → Return result
```

---

## Configuration Points

> **Section summary:** All configurable values are listed here. Nothing should be hardcoded in source files that appears in this section.

| Config Key | Purpose | Location | Default |
|------------|---------|----------|---------|
| DATABASE_URL | PostgreSQL connection string | `.env` | — |
| JWT_SECRET | JWT signing secret | `.env` | — |
| CLOUDINARY_CLOUD_NAME | Cloudinary account | `.env` | — |
| CLOUDINARY_API_KEY | Cloudinary API key | `.env` | — |
| CLOUDINARY_API_SECRET | Cloudinary API secret | `.env` | — |
| UPSTASH_REDIS_REST_URL | Redis connection URL | `.env` | — |
| UPSTASH_REDIS_REST_TOKEN | Redis auth token | `.env` | — |
| NEXT_PUBLIC_VAPID_PUBLIC_KEY | PWA push notifications | `.env` | — |
| VAPID_PRIVATE_KEY | PWA push notifications | `.env` | — |

---

## Tech Stack

> **Section summary:** Core technologies in use. New dependencies should be added here when introduced.

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | ^16.1.1 |
| Language | TypeScript | ^5 |
| UI Framework | Ant Design | ^5.27.6 |
| Styling | Tailwind CSS | ^3.4.14 |
| ORM | Prisma | ^7.2.0 |
| Database | PostgreSQL | — |
| Cache | Upstash Redis | ^1.35.8 |
| Auth | jsonwebtoken + bcrypt | ^9.0.3 / ^6.0.0 |
| Media | Cloudinary | ^2.8.0 |
| Validation | Zod | ^4.2.1 |
| HTTP Client | Axios | ^1.12.2 |
| Testing | Jest + Testing Library | ^30 |

---

## Known Constraints & Technical Debt

> **Section summary:** Limitations and known issues that affect architecture decisions.

- `app/conflicting/` contains old code kept for reference — must not be modified or imported
- Mock backend (`mock-backend/` + `app/lib/data/`) exists alongside Prisma; needs full migration
- Some API routes may still use the in-memory database instead of Prisma
- `postcss.config.js` and `postcss.config.mjs` both exist (duplicate — should be consolidated)
- PWA push notifications require VAPID key setup in production
- Cursor-based pagination should be used for all list endpoints (not offset-based)

---

## Architecture History

> **Section summary:** Log of major architectural changes. See also `memory/architecture-history.md` for full details.

| Date | Change | Reason |
|------|--------|--------|
| 2024 | Initial Next.js App Router setup with mock backend | Rapid development without DB |
| 2025 | Prisma schema introduced, DB layer added | Production readiness |
| 2026-04-20 | .ai-system initialized, refactoring phase started | Major refactoring planned |
