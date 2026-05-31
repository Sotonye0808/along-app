# Repair System — Error Knowledge Base

> **Overview:** A living knowledge base of errors encountered during Along App development, their root causes, and how they were fixed. Agents should consult this before diagnosing new errors. Every fixed bug should be logged here to prevent recurrence. The project uses Next.js 15+, TypeScript strict mode, Prisma, Redis, Cloudinary, and Ant Design.

---

## How to Use This File

- **Before debugging:** Search this file for patterns matching your current error
- **After fixing a bug:** Add an entry using the template at the bottom
- **Agents:** Reference this during the fix-build and self-heal cycles

---

## Error Log

> **Section summary:** Each error entry includes the symptom, cause, fix, and prevention strategy. Entries are added chronologically.

---

## Known Error Patterns

> **Section summary:** Recurring error categories seen in this tech stack. Agents should check this section when they match the pattern before investigating further.

### Next.js App Router

**Hydration Mismatch**

- Symptom: `Hydration failed because the initial UI does not match what was rendered on the server`
- Cause: Browser-only logic (`window`, `localStorage`, `Date.now()`) running during server render, or Ant Design SSR issue
- Fix: Wrap in `useEffect` or use `dynamic(() => import(...), { ssr: false })`; use `AntdRegistry` from `@ant-design/nextjs-registry` for Ant Design SSR
- Prevention: Never access browser APIs outside `useEffect` in components; always wrap Ant Design root with `AntdProvider`

**`cookies()` / `headers()` must be awaited**

- Symptom: `Error: cookies() should be awaited before using its value`
- Cause: In Next.js 15, `cookies()` and `headers()` return Promises and must be `await`ed
- Fix: `const cookieStore = await cookies(); const token = cookieStore.get('accessToken')`
- Prevention: Always `await` dynamic functions (`cookies`, `headers`, `params`, `searchParams`) in Next.js 15+

**`params` and `searchParams` must be awaited in page components**

- Symptom: `params should be awaited before using its properties`
- Cause: In Next.js 15, `params` and `searchParams` are now Promises
- Fix: Add `await` before accessing params: `const { id } = await params`
- Prevention: Always destructure params with `await` in page and layout components

**`'use client'` with Server Component imports**

- Symptom: Build error about importing server-only code into client components
- Cause: Importing a server component (uses `cookies`, `headers`, etc.) into a client component
- Fix: Move server logic to an API route or Server Action; pass data as props
- Prevention: Client components can only import other client components or shared utilities

---

### TypeScript Strict Mode

**`any` Type Violations**

- Symptom: TypeScript error `Unexpected any. Specify a different type`
- Cause: Using `any` type explicitly or implicitly
- Fix: Define proper interface/type in `app/lib/types/`; use generics where needed
- Prevention: Never use `any`; use `unknown` with type narrowing if truly dynamic

**Missing Type Imports**

- Symptom: `Cannot find name 'SomeType'`
- Cause: Type defined in `app/lib/types/` but not globally included
- Fix: Check `tsconfig.json` path includes; ensure the type is exported from the types file
- Prevention: All custom types must be in `app/lib/types/types.ts` or `interfaces.ts` — they are auto-imported

---

### Prisma ORM

**Prisma Client Not Generated**

- Symptom: `Cannot find module '../app/generated/prisma'`
- Cause: `prisma generate` not run after schema changes
- Fix: Run `npx prisma generate`
- Prevention: Always run `prisma generate` after schema changes; add to CI pipeline

**Unique Constraint Violation**

- Symptom: `Prisma error P2002: Unique constraint failed`
- Cause: Attempting to create a record with a duplicate unique field (email, userName)
- Fix: Check for existing record before insert; catch `P2002` and return 409 response
- Prevention: Always catch `PrismaClientKnownRequestError` and handle specific error codes

**N+1 Query Problem**

- Symptom: Excessive DB queries, slow response times
- Cause: Fetching related data in a loop instead of using Prisma `include`
- Fix: Use `include: { user: true, comments: true }` in the main query
- Prevention: Always use `include` for related data in list queries; avoid nested fetches

---

### Redis / Caching

**Redis Connection Error in Development**

- Symptom: `Error: connect ECONNREFUSED` or Upstash auth error
- Cause: Missing or incorrect `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` in `.env`
- Fix: Add correct Upstash credentials to `.env.local`
- Prevention: Validate required env vars on startup; use optional chaining in dev when Redis isn't critical

---

### Cloudinary

**Upload Preset Not Found**

- Symptom: `Error 400: Upload preset not found`
- Cause: Wrong upload preset name or preset not created in Cloudinary dashboard
- Fix: Verify preset name matches exactly; create preset in Cloudinary if missing
- Prevention: Use constants for preset names from `app/lib/config/cloudinary.ts`

