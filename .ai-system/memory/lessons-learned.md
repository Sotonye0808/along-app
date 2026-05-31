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

## Prisma Data Proxy Not Reachable From Some Environments

**Context:**
During development, `npx prisma migrate dev` and `npx prisma db seed` failed with network timeouts because `pooled.db.prisma.io:5432` was unreachable from the agent environment.

**What We Learned:**
Prisma Data Proxy connections (pooled.db.prisma.io) require specific network access that may not be available in all CI/agent environments. Always verify database connectivity before running migrations. For unreachable databases, generate migration SQL via `prisma migrate diff --from-migrations --to-schema ... --script` or write the ALTER TABLE SQL manually.

**Apply When:**
Any time Prisma migrations need to be generated but the database is behind a firewall or not directly accessible.

---

## RouteMap Polyline via react-map-gl Source + Layer

**Context:**
The map component needed to draw a route polyline connecting start → waypoints → end coordinates to match the explore-map design.

**What We Learned:**
react-map-gl's `Source` and `Layer` components (wrapping MapLibre GL) can render GeoJSON LineStrings without any additional library like `@mapbox/polyline`. Build a GeoJSON Feature with geometry type `LineString`, pass it to `<Source type="geojson" data={...}>`, and render with `<Layer type="line">`. No extra dependencies needed.

**Apply When:**
Drawing polylines or other vector geometries on the RouteMap or any react-map-gl instance.

---

## `app/conflicting/` Is Read-Only Reference

**Context:**
The `app/conflicting/` directory contains old code from a previous architecture that was kept for reference during migration. Modifying it causes confusion about what is canonical.

**What We Learned:**
This directory must never be modified or imported from. It exists purely as a reference for understanding the old implementation during refactoring.

**Apply When:**
Always — if you see an import from `app/conflicting/`, flag it for removal.
