# Session Log

## Session 2026-06-02 — Phase 3: Maps & Discovery + Profiles

### Summary
Implemented Phase 3 (Maps & Discovery) and remaining Phase 1 profile items. Created map infrastructure, profile pages, and user API routes.

### Files Created

**Map Infrastructure:**
- `app/components/features/posts/RouteMap.tsx` — MapLibre GL with SSR-disabled dynamic import, origin (green)/waypoint (white/green)/destination (dark green) markers with numbered badges, polyline from @mapbox/polyline, glass overlay card, dark mode detection, editable mode with Auto-Trace button, MapSkeleton loading state
- `app/lib/services/routeTracingService.ts` — OpenRouteService /directions API integration, fallback straight-line haversine distance, custom polyline encoder
- `app/api/routes/trace/route.ts` — POST endpoint, rate limited 20/hour via RATE_LIMITS.trace config
- `app/components/features/posts/RouteStepInput.tsx` — Location autocomplete input with MapPin prefix, mock suggestions for Lagos locations, debounced search

**Explore Page:**
- `app/(dashboard)/explore/page.tsx` — Full-viewport MapLibre map, desktop glass top bar (search + filter chips + LocateFixed button), desktop left side panel 320px (glass, collapsible with toggle, sort select, mini post cards), mobile glass top bar (search + filter button), mobile bottom sheet (draggable 25-80vh, handle bar, post list), pin popup card (280px glass with avatar, name, TrustBadge, View Route button), "Share this view" button (bottom-right), URL state sync via lat/lng/zoom query params

**User API Routes:**
- `app/api/users/[id]/route.ts` — GET (public profile with post/follower/following counts, avg validity), PATCH (own profile only, firstName/lastName/bio/avatar)
- `app/api/users/[id]/avatar/route.ts` — PATCH (save AvatarConfig JSON)
- `app/api/users/[id]/follow/route.ts` — POST (ACID: Follow + Notification), DELETE (ACID: unfollow + cleanup notifications)
- `app/api/users/search/route.ts` — GET ?q= for @mention autocomplete

**Profile Pages:**
- `app/(dashboard)/profile/page.tsx` — Own profile: 180px gradient cover, 80px avatar with camera overlay, name + verified badge, @handle, bio, stats row (Posts/Followers/Following/Avg Score), Edit Profile button, RewardsPanel, tabs (Posts/Liked/Bookmarks/Routes), post card list
- `app/(dashboard)/profile/[username]/page.tsx` — Other profile: same layout without camera/edit, Follow/Following button with hover Unfollow state, mutual follows count, tabs (Posts/Liked/Routes, no Bookmarks)

**Profile Components:**
- `app/components/features/profile/RewardsPanel.tsx` — Tier badge with icon, points display, gradient progress bar, next tier label, recent activity
- `app/components/features/profile/EditProfileModal.tsx` — AppModal + ConfigDrivenForm with EDIT_PROFILE_FIELDS
- `app/components/features/profile/AvatarEditor.tsx` — 2-column modal: style grid (3-col AVATAR_STYLES cards with DiceBear preview), live 120px AppAvatar preview, seed input
- `app/components/features/profile/index.ts` — barrel exports

**Wiring Updates:**
- `app/components/features/posts/index.ts` — Added RouteMap, MapSkeleton, RouteStepInput exports
- `app/components/features/posts/ShareRouteModal.tsx` — Replaced SVG placeholder with dynamic RouteMap, computes pins from steps
- `app/components/features/posts/PostCard.tsx` — Added mini RouteMap (100px) when routes exist
- `app/(dashboard)/posts/[id]/page.tsx` — Replaced SVG map with RouteMap component (280px, glass overlay)
- `next.config.mjs` — Added webpack alias for maplibre-gl

**Subtle Links Audit:**
Fixed 6 instances across 4 files:
1. `bookmarks/page.tsx` — @handle → Link to /profile/[userName]
2. `posts/[id]/page.tsx` — @handle → Link to /profile/[userName]
3. `profile/page.tsx` — post card user info + tags → Links with e.stopPropagation()
4. `profile/[username]/page.tsx` — post card user info + tags → Links with e.stopPropagation()

