# Architecture History

> **Overview:** Chronological record of how the Along App system architecture has evolved. Useful for understanding why things are structured the way they are, and for identifying patterns in how the codebase has grown.

---

## History

---

### 2024 — Initial Architecture

**State:**
Next.js 15+ App Router with TypeScript, Tailwind CSS, and Ant Design. Authentication via JWT in cookies. Mock backend using json-server (`mock-backend/`) with in-memory data (`app/lib/data/`). Cloudinary for image uploads. Basic PWA setup.

**Rationale:**
Rapid development without needing a production database. Mock backend matched the shape of the planned production API, allowing frontend work to proceed in parallel.

---

### 2025 — Database Layer Added

**State:**
Prisma ORM introduced with a full PostgreSQL schema covering Users, Posts, Comments, Likes, Bookmarks, Notifications, Follow relationships, and UserActivity for the feed algorithm. Upstash Redis added for caching. Prisma client generated to `app/generated/prisma/`.

**Rationale:**
Production readiness milestone. The mock backend served its purpose; the application needed a real database layer with type-safe access and proper migrations.

---

### 2026-04-20 — .ai-system Initialized, Refactoring Phase Begins

**State:**
`.ai-system` documentation structure added to the root of the repository. All agent, planning, index, memory, and checkpoint files populated with Along App-specific content. Major refactoring phase begins to migrate all API routes from mock data to Prisma and add Redis caching, rate limiting, and Zod validation throughout.

**Rationale:**
The developer plans major refactoring and needs the .ai-system in place to guide AI-assisted development sessions systematically.

---

[New entries added here as architecture evolves]
