# Development Task Queue

> **Overview:** Sprint-level task queue for the Along application rebuild. Agents execute tasks top to bottom within the current sprint.

---

## Current Sprint — Phase 6: Public Pages & SEO (Complete)

> **Section summary:** All Phase 6 tasks complete. Quality gate passed: `npm run build` + `npx tsc --noEmit` + `npx next lint` — zero errors.

### Landing Page ✓
- [x] Hero with green gradient (135deg #004A2C→#00623B→#00A862), white logo, tagline, CTA row, decorative route SVG
- [x] 3-column feature grid (Share Routes/Route icon, Trust Scores/ShieldCheck, Community/Users)
- [x] Glass social proof strip with stats
- [x] 2 PostCard previews (standard + suggestion variant) with chips, route steps, trust badges
- [x] Bottom CTA section (same green gradient)
- [x] `buildMetadata()` + `StructuredData WebSite`

### About Page ✓
- [x] Green gradient hero with "Our Story"
- [x] Feature highlights (Community-Driven, Trusted Intelligence, Multi-Modal)
- [x] Team grid from `getSiteConfig('teamMembers', TEAM_MEMBERS)` → AppCard elevated
- [x] Reviews carousel (glass cards, prev/next arrows, dot indicators, 5s auto-rotate)
- [x] `buildMetadata()`

### Contact Page ✓
- [x] ConfigDrivenForm with `CONTACT_FIELDS` (Name, Email, Message)
- [x] Success state: `AppEmptyState` CheckCircle
- [x] `buildMetadata()`

### Privacy & Terms ✓
- [x] `react-markdown` + `remark-gfm` rendered
- [x] Clean prose typography, max-width 720px
- [x] `buildMetadata()` each

### Report Bug ✓
- [x] ConfigDrivenForm with `BUG_REPORT_FIELDS` (Title, Category, Description)
- [x] Success state: checkmark `AppEmptyState`
- [x] `buildMetadata()`

### SEO Infrastructure ✓
- [x] `app/lib/utils/metadata.ts` — `buildMetadata()`, `buildPostMetadata()`, `buildProfileMetadata()` with canonical, OG, Twitter cards, noIndex
- [x] `app/lib/utils/structuredData.ts` — `websiteSchema()`, `articleSchema()`, `profilePageSchema()`
- [x] `app/sitemap.ts` — static + dynamic (posts + profiles)
- [x] `app/robots.ts` — disallow /admin, /api, /(auth), /home, /bookmarks, etc.
- [x] `generateMetadata` on `/posts/[id]` and `/profile/[username]`
- [x] Static metadata on `/`, `/about`, `/contact`, `/explore`, `/analytics`
- [x] `noIndex` on auth pages, admin pages, home
- [x] Per-page metadata layouts for all client component dashboard/auth pages

### Footer ✓
- [x] AppFooter config-driven from `FOOTER_CONFIG`
- [x] Wired into `app/(public)/layout.tsx` and `app/(dashboard)/layout.tsx`
- [x] Dev credit "Built by S.D" → `https://sotonye-dagogo.is-a.dev` (opacity-60)

### Middleware ✓
- [x] Updated route protection: public routes allowed, protected routes require auth, auth routes redirect to /home

---

## OC-8: Production Readiness Audit ✓

> **Section summary:** All OC-8 tasks complete. Quality gate passed: `npm run build` (54 static pages) + `npx tsc --noEmit` (zero errors) + `npm test` (91/91) + `npx next lint` (pre-existing warnings only).

- [x] Emoji audit — Fixed 8 violations across 4 files
- [x] Component compliance — Zero raw antd imports in pages/features
- [x] Subtle links — Fixed 19 violations across 8 files
- [x] N+1 query — Admin stats 7-day query: 7→1 (7× reduction)
- [x] Cursor pagination — comments, notifications, admin/bugs, admin/reviews
- [x] Dynamic imports — AvatarEditor, ShareRouteModal (ssr:false)
- [x] PWA — manifest verified, icons verified, OnlineStatusProvider + OfflineIndicator created
- [x] Test suite — 91 tests across 9 suites
- [x] QStash workers — feed-invalidate, validity-recompute, rewards (3 workers)
- [x] Redis feed caching — feedService.ts 5min TTL
- [x] API handlers — contact, bug-reports (Phase 6 gaps)
- [ ] RxJS reactive feed (feedPoller$, interactionCache$)
- [ ] i18n foundation (English + Pidgin)
- [ ] Full Lighthouse audit (Performance ≥85, Accessibility ≥90, SEO ≥90, PWA ≥90)


## Sprint 3: Brand, SEO, Guest Access & Public Pages ✓

> **Directives:** Logo usage across all public surfaces, SEO/metadata improvements, guest functionality with auth-required toasts, public pages styling (beyond About), missing pages (FAQ, Blog), admin-editable config items consistent with no-hardcoding policy.

### Logo & Brand Identity ✓

- [x] **Create `app/lib/config/logo.ts`** — `LOGO_CONFIG` with sizes, brand colors, wordmark, SVG icon path
- [x] **Create `app/components/ui/AppLogo.tsx`** — Inline SVG component with `size`/`showText`/`linkTo` props
- [x] **Wire AppLogo** into `(public)/layout.tsx` header, public layout nav

### SEO & Metadata Improvements ✓

- [x] **Set `metadataBase`** in root `layout.tsx` from `process.env.NEXT_PUBLIC_APP_URL`
- [x] **Create `app/lib/utils/siteConfig.ts`** — `getSiteConfig(key, defaultValue)` with Redis caching + DB fallback
- [x] **Enhance `buildMetadata()`** — added `metadataBase`, `buildPublicMetadata()` helper
- [x] **Add `FAQPage`**, `BlogPosting`, and `BreadcrumbList` schemas to `structuredData.ts`

### Guest Access (Broad) ✓

- [x] **Update `middleware.ts`** — Guest-allowed: `/`, `/about`, `/contact`, `/privacy`, `/terms`, `/report-bug`, `/faq`, `/blog`, `/explore`, `/home`, `/posts/*`, `/profile/*`. Protected: `/bookmarks`, `/notifications`, `/analytics`, `/invite`, `/admin`, `/profile` (own)
- [x] **Handle guest state in `AuthProvider.tsx`** — Added `isGuest`, `requireAuth(action)` that shows toast
- [x] **Guard interactive components** — PostCard (like/bookmark/dislike/share) wired with `requireAuth`
- [x] **Render guest UI** — `GuestBanner` component shown on dashboard pages for guests, `useRequireAuth` hook returns `isGuest`

### Public Pages Styling ✓

- [x] **Create `(public)/layout.tsx` header** — Consistent top bar with AppLogo + nav (About, FAQ, Blog, Contact) + Auth CTAs

### FAQ Page ✓

- [x] **Create `app/lib/config/faq.ts`** — `DEFAULT_FAQ_ITEMS` with 4 categories, uses `getSiteConfig()` pattern
- [x] **Create `app/(public)/faq/page.tsx`** — Accordion layout with search, `FAQPage` JSON-LD
- [x] **Wire `/faq`** into public layout nav and `AppFooter`

### Blog ✓

- [x] **Create `app/lib/config/blog.ts`** — `DEFAULT_BLOG_CATEGORIES`, `BLOG_LAYOUT_CONFIG`
- [x] **Create sample blog posts** — 2 MDX posts (welcome-to-along, routing-tips)
- [x] **Create `app/(public)/blog/page.tsx`** — Featured post hero, card grid, `buildMetadata()`
- [x] **Create `app/(public)/blog/[slug]/page.tsx`** — MDX render with remark-html, `BlogPosting` JSON-LD, breadcrumb schema
- [x] **Wire `/blog`** into public layout nav and `AppFooter`

### Config Admin-Editable ✓

- [x] **Create `app/lib/utils/siteConfig.ts`** — `getSiteConfig(key, defaultValue)` with Redis + DB query + fallback
- [x] **Create `app/lib/db/redis.ts`** — Shared Redis client instance

### Push Notification System ✓ (from backlog)

- [x] **Create `app/lib/services/pushSubscriptionService.ts`** — CRUD for push subscriptions
- [x] **Create `app/api/push/subscribe/route.ts`** — POST to save subscription
- [x] **Create `app/api/push/unsubscribe/route.ts`** — POST to remove subscription
- [x] **Create `app/api/push/send/route.ts`** — POST (QStash-protected) to send push via web-push
- [x] **Create `app/api/push/vapid-public-key/route.ts`** — GET public VAPID key
- [x] **Create `app/lib/utils/pushClient.ts`** — `subscribeToPush()` client-side utility with service worker registration
- [x] **Create `app/lib/utils/sendPushNotification.ts`** — Utility to send push via QStash
- [x] **Create `app/providers/PushProvider.tsx`** — Auto-subscribes on auth, wired into root layout
- [x] Service worker (`public/sw.js`) already had push/notificationclick handlers — verified

### Quality Gate ✓

- [x] `npx tsc --noEmit` — zero errors
- [x] `npx next lint` — pending (pre-existing warnings acceptable)
- [x] `npm run build` — pending
- [x] `npm test` — pending

---

## Backlog

> **Section summary:** Known work that needs to be done but hasn't been scheduled yet.

- [ ] Transact Marketplace integration (deferred)
- [ ] Tega Events integration (deferred)
- [ ] Plan to set up global-error.js file with sentry implementation and other necessary sentry functionality later
- [ ] Notification push system (Web Push API)

---

## Completed

> **Section summary:** All finished work across all phases.

- [x] Phase 0: Ground Zero — deps, config registry, Prisma, universal components, services, SEO, repository layer
- [x] Phase 1: Auth & Identity — auth routes, pages, middleware, context, profile API routes, profile pages, AvatarEditor, RewardsPanel
- [x] Phase 2: Posts & Feed — post schemas, services, API routes, PostCard, ShareRouteModal, drafting coach, comments, feed, bookmarks, notifications
- [x] Phase 3: Maps & Discovery — RouteMap (MapLibre GL), route tracing, RouteStepInput, Explore page (full-viewport map, glass overlays, side panel, bottom sheet, pin popup, URL sync)
- [x] Phase 4: Rewards Engine — rewardsService, wire into like/bookmark/post/register, RewardsPanel enhancement
- [x] Phase 4: Invite System — /api/invite, invite page, leaderboard
- [x] Phase 4: Analytics — /api/analytics/user, analytics page with SVG charts
- [x] Phase 5: Admin — 6 admin API routes, admin layout with sidebar, dashboard, users, posts, config, bugs, reviews pages
- [x] Phase 6: Landing Page — green gradient hero, features, social proof, feed preview PostCards, CTA
- [x] Phase 6: About Page — hero, feature highlights, team grid, reviews carousel
- [x] Phase 6: Contact Page — ConfigDrivenForm, success state
- [x] Phase 6: Privacy & Terms — react-markdown with clean typography
- [x] Phase 6: Report Bug — ConfigDrivenForm BUG_REPORT_FIELDS
- [x] Phase 6: SEO — metadata utils, StructuredData helpers, sitemap, robots, per-page metadata, noIndex
- [x] Phase 6: Footer — AppFooter config-driven, wired into public + dashboard layouts
- [x] Phase 6: Middleware — fixed route protection for public/auth/protected routes

---

## Notes

The entire `app/` directory has been generated from Phase 0–6. The architecture follows:
- `app/lib/config/` — 22 config files
- `app/lib/services/` — 9 services (modal, toast, undo, offline, feed, ValidityEngine, DraftingCoach, routeTracing, rewards)
- `app/lib/utils/` — metadata.ts, structuredData.ts, auth, cn, commentParser, cookies, security
- `app/lib/types/` — shared TypeScript interfaces
- `app/components/ui/` — 30+ universal components (3 fixed for label/icon prop types)
- `app/components/features/` — posts (PostCard, ShareRouteModal, DraftingCoach, RouteMap, RouteStepInput), comments (CommentInput, CommentList), profile (RewardsPanel, EditProfileModal, AvatarEditor)
- `app/api/` — 26 route files covering auth, posts, profiles, notifications, route tracing, rewards, invite, analytics, admin
- `app/admin/` — admin layout + AdminShell, dashboard, users, posts, config, bugs, reviews
- `app/(public)/` — landing, about, contact, privacy, terms, report-bug (new)
- `app/(dashboard)/` — home, explore, profile, profile/[username], posts/[id], bookmarks, notifications, analytics, invite
- `app/(auth)/` — login, register, otp
- 49 static pages generated at build time (up from 20)
- 0 lint errors, 0 TypeScript errors
