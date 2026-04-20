# Project Plan

> **Overview:** High-level feature checklist for the Along App. Agents update checkboxes as work is completed. Sections represent major development phases. See `task-queue.md` for granular, sprint-level tasks.

---

## Phase 1 — Foundation (Complete)

> **Section summary:** Core infrastructure setup — routing, auth, component architecture, and PWA basics.

- [x] Next.js 15+ App Router setup with TypeScript strict mode
- [x] Route groups: `(auth)` and `(dashboard)`
- [x] Tailwind CSS + Ant Design integration
- [x] AntdProvider, AuthProvider, ThemeProvider wrappers
- [x] JWT authentication with cookie storage
- [x] Login, Register, OTP flows
- [x] Prisma schema defined (User, Post, Comment, Like, Bookmark, Notification, Follow)
- [x] Cloudinary integration for image uploads
- [x] Mock backend with json-server
- [x] PWA setup (service worker, manifest)
- [x] Basic SEO (metadata, Open Graph, robots.txt, sitemap)
- [x] Jest + Testing Library setup

---

## Phase 2 — Core Social Features (Partially Complete)

> **Section summary:** The primary features defining Along as a social platform.

- [x] Post creation (title, routes, images, tags)
- [x] Post feed (home page)
- [x] Post detail view
- [x] Like / dislike posts
- [x] Comment on posts
- [x] Bookmark posts
- [x] User profiles
- [x] Follow / unfollow users
- [x] Explore / discover page
- [ ] Notifications (list + read status)
- [ ] Search (users, posts, tags)
- [ ] Marketplace page

---

## Phase 3 — Database Migration (Active)

> **Section summary:** Replace mock backend with production-ready Prisma + PostgreSQL + Redis.

- [ ] Migrate all API routes from mock data to Prisma
- [ ] Implement Redis caching for all list endpoints
- [ ] Implement cursor-based pagination for all list endpoints
- [ ] Add rate limiting to all API routes
- [ ] Add proper Zod validation to all API inputs
- [ ] Implement proper error handling with specific Prisma error codes
- [ ] Remove / archive mock data layer after full migration

---

## Phase 4 — Quality & Security (Planned)

> **Section summary:** Reliability, security hardening, and test coverage.

- [ ] Security audit (auth, input validation, secrets, CORS)
- [ ] Unit test coverage for all utility functions
- [ ] Integration tests for critical API routes
- [ ] Performance audit and optimisation
- [ ] Accessibility audit (WCAG AA)
- [ ] Loading and error states complete across all pages
- [ ] SEO audit and improvements

---

## Phase 5 — Advanced Features (Planned)

> **Section summary:** Features that enhance the platform beyond the MVP.

- [ ] Real-time notifications (WebSocket or SSE)
- [ ] Advanced feed algorithm (based on UserActivity model)
- [ ] Route map visualization (interactive map component)
- [ ] Push notifications (VAPID / Web Push)
- [ ] User activity tracking for feed personalization
- [ ] Share routes to external platforms

---

## Phase 6 — Launch Preparation (Planned)

> **Section summary:** Final steps before production deployment.

- [ ] Production environment configured (Vercel + Railway/Supabase)
- [ ] Database migrations tested end-to-end
- [ ] CI/CD pipeline established
- [ ] Monitoring and error tracking (Sentry or similar)
- [ ] Full documentation complete
- [ ] Performance targets met (Core Web Vitals green)

---

## Completed

> **Section summary:** Features fully shipped. Archived here for reference.

- [x] Initial Next.js + TypeScript project setup
- [x] Tailwind + Ant Design theme configuration
- [x] JWT auth with cookie-based token storage
- [x] Prisma schema design
- [x] Cloudinary image utility
- [x] Mock backend for development
