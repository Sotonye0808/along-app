# Feature Sprint Temp Plan — Env + Email + Cookie + Seed

Purpose: This file captures the full plan and context for the env/email/cookie/seed sprint so any model can execute it safely and consistently. Treat this as the authoritative session guide until the sprint is complete.

## Non-negotiables

- Config-first. No hardcoded values outside lib/config.
- No emoji in UI or seed content that appears in UI.
- Lucide icons only.
- Use App\* UI wrappers in feature components.
- No direct Prisma calls outside lib/db repositories.
- Use prisma.$transaction for multi-step mutations.
- Design tokens only (var(--color-\*) or semantic Tailwind tokens).

## Current Sprint Scope

1. Cookie consent compliance (design + storage)
2. PROJECT_ENV-based environment resolution for DB + Cloudinary + Redis
3. Resend email system, templates, and end-to-end wiring
4. Migrations + comprehensive dev seed for LOCAL_DB

## Environment Rules

- PROJECT_ENV is the authoritative runtime flag for dev/prod routing.
- When PROJECT_ENV=development:
  - Use LOCAL_DB for Prisma connection.
  - Prefix Cloudinary folders with along/dev/.
  - Prefix Redis keys with dev: (or an explicit dev prefix) to separate playground data.
- NODE_ENV remains for security-sensitive behavior (cookie secure flags, etc).

## Cookie Consent Requirements

- Stored in cookie: along_cookie_consent=accepted; max-age=31536000.
- Banner appears on first visit for all users if cookie not set.
- Copy: "Along uses necessary cookies to keep you signed in and improve your experience. By using Along, you accept this. Find out more in our Privacy Policy →"
- Single "Got it" CTA (primary), privacy link to /privacy.
- Fixed bottom, full width, z-50, tokenized colors.

## Email System Requirements

- Use Resend for delivery (API key via RESEND_API_KEY).
- Provide layout wrapper, shared footer, and reusable templates.
- Use config-driven defaults and allow admin overrides via SiteConfig (admin editable + previewable).
- Templates to include at minimum:
  - Auth OTP verification
  - Invite email
  - Contact confirmation to sender
  - Contact notification to support
  - Bug report confirmation to reporter
  - Bug report notification to support
  - Daily digest summary
  - Password changed notification (for future use)

## Wiring Points (End-to-End)

- Auth register: send OTP email instead of console logging.
- Contact form: POST to /api/contact, send email to support + sender.
- Bug reports: on create, email support and optionally acknowledge reporter.
- Invites: add an API route to send invite emails.
- Digest worker: after in-app notification, send digest email.

## Key Files

- Cookie consent: app/components/ui/CookieConsent.tsx, app/providers/CookieConsentProvider.tsx, app/layout.tsx
- Env resolver: app/lib/utils/env.ts (new), app/lib/db/prisma.ts, app/lib/config/cloudinary.ts, app/lib/cache/redis.ts
- Email service: app/lib/services/emailService.ts (new), app/lib/email/\* (new), app/lib/config/email.ts (new)
- Admin config: app/api/admin/config/route.ts, app/(admin)/admin/config/page.tsx, app/lib/utils/siteConfig.ts
- Contact: app/(public)/contact/page.tsx, app/api/contact/route.ts (new)
- Bug reports: app/api/bug-reports/route.ts
- Invites: app/api/invites/send/route.ts (new), app/(dashboard)/invite/page.tsx (optional send UI)
- Digest: app/api/workers/digest/route.ts
- Seed: prisma/seed.ts

## Execution Order

1. Cookie consent compliance (storage + copy + layout).
2. Env resolver + DB/Cloudinary/Redis changes.
3. Email service + templates + admin config + API routes.
4. Wire flows (register, contact, bug report, invite, digest).
5. Expand seed, then run migrations and seed.

## Notes

- Avoid new direct Ant Design usage in feature components. Use ToastService or App\* wrappers.
- Keep all new code strictly typed; no any.
- Update ai-system logs (session-log, project-decisions) after completion.