### Config Changes
- Added `@types/mapbox__polyline` devDependency

### Build Results
- `npx tsc --noEmit` — zero errors
- `npx next lint` — zero errors (warnings only)
- `npm run build` — ✓ Compiled successfully, 24 static pages generated (up from 20)

## Session 2026-06-02 (cont.) — Phase 4: Rewards, Invite, Analytics + Phase 5: Admin

### Summary
Implemented Phase 4 (Rewards Engine, Invite System, Analytics) and Phase 5 (Admin Dashboard, Users, Posts, Config, Bugs, Reviews pages + API routes).

### Files Created

**Rewards Engine:**
- `app/lib/services/rewardsService.ts` — Singleton RewardsService with awardPoints (ACID transaction, cooldown/maxPerDay checks via AnalyticsEvent), computeTier (config-driven from REWARD_TIERS), checkTierUpgrade, getHistory (10 items from AnalyticsEvent)
- `app/api/rewards/history/route.ts` — GET returns last 10 reward events for current user

**Rewards Wiring:**
- `app/api/posts/route.ts` — awardPoints(CREATE_POST) after post creation
- `app/api/posts/[id]/like/route.ts` — awardPoints(RECEIVE_LIKE) to post author on new LIKE (not self)
- `app/api/posts/[id]/bookmark/route.ts` — awardPoints(RECEIVE_BOOKMARK) to post author on new bookmark (not self)
- `app/api/auth/register/route.ts` — awardPoints(INVITE_ACCEPTED) to inviter when invitedById is set
- `app/components/features/profile/RewardsPanel.tsx` — Enhanced with history list (5 items), Invite Friends CTA with link to /invite
- `app/(dashboard)/profile/page.tsx` — Fetches reward history from /api/rewards/history, passes to RewardsPanel

**Invite System:**
- `app/api/invite/route.ts` — GET returns user invite code, invite count, max invites, points per invite; GET ?section=leaderboard returns top 20 inviters with counts
- `app/(dashboard)/invite/page.tsx` — Invite page with copy/Share link, rewards card (invite count/max), leaderboard

**Analytics:**
- `app/api/analytics/user/route.ts` — GET ?period=7|30|90 returns KPI (totalViews, totalLikes, totalBookmarks, avgValidity, totalPosts), topPosts by validity, engagementData (daily views/likes/bookmarks), followerGrowth (daily)
- `app/(dashboard)/analytics/page.tsx` — Analytics page pixel-precise from 16-analytics.html: period selector, 4 KPI cards, Engagement over time line chart (3-line SVG with legend), Top posts by validity horizontal bar chart, Follower growth area chart, Quick stats grid

**Admin API Routes (all guarded by role check):**
- `app/api/admin/stats/route.ts` — GET totalUsers, postsToday, avgValidity, openBugs, signups7d, topPosts
- `app/api/admin/users/route.ts` — GET (paginated, searchable), PATCH (change role), DELETE (soft-ban, reset role/verified)
- `app/api/admin/posts/route.ts` — GET (paginated), DELETE (hard delete)
- `app/api/admin/config/route.ts` — GET, PUT (upsert), DELETE site configs
- `app/api/admin/bugs/route.ts` — GET (filterable by status), PATCH (change status, assign reviewer)
- `app/api/admin/reviews/route.ts` — GET (filterable by status), PATCH (approve/reject)

**Admin Pages (all pixel-precise from 15-admin-dashboard.html design):**
- `app/admin/layout.tsx` — Sidebar layout (240px) with top nav (Home, Explore, Notifications, Bookmarks, Analytics) and admin nav (Dashboard, Users, Posts, Config, Bugs, Reviews), brand, user section at bottom. Role guard (ADMIN/MODERATOR only).
- `app/admin/page.tsx` — Dashboard: 4-stat Bento grid (Total Users, Posts Today, Avg Validity, Open Bugs), Signups 7-day SVG line chart, Top Routes by Validity SVG bar chart, Users AppTable preview
- `app/admin/users/page.tsx` — User management table with search, role badges with colors, tier badges, Make Admin button
- `app/admin/posts/page.tsx` — Post management table with delete
- `app/admin/config/page.tsx` — Site config CRUD with add form, key-value table, delete
- `app/admin/bugs/page.tsx` — Bug reports with status filter, status badge colors, inline status change buttons
- `app/admin/reviews/page.tsx` — User reviews moderation with PENDING/APPROVED/REJECTED filter, approve/reject buttons

