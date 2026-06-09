# Repair System — Error Knowledge Base

> **Overview:** A living knowledge base of errors encountered during development, their root causes, and how they were fixed. Agents should consult this before diagnosing new errors. Every fixed bug should be logged here to prevent recurrence. This file is pre-populated with known error patterns for the Along tech stack (Next.js 15 + React 19 + Ant Design 5 + Tailwind 4).

---

## How to Use This File

- **Before debugging:** Search this file for patterns matching your current error
- **After fixing a bug:** Add an entry using the template at the bottom
- **Agents:** Reference this during the fix-build and self-heal cycles

---

## Error Log

> **Section summary:** Each error entry includes the symptom, cause, fix, and prevention strategy. Entries are added chronologically.

---

### [TEMPLATE — copy this for each new error]

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

## Known Error Patterns

### React 19 / Next.js 15

**Hydration Mismatch**
- Symptom: `Hydration failed because the initial UI does not match what was rendered on the server`
- Cause: Browser-only logic (window, localStorage, Date.now()) running during server render
- Fix: Wrap in `useEffect` or use `dynamic(() => import(...), { ssr: false })`
- Prevention: Never access browser APIs outside useEffect in components

**Missing Key Prop**
- Symptom: `Each child in a list should have a unique "key" prop`
- Cause: `.map()` rendering without a stable unique key
- Fix: Add `key={item.id}` — use a stable unique ID, not the array index

**Server Component with Client Hook**
- Symptom: `You're importing a component that needs useState/useEffect. It only works in a Client Component.`
- Cause: Server component using client-side features
- Fix: Add `"use client"` directive at the top of the file
- Prevention: Default to server components; add "use client" only when needed

**Async Server Component Error**
- Symptom: `Error: Objects are not valid as a React child`
- Cause: Returning a raw object/Response from an async server component instead of JSX
- Fix: Ensure async components return JSX, not plain objects

### Ant Design 5 + React 19

**Ant Design Component SSR Issue**
- Symptom: Style flicker or missing styles on first page load
- Cause: Ant Design v5 CSS-in-JS not properly extracted during SSR
- Fix: Use `@ant-design/nextjs-registry` to wrap the app root
- Prevention: Always use AntdRegistry from `@ant-design/nextjs-registry` in the root layout

**Ant Design Icon Missing**
- Symptom: Blank square or missing icon
- Cause: Tree-shaking removed the icon during build
- Fix: Import icon directly from `@ant-design/icons` rather than dynamic import
- Prevention: Always use named imports for Ant Design icons

### Prisma 7 + PostgreSQL

**Prisma Client Not Found**
- Symptom: `Cannot find module '@prisma/client'`
- Cause: Prisma client not generated after schema changes
- Fix: Run `npx prisma generate`
- Prevention: Run `prisma generate` after every schema change

**Migration Conflict**
- Symptom: `Migration `xxx` was applied to the database but is not in the migrations directory`
- Cause: Migrations deleted or reset while database has applied migrations
- Fix: `npx prisma migrate resolve --applied <migration_name>`
- Prevention: Never delete migration files without resolving the database state

**Connection Pool Exhaustion**
- Symptom: `Error: Connection pool exhausted` or requests hang
- Cause: Prisma connection pool too small for request volume
- Fix: Increase pool size in `DATABASE_URL` query params (`?connection_limit=20`)
- Prevention: Configure connection pooling based on serverless/container concurrency

### Tailwind CSS 4

**@tailwind Directive Not Working**
- Symptom: `@tailwind base` / `@tailwind utilities` produces no output
- Cause: Tailwind v4 uses `@import "tailwindcss"` instead of `@tailwind` directives
- Fix: Replace `@tailwind base; @tailwind components; @tailwind utilities` with `@import "tailwindcss"`
- Prevention: Use Tailwind v4 syntax with the new `@tailwindcss/postcss` plugin

**Class Not Being Generated**
- Symptom: A utility class like `grid-cols-12` is not working
- Cause: Tailwind v4 uses CSS-first configuration; custom values need `@theme` directive
- Fix: Add `grid-cols-12` to the `gridTemplateColumns` theme extension in the plugin
- Prevention: Register all custom utility values in `tailwind.config.ts`

### Configuration / Environment

**Missing Environment Variable**
- Symptom: `undefined` values in production, features silently broken
- Cause: Variable defined in `.env` but not in production environment
- Fix: Add to deployment environment variables and validate on startup
- Prevention: Add a startup validation check that throws if required env vars are missing

**Public Env Var Not Exposed to Client**
- Symptom: `NEXT_PUBLIC_*` variable is `undefined` in the browser
- Cause: Variable missing `NEXT_PUBLIC_` prefix, or build not restarted after change
- Fix: Prefix with `NEXT_PUBLIC_` and rebuild
- Prevention: Always prefix client-exposed env vars with `NEXT_PUBLIC_`

### Jest / Testing

**Jest Cannot Find Module**
- Symptom: `Cannot find module '@/lib/something'`
- Cause: Module alias not configured in Jest or tsconfig paths mismatch
- Fix: Ensure `jest.config.js` has correct `moduleNameMapper` for `@/*` → `src/*`
- Prevention: Keep Jest module aliases in sync with tsconfig paths

**RTL Ant Design Component Test Fails**
- Symptom: `Error: Could not find `locale` in context` or missing Ant Design styles
- Cause: Ant Design ConfigProvider not wrapping the test component
- Fix: Wrap test renders with `ConfigProvider` and `AntdRegistry`
- Prevention: Create a custom render function that includes all necessary providers

---

## Resolved Errors Archive

> **Section summary:** Errors that have been fully resolved and are unlikely to recur. Kept for reference.

### PostCard Crash on Missing Tags/Images

**Symptom:**
Uncaught TypeError: Cannot read properties of undefined (reading 'length') — occurs when navigating to pages that render PostCard components. Specifically on `post.tags.length` and `post.images.length` accesses.

**Root Cause:**
API responses may omit `tags` or `images` fields, or return `null` instead of `[]`. TypeScript's type system (`string[]`) does not provide runtime protection, and the data flows through JSON.parse without Zod schema validation on the feed endpoint.

**Fix Applied:**
Added local constants with `?? []` fallback:
```tsx
const tags = post.tags ?? []
const images = post.images ?? []
```
All `.length` and `.map()` calls now reference the guarded constants.

**Prevention:**
Always access optional array fields with `?? []` fallback or optional chaining. Consider adding Zod validation to feed API responses.

**Files Affected:**
- `app/components/features/posts/PostCard.tsx`

**Date:** 2026-06-09
