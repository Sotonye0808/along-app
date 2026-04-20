# AI Development Protocol — General Instructions

> **Overview:** This is the master instruction file for all AI agents working on the Along App project. Every agent session should begin by reading this file. It defines how agents think, what they reference, and how they behave during development. Along is a social route-sharing platform built with Next.js 15+, TypeScript, Prisma, and Tailwind CSS + Ant Design.

---

## Documents to Reference

Always consult the following files before taking action, in this order:

1. `.ai-system/planning/task-queue.md` — what needs to be done next
2. `.ai-system/planning/project-plan.md` — overall project goals and progress
3. `.ai-system/agents/system-architecture.md` — how the system is structured
4. `.ai-system/agents/design-system.md` — UI/UX rules and component patterns
5. `.ai-system/agents/project-context.md` — project background and constraints
6. `.ai-system/agents/repair-system.md` — known errors and how to avoid/fix them
7. `.ai-system/memory/project-decisions.md` — past architectural decisions and their reasoning

---

## Core Principles

- **App Router first** — use Next.js App Router exclusively; no Pages Router
- **Server Components by default** — add `'use client'` only when necessary
- **Strict TypeScript** — no `any`, define all types in `app/lib/types/`, use interfaces for object shapes
- **Tailwind + Ant Design** — use Tailwind for layout/custom styles, Ant Design for UI components
- **Prisma for all DB access** — never write raw SQL; use the singleton from `app/lib/db/`
- **Modular architecture** — each module has a single, clear responsibility
- **Configuration-driven** — behaviour via env vars/config, not hardcoded values
- **Explicit error handling** — every failure path must be handled deliberately
- **Consistency** — follow existing patterns before inventing new ones

---

## Execution Protocol

### Before implementing any feature:
1. Read `task-queue.md` and identify the first incomplete task
2. Confirm the task aligns with `system-architecture.md`
3. Check `repair-system.md` for relevant known issues
4. If architecture changes are needed, update `system-architecture.md` first

### After completing any task:
1. Mark the task done `[x]` in `task-queue.md`
2. Update `.ai-system/checkpoints/session-log.md`
3. Add a summary to `.ai-system/summaries/dev-history.md`
4. If architecture changed, update `system-architecture.md`
5. If errors were encountered and fixed, log them in `repair-system.md`
6. If a significant decision was made, record it in `memory/project-decisions.md`

---

## Along App Specific Rules

- **Route groups:** Auth pages live in `app/(auth)/`, dashboard pages in `app/(dashboard)/`
- **Types:** Globally define types/interfaces in `app/lib/types/` — they are auto-imported via `tsconfig.json`
- **Images:** Always use Cloudinary via `app/lib/utils/cloudinary.ts`; never commit local image paths
- **Cache:** Check Redis cache before DB queries; invalidate on writes using `app/lib/cache/`
- **Auth:** Server-side auth checks use `cookies()` from `next/headers`; client-side uses `AuthProvider`
- **Validation:** Use Zod schemas for all API input validation
- **Rate Limiting:** Apply rate limits to all API routes via `app/lib/utils/rateLimiter.ts`
- **API Routes:** Located in `app/api/` — follow RESTful conventions
- **PWA:** Maintain service worker and manifest in `public/`; use `ServiceWorkerRegistration.tsx`
- **Ignore:** Do not modify or reference `app/conflicting/` — it is legacy code kept for reference only

---

## Agent Roles

| Agent | Tool | Responsibility |
|-------|------|----------------|
| Planner | Continue | Analyze tasks, determine next steps, update task queue |
| Architect | Continue | Design or update system architecture |
| Coder | Cline | Implement code changes across multiple files |
| Reviewer | Continue | Review code quality and architecture consistency |
| Tester | Cline | Run tests, identify failures, trigger self-heal loop |
| Historian | Continue | Update summaries, dev-history, and memory files |

---

## Tone and Output Format

- Explain reasoning briefly before acting
- When proposing architecture changes, describe the change before implementing
- When encountering ambiguity, ask one clarifying question rather than guessing
- Keep file edits focused — do not touch modules unrelated to the current task
- Leave nothing unimplemented; provide complete, production-ready solutions