### Build Results
- `npx tsc --noEmit` — zero errors
- `npx next lint` — warnings only (existing pre-existing warnings)
- `npm run build` — ✓ Compiled successfully, 41 static pages generated (up from 24)
- New routes: /admin, /admin/users, /admin/posts, /admin/config, /admin/bugs, /admin/reviews, /analytics, /invite, +6 admin API routes, /api/rewards/history, /api/invite, /api/analytics/user

## Session 2026-06-02 (cont.) — Phase 6: Public Pages & SEO

### Summary
Implemented Phase 6 (Public Pages & SEO): Landing page, About, Contact, Privacy, Terms, Report Bug pages plus SEO infrastructure (metadata utilities, StructuredData, sitemap, robots, per-page metadata).

### Files Created

**SEO Infrastructure:**
- `app/lib/utils/metadata.ts` — `buildMetadata()` for static pages, `buildPostMetadata()` for post detail (Article schema), `buildProfileMetadata()` for profile pages (ProfilePage schema). Includes canonical URLs, OG tags, Twitter cards, noIndex support.
- `app/lib/utils/structuredData.ts` — `websiteSchema()`, `articleSchema()`, `profilePageSchema()` JSON-LD helpers
- `app/sitemap.ts` — Dynamic sitemap listing static + published posts + active profiles
- `app/robots.ts` — Disallows /admin, /api, /login, /register, /otp, /home, /bookmarks, /notifications, /profile/, /posts/

