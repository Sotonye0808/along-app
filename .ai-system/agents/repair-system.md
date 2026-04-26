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

[Entries move here when the underlying cause has been permanently fixed]

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
