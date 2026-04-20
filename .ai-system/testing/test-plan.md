# Test Plan

> **Overview:** Defines what needs to be tested in the Along App and at what level. Agents reference this when writing tests or running the self-heal loop. The project uses Jest with React Testing Library. Updated as new features are added.

---

## Unit Tests

> **Section summary:** Tests for individual functions and modules in isolation. Located in `app/__tests__/` and colocated `*.test.ts` files.

- [ ] `app/lib/utils/format.ts` — all formatting functions
- [ ] `app/lib/utils/validation.ts` — all Zod schemas
- [ ] `app/lib/utils/auth.ts` — token parsing utilities
- [ ] `app/lib/utils/cloudinary.ts` — file validation functions
- [ ] `app/lib/utils/feedHelpers.ts` — feed ranking logic
- [ ] `app/lib/utils/security.ts` — security utility functions
- [ ] `app/lib/utils/rateLimiter.ts` — rate limit logic (mock Redis)

---

## Integration Tests

> **Section summary:** Tests for how modules work together, including API routes and database operations.

- [ ] `POST /api/auth/login` — valid credentials, invalid credentials, missing fields
- [ ] `POST /api/auth/register` — new user, duplicate email, duplicate username
- [ ] `GET /api/posts` — returns paginated list, respects cursor
- [ ] `POST /api/posts` — creates post with valid data, fails without auth
- [ ] `POST /api/posts/[id]/like` — toggles like, updates count
- [ ] `GET /api/users/[id]` — returns profile, 404 for missing user
- [ ] `POST /api/users/[id]/follow` — follow/unfollow cycle
- [ ] `GET /api/notifications` — returns user notifications, marks as read

---

## Component Tests

> **Section summary:** Tests for React components using Testing Library.

- [ ] Login form — renders, validates, submits correctly
- [ ] Register form — renders, validates, submits correctly
- [ ] Post card — renders post data, like/bookmark buttons work
- [ ] Profile page — renders user data correctly
- [ ] Navigation — renders correct links for authenticated user

---

## End-to-End Tests

> **Section summary:** Tests that simulate real user journeys through the system. (Not yet implemented — to be added in Phase 4.)

- [ ] User registration → OTP verification → login flow
- [ ] Create post → appears in feed → another user likes it
- [ ] User follows another → sees their posts in feed
- [ ] Search for a route → bookmark it → appears in bookmarks

---

## Performance Tests

> **Section summary:** Tests to verify the system performs acceptably under expected load.

- [ ] API response time < 500ms for list endpoints (with Redis cache)
- [ ] API response time < 200ms for cache hits
- [ ] Image upload completes within 5 seconds for files up to 10MB
- [ ] Page load time (LCP) < 2.5s for dashboard home
