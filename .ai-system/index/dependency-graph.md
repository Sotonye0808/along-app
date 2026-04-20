# Dependency Graph

> **Overview:** Maps how modules in the Along App depend on each other. Agents use this to understand the impact of changes before modifying a module. Updated whenever new dependencies are introduced or modules are refactored.

---

## Module Dependency Map

```
app/layout.tsx (Root Layout)
  → app/providers/AntdProvider.tsx
  → app/providers/AuthProvider.tsx
  → app/providers/ThemeProvider.tsx
  → app/components/ServiceWorkerRegistration.tsx

app/(auth)/* Pages
  → app/components/features/auth/
  → app/lib/utils/auth.ts
  → app/lib/utils/validation.ts
  → app/api/auth/

app/(dashboard)/layout.tsx
  → app/components/features/dashboard/
  → app/components/features/navigation/
  → app/lib/hooks/
  → app/providers/AuthProvider.tsx

app/(dashboard)/* Pages
  → app/components/features/[feature]/
  → app/lib/hooks/
  → app/api/[resource]/

app/api/auth/
  → app/lib/db/            (Prisma client)
  → app/lib/utils/auth-server.ts
  → app/lib/utils/validation.ts
  → app/lib/utils/security.ts

app/api/posts/
  → app/lib/db/            (Prisma client)
  → app/lib/cache/         (Redis)
  → app/lib/utils/auth-server.ts
  → app/lib/utils/validation.ts
  → app/lib/utils/rateLimiter.ts
  → app/lib/utils/cloudinary.ts

app/api/users/
  → app/lib/db/            (Prisma client)
  → app/lib/cache/         (Redis)
  → app/lib/utils/auth-server.ts
  → app/lib/utils/rateLimiter.ts

app/api/notifications/
  → app/lib/db/            (Prisma client)
  → app/lib/cache/         (Redis)
  → app/lib/utils/auth-server.ts
  → app/lib/utils/rateLimiter.ts

app/lib/db/
  → app/generated/prisma   (Prisma generated client)
  → PostgreSQL (external)

app/lib/cache/
  → @upstash/redis         (external)

app/lib/utils/cloudinary.ts
  → app/lib/config/        (Cloudinary config)
  → cloudinary             (npm package)

app/lib/utils/validation.ts
  → zod                    (npm package)

app/lib/utils/auth.ts
  → js-cookie              (npm package)
  → jsonwebtoken           (npm package)

app/lib/utils/auth-server.ts
  → next/headers           (cookies)
  → jsonwebtoken           (npm package)

app/lib/utils/rateLimiter.ts
  → app/lib/cache/         (Redis)

app/components/features/
  → antd                   (Ant Design)
  → @ant-design/icons
  → app/lib/types/
  → app/lib/hooks/
  → app/lib/utils/

app/lib/types/
  → (no dependencies — auto-imported via tsconfig)
```

---

## External Dependencies

> **Section summary:** Third-party packages and what they're used for. Review before adding new packages.

| Package | Purpose | Used In |
|---------|---------|---------|
| next | App framework | Entire app |
| react / react-dom | UI library | All components |
| antd | UI component library | All UI components |
| @ant-design/icons | Icon library | Components, navigation |
| @ant-design/nextjs-registry | Ant Design SSR | AntdProvider |
| @prisma/client | Database ORM | API routes, lib/db |
| @upstash/redis | Redis client | lib/cache |
| cloudinary | Image management | lib/utils/cloudinary |
| next-cloudinary | Next.js Cloudinary component | Image components |
| jsonwebtoken | JWT generation/verification | auth utilities |
| bcrypt / bcryptjs | Password hashing | auth API routes |
| zod | Input validation | API routes, forms |
| js-cookie | Cookie management (client) | auth utilities |
| axios | HTTP client | client-side API calls |
| react-markdown | Markdown rendering | Post descriptions |
| tailwindcss | Utility CSS | All styling |
| jest + @testing-library/* | Testing | `app/__tests__/` |
| json-server | Mock API server | mock-backend |
| concurrently | Run multiple npm scripts | dev:all |

---

## Circular Dependency Warnings

> **Section summary:** Any detected circular dependencies that need to be resolved.

None detected at time of .ai-system initialization. Monitor for cycles between `lib/services/` and `lib/db/` if services become interdependent.

---

## Dependency Rules

> **Section summary:** Rules about which modules may depend on which others. Prevents architectural decay.

- **Pages** may depend on components and `lib/hooks/` — not directly on `lib/db/`
- **API routes** may depend on `lib/db/`, `lib/cache/`, `lib/utils/` — not on page components
- **Components** may depend on `lib/hooks/`, `lib/utils/`, `lib/types/` — not on `lib/db/`
- **lib/db/** depends only on the generated Prisma client — no app logic
- **lib/cache/** depends only on Upstash Redis — no app logic
- **lib/types/** has no dependencies — it is the foundation layer
- **lib/utils/** may depend on `lib/config/` and external packages — not on `lib/db/` or `lib/cache/`
- **Providers** may depend on `lib/utils/` and `lib/hooks/` — not on API routes directly
