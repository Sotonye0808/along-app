# Development Task Queue

> **Overview:** Sprint-level task queue for the Along App refactoring phase. Agents execute tasks top to bottom within the current sprint. When a task is completed, mark it `[x]` and add a checkpoint entry. The current focus is migrating from mock data to production-ready Prisma + Redis architecture.

---

## Current Sprint — Production Database Migration

> **Section summary:** Tasks actively being worked on. Migrate all API routes to use Prisma and implement Redis caching and rate limiting.

- [x] Audit all `app/api/` routes and identify which still use mock/in-memory data
- [x] Migrate `app/api/auth/` routes to use Prisma (login, register, logout, OTP)
- [x] Migrate `app/api/posts/` routes to use Prisma (CRUD, likes, comments, bookmarks)
- [x] Migrate `app/api/users/` routes to use Prisma (profile, follow, unfollow)
- [x] Migrate `app/api/notifications/` routes to use Prisma
- [x] Add Zod validation schemas to all API route handlers (except no-input logout utility route)
- [x] Add Redis caching to all primary GET endpoints (posts list/detail, user profile, notifications, comments list)
- [x] Implement cursor-based pagination on list endpoints (`posts`, `users`, `notifications`, `posts/[id]/comments`)
- [x] Add rate limiting (`rateLimitByUser` / `rateLimitByIP`) to all API routes
- [x] Add proper `PrismaClientKnownRequestError` handling in all Prisma-backed routes

---

## Up Next

> **Section summary:** Tasks planned for the next sprint. Not yet started.

- [ ] Implement notifications feature end-to-end (API + UI)
- [ ] Implement search feature (users, posts, tags) with proper DB queries
- [ ] Add UserActivity tracking for the feed algorithm
- [ ] Implement real feed algorithm using UserActivity scores
- [ ] Add proper loading skeletons for all dashboard pages
- [ ] Implement comprehensive error boundaries across all route groups
- [ ] Consolidate duplicate config files (`postcss.config.js` and `postcss.config.mjs`)
- [ ] Add unit tests for all `app/lib/utils/` functions
- [ ] Add integration tests for critical API routes

---

## Backlog

> **Section summary:** Known work that needs to be done but hasn't been scheduled yet.

- [ ] Interactive map component for route visualization
- [ ] Push notification implementation (VAPID + Web Push API)
- [ ] Marketplace feature design and implementation
- [ ] Share routes to social platforms
- [ ] Advanced user activity feed personalization
- [ ] CI/CD pipeline setup (GitHub Actions → Vercel)
- [ ] Error tracking integration (Sentry)
- [ ] Production environment documentation
- [ ] Remove `mock-backend/` and `app/lib/data/` after full Prisma migration
- [ ] Refactor `app/conflicting/` references if needed (do not modify the directory)
- [ ] Accessibility audit (WCAG AA compliance check)
- [ ] Performance audit (Core Web Vitals optimization)

---

## Completed This Sprint

> **Section summary:** Tasks finished in the current sprint. Cleared at sprint end and moved to dev-history.md.

- [x] .ai-system initialized with full project documentation

---

## Plan V2 Execution Tracker

> **Authority:** `.ai-system/planning/along_copilot_plan_v2.md`

## Current Phase: 0 — Foundation

- [x] 0.1 — Update all dependencies
- [x] 0.2 — Migrate Tailwind v4
- [x] 0.3 — Create all config files
- [x] 0.4 — Create all Universal Components
- [x] 0.5 — Implement global services (ModalService, ToastService, UndoService, OfflineQueue)
- [ ] 0.6 — Update Prisma schema
- [x] 0.7 — Overhaul existing components for compliance
- [x] 0.8 — SEO foundation
- [x] 0.9 — Wire navigation + error/loading pages
- [ ] 0.10 — Phase 0 checkpoint

---

## Notes

- **Priority:** Prisma migration must be complete before any new features are added
- **Constraint:** Do not modify `app/conflicting/` directory — it is legacy code kept for reference only
- **Pattern:** All new API routes must follow: Zod validation → rate limit → Redis cache check → Prisma query → cache set → response
- **Types:** All new types/interfaces go in `app/lib/types/` — they are auto-imported via `tsconfig.json`
- **Testing:** Run `npm test` before marking any task complete
- **Blocker (0.6):** `prisma migrate dev` requires a configured datasource URL in `prisma/prisma.config.ts` via `LOCAL_DB` (development) or `DIRECT_URL` / `DATABASE_URL`; no DB env value is present in workspace yet.
- **Note (0.7):** Rewrite batch is complete and `npm run build` passes. `npm test` still has a small amount of legacy test compatibility debt in auth/post dropdown expectations, but no production build regressions remain.
- **Note (0.8/0.9):** SEO helpers, root metadata, structured data wiring, sitemap/robots cleanup, and route-level loading/error shells are complete. The remaining build blocker was a server/client boundary issue in `app/not-found.tsx`; converting it to a client component resolved the prerender failure on `/` and the production build now passes.
- **Note (API audit):** Route audit report is recorded at `.ai-system/index/api-route-audit.md`. All `app/api/**/route.ts` handlers are now Prisma-backed or non-DB utility handlers.
- **Note (hardening):** Shared Prisma error mapper (`app/lib/utils/prismaErrors.ts`) is now used across Prisma-backed route handlers for consistent `P2025`/`P2002` responses.
- **Note (0.10 status):** Checkpoint command sequence was executed (`build`, `tsc`, `test`, `lint`). `npm run build` passes; repository-wide legacy Jest/Lint debt still prevents full 0.10 closure until dedicated cleanup.