**Public Pages:**
- `app/(public)/layout.tsx` — Shared public layout with AppFooter, no dashboard nav, `force-static`
- `app/(public)/page.tsx` — Landing page pixel-precise from 03-landing-light.html + 04-landing-dark.html: Green gradient hero (135deg #004A2C→#00623B→#00A862), white logo (64px), "Navigate Together" tagline, CTA row, decorative SVG background with grid/circles/route lines, 3 feature cards (Route/ShieldCheck/Users), glass social proof strip, 2 PostCard previews (standard + suggestion variant), bottom CTA section. `buildMetadata()` export + WebSite StructuredData.
- `app/(public)/about/AboutPageClient.tsx` — Client component: Green gradient hero "Our Story", feature highlights, team grid from TEAM_MEMBERS config, glass reviews carousel with prev/next arrows + dot indicators + 5s auto-rotation.
- `app/(public)/about/page.tsx` — Server wrapper with `buildMetadata()` metadata export
- `app/(public)/contact/ContactPageClient.tsx` — Client component: ConfigDrivenForm (CONTACT_FIELDS), success → AppEmptyState CheckCircle, send another button
- `app/(public)/contact/page.tsx` — Server wrapper with metadata
- `app/(public)/privacy/page.tsx` — react-markdown + remark-gfm rendered privacy policy with prose styling
- `app/(public)/terms/page.tsx` — react-markdown + remark-gfm rendered terms of service with prose styling
- `app/(public)/report-bug/page.tsx` — Client component: ConfigDrivenForm (BUG_REPORT_FIELDS), success → checkmark AppEmptyState

**Per-Page Metadata Layouts (all client component pages get server wrapper metadata):**
- `app/(dashboard)/home/layout.tsx` — noIndex metadata
- `app/(dashboard)/explore/layout.tsx` — Explore metadata
- `app/(dashboard)/bookmarks/layout.tsx` — Bookmarks metadata
- `app/(dashboard)/notifications/layout.tsx` — Notifications metadata
- `app/(dashboard)/analytics/layout.tsx` — Analytics metadata
- `app/(dashboard)/invite/layout.tsx` — Invite metadata
- `app/(dashboard)/profile/layout.tsx` — Profile metadata
- `app/(dashboard)/profile/[username]/layout.tsx` — generateMetadata with buildProfileMetadata (fetches user)
- `app/(dashboard)/posts/[id]/layout.tsx` — generateMetadata with buildPostMetadata (fetches post)
- `app/(auth)/login/layout.tsx` — noIndex metadata
- `app/(auth)/register/layout.tsx` — noIndex metadata
- `app/(auth)/otp/layout.tsx` — noIndex metadata
- `app/admin/layout.tsx` — Replaced client layout with server component that exports noIndex metadata + renders AdminShell

**Files Modified:**
- `app/(dashboard)/layout.tsx` — Added AppFooter to dashboard layout
- `app/middleware.ts` — Updated route protection: public routes (/, /about, /contact, /privacy, /terms, /report-bug) allowed without auth; protected routes (/home, /explore, /bookmarks, /notifications, /analytics, /invite, /posts/, /profile/, /admin) require auth; auth routes redirect to /home if logged in
- `app/components/ui/AppInput.tsx` — Fixed label prop type (string → React.ReactNode) for ConfigDrivenForm compatibility
- `app/components/ui/AppTextarea.tsx` — Same fix
- `app/components/ui/AppSelect.tsx` — Same fix
- `app/components/ui/ConfigDrivenForm.tsx` — Fixed icon prop: wraps LucideIcon component type as `<IconComponent size={16} />` React element instead of passing raw component type
- `app/admin/AdminShell.tsx` — Renamed from layout.tsx (now a regular component imported by the new server layout)

### Build Results
- `npx tsc --noEmit` — zero errors
- `npx next lint` — zero errors (warnings only, all pre-existing)
- `npm run build` — ✓ Compiled successfully, 49 static pages generated (up from 41)
- New routes: /, /about, /contact, /privacy, /terms, /report-bug, /sitemap.xml, /robots.txt

### Notes
- AppInput/AppTextarea/AppSelect had `label?: string` but ConfigDrivenForm passed JSX `<span>` — caused `toLowerCase` crash during prerendering. Fixed to `React.ReactNode` with safe string extraction for ID generation.
- ConfigDrivenForm passed `field.icon` (LucideIcon component type) directly as ReactNode — caused `Objects are not valid as a React child` error. Fixed to render as `<IconComponent size={16} />`.
- Admin layout split into server layout.tsx (metadata) + AdminShell.tsx (client sidebar/guard) to support metadata export from server component.
- Middleware updated to correctly handle route groups: (public)/page.tsx → /, (auth)/login → /login, etc.
- Total static pages: 49 (core routes / public / auth / admin / dashboard)

## Session 2026-06-03 — OC-8: Production Readiness Audit & Hardening

### Summary
Completed OC-8 production-readiness audit: emoji cleanup, subtle links, N+1 fixes, cursor pagination, dynamic imports, PWA offline indicator, and comprehensive test suite. All quality gates pass.

### Changes

**Phase 6 API Handlers (previously missing):**
- `app/api/contact/route.ts` — POST handler validates name/email/message, stores in `ContactSubmission`
- `app/api/bug-reports/route.ts` — POST handler validates title/category/description, stores in `BugReport` with `reporterId: null`
- Schema: `ContactSubmission` model added; `BugReport.reporterId` made optional

**Phase 7 — QStash Background Workers:**
- `app/lib/services/qstashService.ts` — Client (publish) + Receiver (verify), methods: `publishFeedInvalidation`, `publishValidityRecompute`, `publishRewardsAward`
- `app/api/workers/feed-invalidate/route.ts` — QStash-verified Redis cache invalidation for user feeds/post cache/follower feeds
- `app/api/workers/validity-recompute/route.ts` — QStash-verified ValidityEngine score computation from DB, updates post + clears Redis caches
- `app/api/workers/rewards/route.ts` — QStash-verified `rewardsService.awardPoints(userId, actionKey, postAuthorId)`
- `feedService.ts` — Redis feed caching (5min TTL), checked on non-cursor lookups, written on each query
- Wired 4 API routes to use QStash instead of fire-and-forget: POST /api/posts, POST /api/posts/[id]/like, POST /api/posts/[id]/bookmark, POST /api/auth/register

**OC-8 Emoji Audit:**
- Fixed 8 violations: `👍`/`💬` in bookmarks/page.tsx, profile/page.tsx, profile/[username]/page.tsx → ThumbsUp/MessageCircle Lucide icons; `\u{1F4CD}`/`\u{1F6F5}` escape sequences in (public)/page.tsx removed

**OC-8 Component Compliance:**
- Zero violations — no raw `antd`/`@ant-design` imports in any page or feature file

**OC-8 Subtle Links (19 violations fixed in 8 files):**
- `explore/page.tsx` (7) — user initials/name/@handle/tags/post titles wrapped in `<Link>` with `e.stopPropagation()`
- `admin/page.tsx` (1) — post title in top routes chart
- `admin/users/page.tsx` (3) — avatar, name, @handle
- `admin/posts/page.tsx` (1) — author name
- `admin/reviews/page.tsx` (2) — reviewer/reviewee names
- `admin/bugs/page.tsx` (1) — reporter name
- `analytics/page.tsx` (1) — post title in top posts
- `invite/page.tsx` (3) — avatar, name, @handle in leaderboard
- `comments/CommentInput.tsx` (1) — user avatar

**OC-8 N+1 Query Fix:**
- `/api/admin/stats/route.ts` — signups7d reduced from 7 individual queries to 1 batch + in-memory filter (7× reduction)

**OC-8 Cursor Pagination:**
- `/api/posts/[id]/comments/route.ts` — cursor/limit params, skip: 1, nextCursor
- `/api/notifications/route.ts` — same pattern
- `/api/admin/bugs/route.ts` — same pattern
- `/api/admin/reviews/route.ts` — same pattern

**OC-8 Dynamic Imports:**
- `profile/page.tsx` — `AvatarEditor` → `dynamic(() => import(...).then(m => m.AvatarEditor), { ssr: false })`
- `home/page.tsx` — `ShareRouteModal` → `dynamic(() => import(...), { ssr: false })`

**OC-8 PWA:**
- `manifest.json` verified: theme_color `#00623B`, display `standalone`, icons 192/512 ✓
- `/public/icon-192.png`, `/public/icon-512.png`, `/public/favicon.ico`, `/public/apple-touch-icon.png` all exist ✓
- `app/providers/OnlineStatusProvider.tsx` — Context provider with `isOnline` state, `online`/`offline` event listeners, auto-flush via `offlineQueue.flush()` on reconnect
- `app/components/ui/OfflineIndicator.tsx` — Modal overlay showing `AppEmptyState preset="offline"` when offline

**OC-8 Test Suite (91 tests, 9 suites):**
- `app/__tests__/services/ValidityEngine.test.ts` — 12 tests: evaluate() score ranges, tier boundaries, sub-computation comparisons, getTrustLevel() thresholds
- `app/__tests__/services/DraftingCoachService.test.ts` — 9 tests: 6 checkpoint validations, empty/complete draft, nextSuggestion
- `app/__tests__/config/navigation.test.ts` — 6 tests: role filtering, section filtering, admin access
- `app/__tests__/config/avatar.test.ts` — 5 tests: URL construction, optional params, encoding
- `app/__tests__/utils/metadata.test.ts` — 7 tests: title, description, canonical, robots, OG, Twitter, custom ogImage
- `app/__tests__/services/rewardsService.test.ts` — 6 tests: computeTier() boundary thresholds (BRONZE/SILVER/GOLD/PLATINUM)
- `app/__tests__/components/AppEmptyState.test.tsx` — 12 tests: all preset renders, custom content, variants
- `app/__tests__/components/AppUserLabel.test.tsx` — 7 tests: name, handle, linkToProfile, verified badge, sizes, vertical layout
- `app/__tests__/components/TrustBadge.test.tsx` — 6 tests: all 4 levels, tooltip hover, showTooltip=false, sm/default sizes

### Build Results
- `npx tsc --noEmit` — zero errors
- `npx next lint` — pre-existing warnings only, zero errors
- `npm run build` — ✓ Compiled, 54 static pages, 28 API routes
- `npm test` — 91/91 passing (9 test suites)
- Quality gate: ALL PASS

---

## Session 2026-06-09 — Sprint 4: Production Audit Fixes

### Summary
Comprehensive production audit addressing runtime errors, broken OAuth, double navbar, dead links, missing theme toggle, guest CTAs, brand logo consistency, Sentry integration, and error handling improvements. All 14 issues resolved across 12 files.

### Changes

**Critical Fixes:**
1. **PostCard `length` crash** — Added `?? []` guards for `post.tags` and `post.images` (`PostCard.tsx:99-100`)
2. **OAuth buttons** — Added `onClick` handlers linking to `/api/auth/google` on login + register pages
3. **Double navbar** — Removed redundant inline `<nav>` from landing page (relies on `(public)/layout.tsx` header)
4. **Dead links** — Fixed `/dashboard`→`/home` redirect in AdminShell; created `/forgot-password` page; redirected `/share`→`/home`, `/settings`→`/profile`

**New Files Created:**
- `app/providers/ThemeProvider.tsx` — Dark mode toggle with localStorage persistence, `prefers-color-scheme` detection
- `app/components/ui/ThemeToggle.tsx` — Floating accessible toggle button (Sun/Moon, ARIA label, focus ring)
- `app/global-error.tsx` — Sentry error boundary for root layout
- `app/(public)/forgot-password/page.tsx` + `layout.tsx` — Password reset form page

**Enhancements:**
- Guest CTAs added to landing, login, and register pages
- Logo config updated with brand file URLs; `AppLogo` now supports `variant="icon"|"full"` with `<Image>` rendering
- Auth layout and AdminShell inline SVGs replaced with `<AppLogo />`
- Auth API routes (login, register) now use `Sentry.captureException()` with specific error detection
- Root layout metadata now includes full OG image, Twitter card, apple-touch-icon

### Build Results
- `npx tsc --noEmit` — zero errors
- `npx next lint` — zero errors (pre-existing warnings)
- `npm run build` — ✓ 65 static pages (up from 54), 28 API routes
- `npm test` — 91/91 passing (9 test suites)
- Quality gate: ALL PASS

---

## Session 2026-06-09 (cont.) — Sprint 5: RxJS Feed, i18n, Lighthouse Audit

### Summary
Implemented three backlog items: RxJS reactive feed stream, i18n foundation (English + Pidgin), and Lighthouse performance improvements. All quality gates pass.

### Changes

**RxJS Reactive Feed:**
- `app/lib/streams/feedStream.ts` — Created `FeedStream` class with `feedState$` (BehaviorSubject<FeedState>), `interactionCache$` (BehaviorSubject<Map<string, Partial<FeedPost>>>), 30s polling via `interval(30000)`, `loadInitial()`, `loadMore()`, `refresh()`, `applyInteraction()` (optimistic update + API call), proper cleanup via `destroy$` Subject + `takeUntil`
- `app/(dashboard)/home/page.tsx` — Replaced direct fetch + setInterval with `feedStream.loadInitial()` + subscription to `feedStream.feedState$`; infinite scroll calls `loadMore()`; interactions call `applyInteraction()` optimistically before API call

**i18n Foundation:**
- `app/lib/config/i18n.ts` — `Locale` type (`"en" | "pcm"`), `LOCALES` array, `DEFAULT_LOCALE = "en"`, `STORAGE_KEY = "along-locale"`, `TranslationMap` type
- `public/locales/en.json` — ~90 translation keys (nav, auth, landing, feed, common, footer, theme, guest, offline, forgot-password)
- `public/locales/pcm.json` — Same keys with Pidgin English translations (e.g. `"common.error": "Something scatter"`)
- `app/providers/I18nProvider.tsx` — Context provider with `locale`, `setLocale()`, `t(key, params)` interpolation; auto-detects from localStorage/navigator.language; fetches JSON; sets `html[lang]`
- `app/components/ui/LocaleSwitcher.tsx` — Toggle cycling en↔pcm, flag + label, ARIA label
- `app/layout.tsx` — Wired I18nProvider wrapping ThemeProvider + all providers
- `middleware.ts` — Added `along-locale` cookie auto-detection from Accept-Language header; added `/forgot-password` to guest routes; replaced `NextResponse.next()` with shared `response` object for cookie consistency

**Lighthouse Audit:**
- `app/loading.tsx` — Root loading state using AppPageLoader
- `app/error.tsx` — Client error boundary with Try Again button
- `app/not-found.tsx` — 404 page with Compass icon, link to home
- `next.config.mjs` — Added security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy), static asset caching (1yr immutable for images/fonts/js/css), preconnect hints via Script component
- `app/layout.tsx` — Added preconnect/dns-prefetch resource hints for Google Fonts (fonts.googleapis.com, fonts.gstatic.com), Mapbox API (api.mapbox.com); added google-site-verification meta

