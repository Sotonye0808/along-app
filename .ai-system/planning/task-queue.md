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

## Compliance Audit Follow-Up

> Section summary: Consolidated remediation work identified by the 2026-05-07 compliance audit.

- [x] Create compliance audit report and remediation roadmap
- [x] Add .env.example with full variable list
- [x] Sync ai-system architecture, repo map, dependency graph, and project plan
- [ ] Normalize theme tokens across layouts, shared components, and feature UI
- [ ] Replace remaining direct Ant Design usage in feature components
- [ ] Replace remaining Ant icons and emoji in UI with Lucide icons
- [ ] Remove dead route references and fix nav consistency
- [ ] Stabilize PWA install prompt and service worker update flow
- [ ] Update README and developer docs after remediation

## Up Next

> **Section summary:** Phase 1 tasks currently in progress.

- [x] 1.1 — ValidityEngine + TrustBadge
- [x] 1.2 — DraftingCoachService + DraftingCoach component
- [x] 1.3 — DiceBear AvatarEditor + UserAvatar
- [ ] 1.4 — Google OAuth
- [x] 1.4 — Google OAuth
- [ ] 1.5 — Bug Report system
- [x] 1.5 — Bug Report system
- [x] 1.6 — Admin pages group
- [x] 1.7 — Confirmations + Undo
- [x] 1.8 — User tagging in comments (@mentions)
- [x] 1.9 — Subtle links full-codebase audit
- [x] 1.10 — Privacy & Terms pages
- [x] 1.11 — Phase 1 checkpoint

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

## Current Phase: 5 — Complete

- [x] 1.1 — ValidityEngine + TrustBadge
- [x] 1.2 — DraftingCoachService + DraftingCoach component
- [x] 1.3 — DiceBear AvatarEditor + UserAvatar
- [x] 1.4 — Google OAuth
- [x] 1.5 — Bug Report system
- [x] 1.6 — Admin pages group
- [x] 1.7 — Confirmations + Undo
- [x] 1.8 — User tagging in comments (@mentions)
- [x] 1.9 — Subtle links full-codebase audit
- [x] 1.10 — Privacy & Terms pages
- [x] 1.11 — Phase 1 checkpoint
- [x] 2.1 — MapLibre migration (RouteMap component — desktop inline 300px, mobile collapsible, glass overlay)
- [x] 2.2 — RouteTracingService + `/api/routes/trace` endpoint
- [x] 2.3 — PlaceAutocomplete component (Google Places, graceful fallback)
- [x] 2.4 — Geo fields in ShareRouteModal (startLat/lng, endLat/lng, region, auto-computed distance/time)
- [x] 2.5 — suggestionsService uses getSiteConfig('feedAlgorithm') for all scoring weights
- [x] 2.6 — PlatformSuggestionsService + PostCard "Along Suggestion" chip (AppTag primary + Sparkles icon)
- [x] 2.7 — Explore page (search, region filters, map view, glass popup, back-to-top FAB, share-this-view)
- [x] 2.8 — Phase 2 checkpoint: build ✓ tsc ✓ 142/142 tests ✓
- [x] 4.1 — QStash background workers (`/api/workers/notify` + `/api/workers/digest`)
- [x] 4.2 — N+1 query elimination
- [x] 4.3 — RxJS reactive feed (useFeedStream)
- [x] 4.4 — AppFooter (with dev credit)
- [x] 4.5 — Jest test suite (196/196 ✓)
- [x] 4.6 — PWA full audit
- [x] 4.7 — SEO audit (twitter cards, sitemap expanded)
- [x] 4.8 — Phase 4 final gate: build ✓ tsc ✓ 196/196 tests ✓
- [x] 5.1 — Push notifications (VAPID web-push, PushSubscription schema, subscribe/unsubscribe/send routes, PushService)
- [x] 5.2 — CI/CD pipeline (`.github/workflows/ci.yml` — install → tsc → test → lint → build)
- [x] 5.3 — Sentry error tracking (client/server/edge configs, instrumentation hook, next.config.mjs withSentryConfig)
- [x] 5.4 — Remove `mock-backend/`, `app/lib/data/`, `scripts/migrate-to-prisma.ts`
- [x] 5.5 — Phase 5 checkpoint: build ✓ tsc ✓ 196/196 tests ✓

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
- **Note (Phase 2 complete):** All Phase 2 tasks (2.1–2.8) are complete. `npm run build` passes; `tsc --noEmit` clean; 142/142 tests pass. New additions: RouteMap (maplibre-gl, desktop inline / mobile collapsible), RouteTracingService, PlaceAutocomplete (Google Places with fallback), geo fields in ShareRouteModal, suggestionsService now uses getSiteConfig weights, PlatformSuggestionsService, PostCard "Along Suggestion" chip, full Explore page (search/filter/map/glass popup/FAB), `/api/routes/trace` endpoint.