**Base64 String Too Large**

- Symptom: `Request entity too large` when uploading
- Cause: No file size validation before base64 conversion
- Fix: Validate file size client-side before upload (max 10MB recommended)
- Prevention: Always call `validateImageFile()` before uploading

---

### Ant Design + Next.js

**Ant Design Styles Not Loading in SSR**

- Symptom: Flash of unstyled Ant Design components on first load
- Cause: Ant Design CSS-in-JS not extracted during SSR
- Fix: Wrap app root with `AntdRegistry` from `@ant-design/nextjs-registry` in root layout
- Prevention: `AntdProvider.tsx` handles this — never remove `AntdRegistry` from the provider chain

---

## Prisma Seed Fails with ECONNREFUSED When Run Via npx tsx

**Symptom:**
`npx tsx prisma/seed.ts` fails immediately with `ECONNREFUSED` on the first Prisma query (`prisma.siteConfig.upsert()`). `npx prisma db seed` works fine.

**Root Cause:**
`npx tsx prisma/seed.ts` does NOT load `.env` automatically. The seed script imports `prisma` from `app/lib/db/prisma.ts` which reads `process.env.LOCAL_DB`. When that's undefined, it falls back to `'postgresql://dummy@localhost/dummy'` which triggers ECONNREFUSED. In contrast, `prisma db seed` calls `prisma.config.ts` which runs `import "dotenv/config"` before spawning the seed child process.

**Fix Applied:**
Use `npx prisma db seed` instead of `npx tsx prisma/seed.ts`. The Prisma CLI loads environment variables correctly via the config file.

**Prevention:**
Always use `npx prisma db seed` (the configured seed command) rather than invoking `tsx` directly. The seed command is defined in `prisma.config.ts` under `migrations.seed`.

**Files Affected:**
- .env (must have LOCAL_DB set)
- prisma.config.ts (loads dotenv)

**Date:** 2026-05-31

---

## Prisma Client EACCES / Missing Column on Post Create During Seed

**Symptom:**
After successful user creation, `prisma.post.create()` fails with `EACCES` error. The Post table already exists but lacks the `waypoints` column.

**Root Cause:**
The schema was updated (adding `waypoints Json?`) but the migration was never applied to the database. The Prisma client (regenerated via `prisma generate`) expects the column to exist, but the database table doesn't have it yet. Since `prisma db push` and `prisma migrate dev` also fail from this environment (P1001 TLS timeout), the column must be added another way.

**Fix Applied:**
Added a raw SQL migration at the top of `prisma/seed.ts`'s `main()` function:
```ts
await prisma.$executeRawUnsafe(
    'ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "waypoints" JSONB',
);
```
This safely adds the column if missing (idempotent — harmless on re-run).

**Prevention:**
Include `ADD COLUMN IF NOT EXISTS` raw SQL in the seed script for newly added columns when the Prisma Data Proxy is unreachable. Alternatively, apply migrations from a machine with direct DB access.

**Files Affected:**
- prisma/seed.ts

**Date:** 2026-05-31

---

## Entry Template

```
## [Error Title / Short Description]

**Symptom:**
[What the developer or user sees — error message, broken behaviour, etc.]

**Root Cause:**
[The actual technical reason this happened]

**Fix Applied:**
[What change was made to resolve it]

**Prevention:**
[How to avoid this in future — pattern, lint rule, architecture change, etc.]

**Files Affected:**
[List of files that were changed]

**Date:** [YYYY-MM-DD]
```

---

## Resolved Errors Archive

> **Section summary:** Errors that have been fully resolved and are unlikely to recur. Kept for reference.

---

## Theme Token Drift From Hardcoded Colors

**Symptom:**
UI elements keep bright white/gray backgrounds or brand hex colors in dark mode, making the theme feel inconsistent. Some components used `text-gray-600`, `text-gray-900`, `bg-gray-50`, `bg-white`, or hardcoded hex `#00623B` instead of CSS variables.

**Root Cause:**
Legacy components introduced during multi-session refactors used raw Tailwind utilities and hex values not mapped to CSS variables, creating dark mode inconsistency and hardcoded brand colors that don't respect theme tokens.

