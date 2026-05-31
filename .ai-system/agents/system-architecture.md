# System Architecture

> Overview: Along is a Next.js 15 App Router application with React 19, TypeScript strict mode, Tailwind v4, Ant Design v5 (via App\* wrappers), Prisma/PostgreSQL, and Upstash Redis. The architecture is config-driven and service-oriented, with repositories under app/lib/db and business logic under app/lib/services.

---

## Architecture Diagram

Section summary: High-level flow from UI to services.

```
Client Browser / PWA
  -> Next.js App Router (RSC + Client Components)
     -> app/(auth), app/(dashboard), app/(admin), app/(public)
     -> app/components/ui (universal wrappers)
     -> app/components/features (feature UI)
  -> Next.js API Routes (app/api)
     -> app/lib/utils (auth, validation, security)
     -> app/lib/cache (Upstash Redis)
     -> app/lib/db (Prisma)
     -> app/lib/services (business logic)
  -> External Services
     -> PostgreSQL (Prisma)
     -> Upstash Redis
     -> Cloudinary
     -> QStash
     -> Web Push
```

---

## Module Breakdown

Section summary: Core modules and responsibilities.

| Module             | Responsibility           | Key Paths                                              |
| ------------------ | ------------------------ | ------------------------------------------------------ |
| App Router pages   | Route groups and layouts | app/(auth), app/(dashboard), app/(admin), app/(public) |
| UI components      | Universal UI wrappers    | app/components/ui                                      |
| Feature components | Feature-specific UI      | app/components/features                                |
| Providers          | App-level context        | app/providers                                          |
| API routes         | REST endpoints           | app/api                                                |
| Config registry    | Typed config values      | app/lib/config                                         |
| Services           | Business logic           | app/lib/services                                       |
| Repositories       | DB access                | app/lib/db                                             |
| Cache layer        | Redis helpers            | app/lib/cache                                          |
| Utilities          | Shared helpers           | app/lib/utils                                          |
| Types              | Global types             | app/lib/types                                          |

---

## Data Flow

Standard API request flow:

Client -> app/api/... -> auth check -> rate limit -> cache -> Prisma -> response

---

## Configuration Points (Env)

- LOCAL_DB, DIRECT_URL, DATABASE_URL
- JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
- NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, NEXT_PUBLIC_MAPTILER_STYLE_URL
- NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_MAILTO
- QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY
- INTERNAL_API_SECRET
- PLATFORM_USER_EMAIL
- NEXT_PUBLIC_SENTRY_DSN, SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN

---

## Tech Stack

| Layer      | Technology                 | Version       |
| ---------- | -------------------------- | ------------- |
| Framework  | Next.js                    | 15.3.x        |
| UI Runtime | React                      | 19.1.x        |
| Language   | TypeScript                 | 5.7.x         |
| UI Library | Ant Design                 | 5.23.x        |
| Icons      | lucide-react               | 0.469.x       |
| Styling    | Tailwind CSS               | 4.1.x         |
| ORM        | Prisma                     | 7.1.x         |
| Database   | PostgreSQL                 | -             |
| Cache      | Upstash Redis              | latest        |
| Jobs       | QStash                     | 2.7.x         |
| Auth       | jsonwebtoken + bcrypt      | latest        |
| Validation | Zod                        | 4.x           |
| Maps       | maplibre-gl + react-map-gl | 4.7.x + 7.1.x |
| PWA        | workbox-webpack-plugin     | 7.3.x         |
| Testing    | Jest + Testing Library     | 30.x + 16.3.x |

---

## Key Data Models

| Model | Field | Type | Purpose |
|-------|-------|------|---------|
| Post | routes | Json (JSONB) | Array of Route objects (steps, links, vehicles, fare) |
| Post | waypoints | Json (JSONB) | Array of `{lat, lng}` intermediate coordinates for map polyline |
| Post | images | String[] | Cloudinary URLs for post content images |
| Post | startLat/Lng, endLat/Lng | Float? | Start/end coordinates for map markers |
| Post | totalDistanceKm | Float? | Route distance in kilometers |
| Post | estimatedMins | Int? | Estimated travel time in minutes |

## Key Constraints

- `app/conflicting` is read-only (never modify or import).
- All DB access must go through repositories in app/lib/db.
- No raw hex values in components; use CSS vars from globals.css.
- No emoji in UI; Lucide icons only.
- All destructive actions require ModalService.confirm.
- RouteMap renders polylines via react-map-gl `Source` + `Layer` (not @mapbox/polyline).
- Some legacy lint debt remains (eslint.ignoreDuringBuilds set in next.config.mjs).
- postcss.config.js and postcss.config.mjs both exist; keep in sync.
