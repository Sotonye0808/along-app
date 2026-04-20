# Project Context

> **Overview:** Along is a social route-sharing platform where users share, discover, and interact with travel routes and destinations. It is a full-stack Next.js 15+ application targeting travelers and adventure enthusiasts who want to share their journeys and discover routes from others. The project is currently in active development, transitioning from a mock backend to a production-ready database-backed architecture.

---

## Project Purpose

> **Section summary:** What this project does and why it exists.

Along enables users to create and share travel route posts — including maps, images, and tags — while building a social community around exploration and discovery. Users can follow each other, like and comment on posts, bookmark routes for later, and explore content through a feed algorithm.

---

## Target Users

> **Section summary:** Who uses this system and what they need from it.

| User Type | Needs | Key Interactions |
|-----------|-------|-----------------|
| Travelers / Explorers | Share their routes with photos and maps | Create posts, follow users, explore feed |
| Route Discoverers | Find routes by location, tags, or popularity | Browse explore page, search, bookmark posts |
| Community Members | Engage with others' content | Like, comment, follow, get notifications |

---

## Business Constraints

> **Section summary:** Non-negotiable requirements that affect how we build.

- Must support PWA installation on mobile devices
- Must work with offline fallback (service workers)
- Images must go through Cloudinary (no local storage)
- JWT auth tokens stored in cookies (not localStorage)
- TypeScript strict mode is mandatory — no `any` types
- No raw SQL — all DB access through Prisma ORM
- `app/conflicting/` directory must never be modified (legacy reference only)

---

## Current Project Phase

> **Section summary:** Where the project stands right now in its development lifecycle.

Phase: **Active Development → Refactoring**

The application has a working mock backend (`mock-backend/` with json-server) and Next.js API routes backed by in-memory data. A Prisma schema and database layer (`app/lib/db/`) are in place. The current focus is major refactoring to achieve production readiness: migrating all API routes to use Prisma, adding Redis caching, securing all endpoints, and improving code modularity.

Active sprint focus: Refactoring existing code to production-grade quality, improving type safety, and enabling the full database-backed workflow.

---

## Tech Decisions Already Made

> **Section summary:** Decisions that are locked in and should not be revisited unless explicitly flagged.

| Decision | Reason |
|----------|--------|
| Next.js 15+ App Router | Leverages Server Components and React 19; no Pages Router |
| TypeScript strict mode | Prevents runtime type errors; mandatory for all files |
| Tailwind CSS + Ant Design | Tailwind for layout/custom, antd for UI components |
| Prisma ORM with PostgreSQL | Type-safe DB access, prevents SQL injection, easy migrations |
| Cloudinary for all media | Centralized image management with transformation support |
| Upstash Redis for caching | Serverless-compatible, no connection pooling issues |
| JWT in cookies | More secure than localStorage; server-accessible |
| Zod for validation | Runtime type checking + schema inference for API inputs |
| React Context API for global state | Lightweight state management; no Redux needed for this scale |
| json-server mock backend | Rapid development before DB integration; matches production API shape |

---

## Out of Scope

> **Section summary:** Things we are explicitly not building in this project.

- Native mobile apps (iOS/Android) — PWA approach only
- Real-time map rendering beyond route display
- Payment processing / marketplace transactions (feature may be added later)
- Third-party OAuth login (email/password + OTP only for now)
- Multi-tenant organization features

---

## External Integrations

> **Section summary:** Third-party services and APIs this project connects to.

| Service | Purpose | Auth Method |
|---------|---------|------------|
| Cloudinary | Image upload, storage, and transformation | API key + upload preset |
| Upstash Redis | Response caching and rate limiting | REST API with token |
| PostgreSQL | Primary database | Connection string (via Prisma) |
| Push Notifications | PWA notifications | Web Push protocol / VAPID keys |
