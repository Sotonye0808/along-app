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