**Fix Applied:**
Swept codebase for non-tokenized colors in:
- `app/page.tsx`: `text-gray-600` → `text-[var(--color-text-secondary)]`, `#00623B` → `var(--color-primary)`, `hover:bg-gray-50` → `hover:bg-[var(--color-bg-elevated)]`
- `app/components/features/auth/OtpForm.tsx`: `text-gray-600`, `text-gray-900`, `bg-gray-100`, `border-gray-300`, `#00623B` → CSS vars
- `app/components/features/posts/ShareRouteModal.tsx`: added `!text-[var(--color-text-primary)]`
- `app/(dashboard)/profile/page.tsx` and `app/(dashboard)/profile/[username]/page.tsx`: `#00623B` / `#004d2e` → `var(--color-primary)` / `var(--color-primary-light)`
- `app/(dashboard)/invite/page.tsx`: `bg-white` → `bg-[var(--color-bg-base)]`
- `app/components/ErrorBoundary.tsx`: `bg-gray-50` → `bg-[var(--color-bg-elevated)]`

**Prevention:**
All new components must use CSS variables (`var(--color-*)`) for all color values. No raw hex, gray-*, or bg-white in feature/page code.

**Files Affected:**
- app/page.tsx
- app/components/features/auth/OtpForm.tsx
- app/components/features/posts/ShareRouteModal.tsx
- app/(dashboard)/profile/page.tsx
- app/(dashboard)/profile/[username]/page.tsx
- app/(dashboard)/invite/page.tsx
- app/components/ErrorBoundary.tsx

**Date:** 2026-05-20

---

## Google OAuth Empty Redirect URI

**Symptom:**
`/api/auth/google` returned `{ error: "Google OAuth is not configured" }` even though `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` were set in `.env`.

**Root Cause:**
`GOOGLE_REDIRECT_URI` environment variable was empty, causing the check `if (!clientId || !redirectUri)` to fail in `app/api/auth/google/route.ts`.

**Fix Applied:**
Set `GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback` in `.env`.

**Prevention:**
Always provide `GOOGLE_REDIRECT_URI` when setting OAuth credentials. Add to `.env.example` as a required field.

**Files Affected:**
- .env
- .ai-system/planning/task-queue.md

**Date:** 2026-05-20

---

## Seed Data Missing Images and Map Coordinates

**Symptom:**
All 10 seed posts had `images: []` (empty), so PostCard image galleries never rendered. No `startLat`/`startLng`/`endLat`/`endLng`/`region`/`totalDistanceKm` fields, so RouteMap never displayed for seed data.

**Root Cause:**
Seed data was created with placeholder empty image arrays and no geographic data, leaving PostCard map previews empty and image galleries non-functional.

**Fix Applied:**
- Extended `SeedPost` interface with optional geo fields
- Added 2 Cloudinary placeholder image URLs per post (20 total)
- Added real Nigerian coordinates for all 10 posts across Lagos, Ibadan, Abuja, Enugu, Cross River, Imo, Rivers, Kano, Plateau
- Added region labels and approximate distances
- Updated Prisma create call to include all geo fields

**Prevention:**
Always include images and geo coordinates in seed data. Update seed after schema changes that add new fields.

**Files Affected:**
- prisma/seed.ts

**Date:** 2026-05-20

---

## Tailwind v4 PostCSS Plugin Split

**Symptom:**
Build fails with: `It looks like you're trying to use tailwindcss directly as a PostCSS plugin`.

**Root Cause:**
Tailwind v4 moved the PostCSS plugin from `tailwindcss` to `@tailwindcss/postcss`.

**Fix Applied:**
Installed `@tailwindcss/postcss` and updated both `postcss.config.js` and `postcss.config.mjs` to use `"@tailwindcss/postcss": {}`.

**Prevention:**
When upgrading to Tailwind v4, always migrate PostCSS plugin configuration and keep `@import "tailwindcss"` in CSS entrypoint.

**Files Affected:**

- `postcss.config.js`
- `postcss.config.mjs`
- `package.json`

**Date:** 2026-04-23

---

## Next.js 15 Dynamic Params Typing in Metadata Layouts

**Symptom:**
Type errors in `.next/types/*/layout.ts` indicating `params` must be a Promise-compatible type.

**Root Cause:**
Next.js 15 dynamic route metadata signatures require `params` to be awaited.

**Fix Applied:**
Updated layout `Props` type to `params: Promise<{...}>` and used `const { ... } = await params`.

**Prevention:**
Treat dynamic route `params`/`searchParams` as async in App Router metadata/page/layout functions.

**Files Affected:**

- `app/(dashboard)/posts/[id]/layout.tsx`
- `app/(dashboard)/profile/[username]/layout.tsx`

**Date:** 2026-04-23

---

## Ant Design Patch-Level Typing/API Compatibility Drift

**Symptom:**
`npm run build`/`tsc` failures around `antd` declarations and incompatible props (`Card.variant`, `Dropdown.popupRender`).

**Root Cause:**
Installed patch-level `antd` package behavior in this workspace diverged from existing code assumptions and declaration entrypoint availability.

**Fix Applied:**
Pinned `antd` to `5.23.3` and updated incompatible usages (`Card.variant` removed, `popupRender` replaced by `dropdownRender`).

