# Repository Map

> Overview: Current folder structure and purpose. Update when the structure changes.

---

## Folder Structure

```
along-app/
  .ai-system/                 -> AI development system
  app/                        -> Next.js App Router
    (auth)/                   -> Auth routes (login, register, otp)
    (dashboard)/              -> Main app routes (home, explore, posts, profile, etc)
    (admin)/                  -> Admin routes
    (public)/                 -> Public marketing/legal pages
    api/                      -> API routes
    components/               -> UI and feature components
      features/               -> Feature-specific components
      ui/                     -> Universal UI wrappers (App*)
    lib/                      -> Shared logic
      cache/                  -> Redis helpers
      config/                 -> Config registries
      constants/              -> App constants (legacy)
      db/                     -> Prisma access
      hooks/                  -> React hooks
      services/               -> Business logic
      types/                  -> Global types
      utils/                  -> Utilities
    providers/                -> React context providers
    generated/                -> Prisma client output
    globals.css               -> Global CSS tokens and base styles
    layout.tsx                -> Root layout
    page.tsx                  -> Landing page
    robots.ts                 -> robots.txt
    sitemap.ts                -> sitemap.xml
  prisma/                     -> Prisma schema and migrations
  public/                     -> Static assets (icons, manifest, sw)
  .env.example                -> Environment variable template
  next.config.mjs             -> Next.js config
  tailwind.config.ts          -> Tailwind config
  tsconfig.json               -> TypeScript config
  package.json                -> Dependencies and scripts
```

---

## Directory Descriptions

| Directory               | Purpose           | Key Files                                       |
| ----------------------- | ----------------- | ----------------------------------------------- |
| app/(auth)              | Auth pages        | login/page.tsx, register/page.tsx, otp/page.tsx |
| app/(dashboard)         | Main app pages    | home/, explore/, posts/, profile/               |
| app/(admin)             | Admin UI          | admin/\* pages                                  |
| app/(public)            | Marketing/legal   | about/, contact/, privacy/, terms/              |
| app/api                 | REST API routes   | auth/, posts/, users/, notifications/           |
| app/components/features | Feature UI        | posts/, profile/, navigation/, pwa/, map/       |
| app/components/ui       | UI wrappers       | AppButton, AppCard, AppModal, etc               |
| app/lib/config          | Config registries | navigation.ts, forms.ts, seo.ts, etc            |
| app/lib/services        | Business logic    | ValidityEngine, DraftingCoachService, etc       |
| app/lib/db              | Prisma access     | prisma.ts, repositories                         |
| prisma                  | ORM schema        | schema.prisma, migrations/                      |
| public                  | PWA assets        | manifest.json, sw.js, icons                     |

---

## Entry Points

| Purpose          | File                       |
| ---------------- | -------------------------- |
| Root layout      | app/layout.tsx             |
| Dashboard layout | app/(dashboard)/layout.tsx |
| Auth layout      | app/(auth)/layout.tsx      |
| Admin layout     | app/(admin)/layout.tsx     |
| Landing page     | app/page.tsx               |
| Prisma schema    | prisma/schema.prisma       |
| Next config      | next.config.mjs            |
