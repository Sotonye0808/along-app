# Project Plan

> Overview: High-level plan and status for Along.

---

## Phase 0-5 (Complete)

- [x] Config registry and universal components
- [x] Global services (modal, toast, undo)
- [x] Prisma schema and services
- [x] SEO system and structured data
- [x] MapLibre migration and explore map
- [x] Admin suite and bug reporting
- [x] Push notifications, QStash workers, Sentry
- [x] PWA audit and CI pipeline

---

## Phase 6 (Active) - Compliance Remediation

- [ ] Remove hardcoded colors in UI and align to CSS vars
- [ ] Replace direct Ant Design usage in feature components
- [ ] Replace Ant icons and emoji with Lucide icons
- [x] Fix dead routes (settings) and nav alignment
- [x] Stabilize PWA install prompt and service worker update flow
- [ ] Update README and ai-system docs to current state

---

## Phase 7 — Design Reconciliation & Data Model

- [x] Design-to-code gap analysis against all 15+ design HTML files
- [x] Fix high-priority visual gaps (sticky search, trust badge, related cards, profile grid/stats, card shadow, vehicle filters, map markers)
- [x] Add `waypoints` (Json) to Post model for map polyline rendering
- [x] Add waypoint data and estimatedMins to seed data
- [x] Update RouteMap with polyline + numbered waypoint markers
- [ ] Accessibility audit (WCAG AA)
- [ ] Performance audit (Core Web Vitals)
- [ ] Final lint/test debt cleanup
