# Lessons Learned

> **Overview:** Practical knowledge accumulated during Along App development — things that worked well, things that didn't, and patterns worth repeating. Different from `repair-system.md` (which tracks errors); this file tracks development process insights and architectural wisdom.

---

## Entry Format

```
## [Lesson Title]

**Context:**
[What situation this came from]

**What We Learned:**
[The insight or pattern discovered]

**Apply When:**
[When future agents/developers should use this knowledge]
```

---

## Lessons

---

## Next.js 15 Async APIs

**Context:**
During development, `cookies()`, `headers()`, `params`, and `searchParams` started throwing warnings and then errors because they became Promise-based in Next.js 15.

**What We Learned:**
All dynamic functions in Next.js 15 (`cookies()`, `headers()`, route `params`, page `searchParams`) must be `await`ed before accessing their values. This is a breaking change from Next.js 14.

**Apply When:**
Every Server Component, API route, or Server Action that accesses cookies, headers, or route parameters.

---

## Ant Design SSR Requires AntdRegistry

**Context:**
Ant Design's CSS-in-JS solution causes flash of unstyled content and hydration errors when used with Next.js App Router without proper SSR setup.

**What We Learned:**
Always wrap the app with `AntdRegistry` from `@ant-design/nextjs-registry` and configure the Ant Design theme in a dedicated `AntdProvider`. The `AntdProvider` must be at the root layout level.

**Apply When:**
Any time Ant Design components are added or the provider setup is modified.

---

## Cursor-Based Pagination Over Offset

**Context:**
The Prisma schema and data modeling phase revealed that offset-based pagination (`skip: page * size`) becomes very slow at scale with PostgreSQL.

**What We Learned:**
Always implement cursor-based pagination using Prisma's `cursor` + `take` + `skip: 1` pattern. This remains performant regardless of dataset size.

**Apply When:**
Any new list endpoint or when refactoring existing paginated queries.

---

## Validate Files Before Cloudinary Upload

**Context:**
Early image upload implementation sent all files to Cloudinary without validation, causing confusing server errors for invalid file types and oversized files.

**What We Learned:**
Always validate file type and size client-side before base64 conversion and upload. Use `validateImageFile()` utility. Handle upload failures gracefully with user-friendly error messages.

**Apply When:**
Any component or route that handles image uploads.

---

## `app/conflicting/` Is Read-Only Reference

**Context:**
The `app/conflicting/` directory contains old code from a previous architecture that was kept for reference during migration. Modifying it causes confusion about what is canonical.

**What We Learned:**
This directory must never be modified or imported from. It exists purely as a reference for understanding the old implementation during refactoring.

**Apply When:**
Always — if you see an import from `app/conflicting/`, flag it for removal.