**Prevention:**
Pin UI library versions during foundational refactors and run full build immediately after dependency upgrades to catch API drift.

**Files Affected:**

- `package.json`
- `app/components/features/dashboard/SuggestionsPanel.tsx`
- `app/components/features/navigation/NotificationsDropdown.tsx`
- `app/components/features/posts/PostCard.tsx`

**Date:** 2026-04-23

---

## Theme Token Drift From Hardcoded Colors

**Symptom:**
UI elements keep bright white/gray backgrounds or brand hex colors in dark mode, making the theme feel inconsistent and visually stale.

**Root Cause:**
Components and layouts still use hardcoded color utilities or hex values instead of CSS variables and semantic theme tokens.

**Fix Applied:**
Audit and replace hardcoded colors with var(--color-\*) tokens or semantic Tailwind classes, and keep Ant Design tokens mapped to CSS variables.

**Prevention:**
Do not introduce raw hex colors in feature/page code. Prefer App\* wrappers and tokenized class names only.

**Files Affected:**

- app/globals.css
- app/providers/AntdProvider.tsx
- app/components/\*

**Date:** 2026-05-07

---

## PWA Install Prompt Noise

**Symptom:**
The old install prompt continues appearing during navigation or reloads instead of behaving as a one-time, intentional prompt.

**Root Cause:**
The install prompt and service worker registration logic are too eager and rely on repeated client-side checks and reload behavior.

**Fix Applied:**
Stabilize the install flow with a single prompt gate and replace forced service worker unregister/re-register behavior with a non-blocking update path.

**Prevention:**
Keep PWA prompts behind explicit user intent or a durable dismissal gate, and avoid automatic unregister cycles during registration.

**Files Affected:**

- app/components/features/pwa/InstallPrompt.tsx
- app/components/ServiceWorkerRegistration.tsx
- app/lib/utils/sw-register.ts

**Date:** 2026-05-07

---

## Prisma 7 Migrate Dev Fails with Missing datasource.url

**Symptom:**
`npx prisma migrate dev --name <name>` fails with: `The datasource.url property is required in your Prisma config file when using prisma migrate dev`.

**Root Cause:**
`prisma/prisma.config.ts` resolves datasource URL from environment (`LOCAL_DB` in development). No database URL variable is set in the active workspace environment.

**Fix Applied:**
Confirmed config behavior, documented blocker in planning/checkpoint files, and validated non-blocked steps by running `npx prisma generate` and `npm run build` successfully.

**Prevention:**
Before running Prisma migration commands, verify that `LOCAL_DB` (dev) or `DIRECT_URL`/`DATABASE_URL` is set and points to a reachable PostgreSQL instance.

**Files Affected:**

- `prisma/prisma.config.ts`
- `.ai-system/planning/task-queue.md`
- `.ai-system/checkpoints/session-log.md`

**Date:** 2026-04-25

---

## Config-Driven Auth Form Test Expectations

**Symptom:**
Auth tests expect specific validation messages like `Please enter your email`, `Please enter your password`, and `Please enter a valid email`, plus a visible Ant Design password wrapper.

**Root Cause:**
Config-driven form refactors can subtly change the validation copy and the rendered control type unless the schema-driven form preserves the original Ant Design behavior.

**Fix Applied:**
Updated `ConfigDrivenForm` to emit matching email/password validation and render `Input.Password` for password fields, while keeping the form driven by config objects.

**Prevention:**
When refactoring shared forms, preserve existing test-facing validation strings and the same component type semantics unless the tests are updated in the same change.

**Files Affected:**

- `app/components/ui/ConfigDrivenForm.tsx`
- `app/lib/config/forms.ts`

**Date:** 2026-04-25

---

## Mixed Mock/JWT Auth Verification Drift

**Symptom:**
`/api/auth/verify` can reject valid sessions or behave inconsistently because it parses a mock token format while login/refresh issue real JWTs.

**Root Cause:**
Auth routes evolved at different times: login/refresh used JWT + Prisma, but verify still used mock token parsing and in-memory-era assumptions.

**Fix Applied:**
Updated `app/api/auth/verify/route.ts` to verify JWT access token and load user via Prisma; added rate limiting. Removed in-memory OTP fallback from `app/api/auth/register/route.ts` and `app/api/auth/verify-otp/route.ts`, keeping Redis-backed OTP persistence only.

**Prevention:**
When migrating API routes, treat each route family (`auth`, `posts`, `users`, `notifications`) as an atomic unit and verify all routes in the family use the same token + persistence model.

**Files Affected:**

- `app/api/auth/verify/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/verify-otp/route.ts`

**Date:** 2026-04-26