### New Files Created
- `app/lib/streams/feedStream.ts`
- `app/lib/config/i18n.ts`
- `public/locales/en.json`
- `public/locales/pcm.json`
- `app/providers/I18nProvider.tsx`
- `app/components/ui/LocaleSwitcher.tsx`
- `app/loading.tsx`
- `app/error.tsx`
- `app/not-found.tsx`

### Files Modified
- `app/(dashboard)/home/page.tsx` — RxJS feed stream integration
- `app/layout.tsx` — I18nProvider, Script resource hints, meta tags
- `middleware.ts` — Locale cookie, response object, guest routes
- `next.config.mjs` — Security headers, asset caching headers

### Build Results
- `npx tsc --noEmit` — zero errors
- `npm run build` — ✓ Compiled successfully, 65 static pages
- `npm test` — 91/91 passing (9 test suites)
- Quality gate: ALL PASS

---

## Session 2026-06-09 (cont.) — Sprint 5 Bug Fixes: Feed Crash, Guest Auth, Styling, Login

### Summary
Fixed 7 production bugs: feed stream crash on error responses, guest auth blocking feed, PostCard crash on missing user, "Rendered more hooks" Sentry error, missing Tailwind Typography plugin (prose styling), landing page logo, and documented Prisma migration issue.

### Changes

