# Development History

## 2026-05-12 — Env + Email + Cookie Sprint

**Summary:**
Delivered PROJECT_ENV-based environment routing, cookie consent compliance, and a Resend-backed email system with admin-editable settings and template copy. Wired OTP verification, invites, contact, bug reports, digest, and password change emails end-to-end, and expanded seed data to include site config defaults while removing emoji from seed content.

**Completed:**

- Converted cookie consent storage to cookie-based acceptance with design-system copy and layout
- Added PROJECT_ENV resolver and applied dev/prod routing for Prisma, Cloudinary folders, and Redis key prefixes
- Built email template/layout system and Resend delivery wrapper with admin-editable config
- Added /api/contact and /api/invites/send endpoints and wired contact + invite UI flows
- Wired emails in auth registration, bug reports, digest worker, and password change
- Expanded seed script to seed site config defaults and remove emoji from seed text

**Known Blockers:**

- `prisma migrate dev` fails with P1011 TLS handshake EOF against accelerate.prisma-data.net, so migrations/seed were not executed

## 2026-05-10 — Compliance Remediation Batch 1 (Feature/UI Cleanup)

**Summary:**
Completed the next compliance pass against the audit drift list by cleaning targeted feature and shared UI components. This batch removed direct Ant Design usage from scoped feature files, replaced non-compliant icons/emoji with Lucide patterns, and aligned selected shared widgets to tokenized color usage.

**Completed:**

- Reworked `MobileTopBar` and `DesktopTopBar` to remove dead `/settings` navigation references and align menu actions to real routes/theme toggling
- Rebuilt `SearchBar`, `ShareRouteButton`, `NotificationSettings`, and `OfflineIndicator` without direct Ant Design imports
- Updated shared widgets (`CookieConsent`, `GlobalUndoToast`, `AppTag`) to remove remaining hardcoded color drift in the scoped targets
- Synced compliance trackers (`task-queue.md`, `project-plan.md`, `session-log.md`) for completed dead-route/PWA stabilization milestones

**Key Changes:**

- Scoped feature components now rely on App\* wrappers/Lucide and tokenized styles in the remediated files
- `/settings` top-bar route references are removed; settings intent now maps to existing profile flow
- Push notification settings no longer use a hardcoded VAPID fallback in client UI

**Known Blockers:**

- `npx tsc --noEmit` still reports pre-existing typing issues in `app/__tests__/unit/buildMetadata.test.ts`

## 2026-05-07 — Compliance Audit and Documentation Sync

**Summary:**
A full compliance review was completed against the engineering plan, design system, and current codebase. The audit found drift in theme token usage, direct Ant Design usage in feature code, PWA prompt behavior, route integrity, and documentation accuracy. Supporting guidance files and repository docs were refreshed to provide a single source of truth for the next remediation passes.

**Completed:**

- Created a comprehensive compliance audit report in .ai-system/planning/compliance-audit-2026-05-07.md
- Added .env.example covering core, auth, database, Cloudinary, Redis, Google OAuth, maps, PWA, QStash, and Sentry variables
- Updated README with current stack, environment setup, and documentation links
- Refreshed ai-system planning and architecture docs to match the current state

**Key Changes:**

- The project now has a clear remediation roadmap for design token cleanup, universal component compliance, PWA prompt stabilization, and nav route cleanup
- Environment requirements are documented in one place for local setup and deployment handoff

**Next Sprint Focus:**
Execute the compliance remediation plan and verify visual/theme consistency across the app.
