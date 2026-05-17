# Dependency Graph

> Overview: Module dependencies and external packages in current codebase.

---

## Module Dependency Map

```
app/layout.tsx
  -> app/providers/ThemeProvider.tsx
  -> app/providers/AntdProvider.tsx
  -> app/providers/AuthProvider.tsx
  -> app/components/ServiceWorkerRegistration.tsx
  -> app/components/features/pwa/*

app/(auth)/*
  -> app/components/features/auth/*
  -> app/lib/utils/auth.ts
  -> app/api/auth/*

app/(dashboard)/layout.tsx
  -> app/components/features/navigation/*
  -> app/components/features/pwa/*
  -> app/providers/AuthProvider.tsx

app/(dashboard)/*
  -> app/components/features/*
  -> app/lib/hooks/*
  -> app/api/*

app/api/*
  -> app/lib/db/*
  -> app/lib/cache/*
  -> app/lib/utils/*
  -> app/lib/services/*

app/lib/services/*
  -> app/lib/config/*
  -> app/lib/db/*
  -> app/lib/cache/*

app/components/ui/*
  -> antd
  -> lucide-react
  -> tailwind css vars
```

---

## External Dependencies

| Package                      | Purpose                     | Used In                          |
| ---------------------------- | --------------------------- | -------------------------------- |
| next                         | App framework               | entire app                       |
| react / react-dom            | UI runtime                  | all components                   |
| antd                         | UI components               | App\* wrappers and some features |
| @ant-design/icons            | Icon library (legacy usage) | some feature components          |
| lucide-react                 | Icon library                | App\* and features               |
| tailwindcss                  | Utility CSS                 | all styling                      |
| @prisma/client / prisma      | ORM                         | app/lib/db, API routes           |
| @upstash/redis               | Redis cache                 | app/lib/cache                    |
| @upstash/qstash              | Job queue                   | app/api/workers                  |
| cloudinary / next-cloudinary | Media                       | app/lib/utils/cloudinary         |
| web-push                     | Push notifications          | app/lib/services/PushService     |
| jsonwebtoken / bcrypt        | Auth                        | auth routes and utils            |
| zod                          | Validation                  | API routes                       |
| axios                        | HTTP client                 | client API helpers               |
| maplibre-gl / react-map-gl   | Maps                        | RouteMap                         |
| supercluster                 | Map clustering              | map features                     |
| @mapbox/polyline             | Polyline helpers            | map features                     |
| react-markdown / remark      | Markdown pages              | public pages                     |
| @ant-design/charts           | Charts                      | analytics                        |
| rxjs                         | Reactive feed               | feed hooks                       |
| @sentry/nextjs               | Error tracking              | instrumentation and configs      |
| workbox-webpack-plugin       | PWA                         | service worker setup             |

---

## Dependency Rules

- Pages may depend on components and hooks, not db/cache directly.
- API routes may depend on db/cache/utils/services.
- Components may depend on hooks/utils/types, not db/cache.
- Config modules should be imported by services and UI, not the reverse.