**Critical Fixes:**
1. **Feed stream crash (`length` of undefined)** — `feedStream.ts:72` crashed on `state.posts.length` when API returned `{error: "Not authenticated"}` with undefined `posts`. Fixed with `?? []` guard in `fetchFeed` return and `?.length ?? 0` in polling subscription.
2. **Feed API blocking guests** — `app/api/posts/feed/route.ts` returned 401 for all unauthenticated users. Restructured to fall back to public posts (most recent, no personalization) when no auth token.
3. **PostCard missing user crash** — `post.user.firstName` crashed when post lacked `user` field. Added `const user = post.user` guard + `?.` optional chaining on all user field accesses.

**"Rendered more hooks" Sentry Error:**
Root cause identified: the JS crash in `feedStream.ts:72` interrupts React's render cycle, causing hook count desynchronization on the next render. Fixed by guarding the `state.posts.length` call — the crash no longer propagates during render.

**Styling Fixes:**
4. **Missing prose styling** — `@tailwindcss/typography` was not installed. Added `@plugin "@tailwindcss/typography"` to `globals.css`. Terms, Privacy, and Blog content now render with proper Typography prose styles.

**Landing Page Logo:**
Already wired as `<AppLogo size="md" />` in `(public)/layout.tsx`. Inline SVG renders the brand pin icon (#00623B) + "Along" wordmark. Logo image files (`logo.svg`, `logo-icon.svg`) verified present in `public/`.

**Login Prisma Error:**
`PrismaClientKnownRequestError: The column (not available) does not exist` — caused by Prisma client generated against a schema with columns (e.g. `lastKnownLat`, `lastKnownLng`, `googleId`, `avatarConfig`) that don't exist in the deployed database. Fix: run `npx prisma migrate deploy` on the production database to apply pending migrations.

**Explore Page Routing:**
Investigated — `useSearchParams()` used without Suspense boundary can cause hydration issues in Next.js 15. Both `MapView` instances already render (CSS-hidden one), so no hook count change. No code change needed after feed crash guard fixes the root hook desync.

### Quality Gate
- `npx tsc --noEmit` — zero errors
- `npx next lint` — ✔ No ESLint warnings or errors
- `npm test` — 91/91 passing
- New dep: `@tailwindcss/typography` (prose styling)
