# Test Plan

> **Overview:** Defines what needs to be tested in Along and at what level. Agents reference this when writing tests or running the self-heal loop. Jest + React Testing Library are configured with coverage thresholds (branches 70%, functions 70%, lines 80%, statements 80%). No tests exist yet — this plan defines the testing targets.

---

## Unit Tests

> **Section summary:** Tests for individual functions and modules in isolation.

- [ ] `BaseRepository<T>` — CRUD operations, pagination, transaction handling
- [ ] Service layer methods (AuthService, FeedService, SearchService, ValidityEngine, DraftingCoach, RewardsService)
- [ ] Config registry validation — all config files export valid objects
- [ ] Utility functions (string formatting, date helpers, validation helpers)
- [ ] Zod schema validation for all API routes
- [ ] JWT utility functions (sign, verify, decode)

---

## Integration Tests

> **Section summary:** Tests for how modules work together, including database operations and API routes.

- [ ] Auth API routes (register → login → refresh → logout flow)
- [ ] Post CRUD (create, read, update, delete via API)
- [ ] Like/unlike toggle via API
- [ ] Comment creation and retrieval
- [ ] Bookmark save/remove flow
- [ ] Follow/unfollow user flow
- [ ] Search endpoint with filters and pagination
- [ ] Feed route with cursor-based pagination
- [ ] Notification creation and delivery
- [ ] Rate limiter integration

---

## Component Tests

> **Section summary:** Tests for UI components using React Testing Library.

- [ ] AppButton (variants, loading state, disabled, click handler)
- [ ] AppCard (rendering children, title, loading skeleton)
- [ ] AppInput (value changes, error state, disabled)
- [ ] AppEmptyState (renders message, icon, CTA button)
- [ ] AppUserLabel (renders user info, trust badge)
- [ ] AppModal (open/close, confirm/cancel handlers)
- [ ] TrustBadge (renders correct badge for trust level)
- [ ] PostCard (renders post content, like/bookmark actions)
- [ ] GlobalConfirmModal (confirmation flow)

---

## End-to-End Tests

> **Section summary:** Tests that simulate real user journeys through the system.

- [ ] User registration → login → create post → view in feed
- [ ] Search for route → view on map → bookmark
- [ ] Follow user → receive notification → view notification
- [ ] Admin login → view dashboard → moderate content

---

## Performance Tests

> **Section summary:** Tests to verify the system performs acceptably under expected load.

- [ ] API response time under normal load (< 200ms for cached, < 500ms for uncached)
- [ ] Feed pagination performance with large datasets
- [ ] Map clustering performance with 1000+ markers
- [ ] Lighthouse audit for page load performance
- [ ] Bundle size analysis (main.js, Ant Design tree-shaking)
