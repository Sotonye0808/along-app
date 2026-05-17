# Along Compliance Audit - 2026-05-07

Scope: Engineering plan v2, design system, config-driven rules, universal components, theme compliance, navigation routes, PWA behavior, and documentation drift.
Sources: .ai-system/planning/along_copilot_plan_v2.md, .ai-system/agents/design-system.md, .ai-system/docs/Along_Stitch_Design_Brief.md, .ai-system/docs/Along_PRD_Engineering_Roadmap_v2.md.

## Executive Summary

Status: Partial compliance. Core feature scope is largely implemented, but several UI and docs areas drift from the plan.
Key blockers:

- Hardcoded colors and Tailwind gray classes cause theme mismatch (persistent light colors in dark mode).
- Direct Ant Design usage and Ant icons in feature components violate the universal component and Lucide-only rules.
- PWA install prompt and service worker update handling are noisy and non-compliant (emoji, Ant icons, repeated prompts).
- Navigation includes a dead route (/settings) and route wiring is inconsistent with NAV_REGISTRY.
- Documentation (README, repo map, system architecture, design system) is out of sync with the current codebase and plan.

## Findings

### 1) Design tokens and theme compliance

Issue: Hardcoded colors and gray utility classes appear across layouts and components, creating persistent light UI elements in dark mode.
Evidence:

- [app/(dashboard)/layout.tsx](<app/(dashboard)/layout.tsx>)
- [app/(auth)/layout.tsx](<app/(auth)/layout.tsx>)
- [app/components/features/navigation/MobileTopBar.tsx](app/components/features/navigation/MobileTopBar.tsx)
- [app/components/features/dashboard/SearchBar.tsx](app/components/features/dashboard/SearchBar.tsx)
- [app/components/ui/CookieConsent.tsx](app/components/ui/CookieConsent.tsx)
- [app/components/ui/GlobalUndoToast.tsx](app/components/ui/GlobalUndoToast.tsx)
- [app/components/ui/AppAvatar.tsx](app/components/ui/AppAvatar.tsx)
- [app/components/ui/AppTag.tsx](app/components/ui/AppTag.tsx)
- [app/components/features/pwa/NotificationSettings.tsx](app/components/features/pwa/NotificationSettings.tsx)
- [app/components/features/pwa/OfflineIndicator.tsx](app/components/features/pwa/OfflineIndicator.tsx)

Issue: Ant Design theme tokens are hardcoded hex values in the provider instead of CSS variables.
Evidence:

- [app/providers/AntdProvider.tsx](app/providers/AntdProvider.tsx)

Impact: Theme toggling does not fully propagate to components. Visual mismatch with design system and Stitch brief.

### 2) Universal component and icon compliance

Issue: Direct Ant Design usage in feature components and pages (should be App\* wrappers).
Evidence:

- [app/components/features/dashboard/ShareRouteButton.tsx](app/components/features/dashboard/ShareRouteButton.tsx)
- [app/components/features/dashboard/SearchBar.tsx](app/components/features/dashboard/SearchBar.tsx)
- [app/components/features/navigation/MobileTopBar.tsx](app/components/features/navigation/MobileTopBar.tsx)
- [app/components/features/pwa/InstallPrompt.tsx](app/components/features/pwa/InstallPrompt.tsx)
- [app/components/features/pwa/NotificationSettings.tsx](app/components/features/pwa/NotificationSettings.tsx)
- [app/components/features/navigation/ScrollToTop.tsx](app/components/features/navigation/ScrollToTop.tsx)
- [app/components/ErrorBoundary.tsx](app/components/ErrorBoundary.tsx)
- [app/(dashboard)/posts/[id]/page.tsx](<app/(dashboard)/posts/[id]/page.tsx>)

Issue: Ant Design icons and emojis appear in UI. Plan requires Lucide icons only and no emoji in UI.
Evidence:

- [app/components/features/pwa/InstallPrompt.tsx](app/components/features/pwa/InstallPrompt.tsx)
- [app/components/features/dashboard/SearchBar.tsx](app/components/features/dashboard/SearchBar.tsx)
- [app/components/features/navigation/ScrollToTop.tsx](app/components/features/navigation/ScrollToTop.tsx)
- [app/components/ErrorBoundary.tsx](app/components/ErrorBoundary.tsx)

Impact: Violates icon-only (Lucide) and no-emoji rules. Visual inconsistency.

### 3) Navigation and route integrity

Issue: /settings route is referenced but not implemented.
Evidence:

- [app/components/features/navigation/DesktopTopBar.tsx](app/components/features/navigation/DesktopTopBar.tsx)
- [app/components/features/navigation/MobileTopBar.tsx](app/components/features/navigation/MobileTopBar.tsx)

Impact: Dead route and broken navigation path.

### 4) PWA prompt and service worker behavior

Issue: Install prompt uses emoji and Ant Design Modal/Button and appears in root layout, leading to repeat prompt reports. No user-friendly deferral beyond a 7-day localStorage gate.
Evidence:

- [app/layout.tsx](app/layout.tsx)
- [app/components/features/pwa/InstallPrompt.tsx](app/components/features/pwa/InstallPrompt.tsx)

Issue: Service worker registration forcibly unregisters all SWs before registering a new one. Update prompt relies on confirm dialog and can be re-triggered as SWs are reinstalled.
Evidence:

- [app/components/ServiceWorkerRegistration.tsx](app/components/ServiceWorkerRegistration.tsx)
- [app/lib/utils/sw-register.ts](app/lib/utils/sw-register.ts)

Impact: Repeated prompts and update noise during navigation or reloads.

### 5) Config-driven compliance

Issue: Hardcoded theme and validation constants exist outside config registry.
Evidence:

- [app/lib/constants/index.ts](app/lib/constants/index.ts)

Issue: Hardcoded VAPID key fallback in client UI.
Evidence:

- [app/components/features/pwa/NotificationSettings.tsx](app/components/features/pwa/NotificationSettings.tsx)

Impact: Violates config-driven rule and risks leaking sensitive defaults.

### 6) Documentation drift (ai-system and README)

Issue: Design system doc still references Ant Design default blue and Ant icons, conflicting with plan v2 and current tokens.
Evidence:

- [.ai-system/agents/design-system.md](.ai-system/agents/design-system.md)

Issue: System architecture and repo map reference removed modules (mock-backend, app/lib/data) and outdated versions.
Evidence:

- [.ai-system/agents/system-architecture.md](.ai-system/agents/system-architecture.md)
- [.ai-system/index/repo-map.md](.ai-system/index/repo-map.md)
- [.ai-system/index/dependency-graph.md](.ai-system/index/dependency-graph.md)

Issue: README versions and setup steps are outdated, and env vars are incomplete.
Evidence:

- [README.md](README.md)

## Remediation Plan (Compliance Assurance)

Phase A - Design token normalization

1. Replace all hardcoded colors and gray utility classes in app/pages/components with CSS variables or semantic Tailwind tokens.
2. Update AntdProvider tokens to use CSS variables instead of hex values.
3. Normalize AppTag, AppAvatar, CookieConsent, GlobalUndoToast, OfflineIndicator, and auth/dashboard layouts to use tokenized colors.

Phase B - Universal component and icon compliance

1. Replace direct Ant Design usage in features/pages with App\* components (AppButton, AppModal, AppCard, AppInput, AppTag, AppAvatar, AppSpinner, AppPageLoader).
2. Replace all Ant icons and emoji with Lucide icons. Remove emoji from UI text.

Phase C - Navigation and routing

1. Remove or implement /settings route. Align DesktopTopBar/MobileTopBar with NAV_REGISTRY and APP_ROUTES.
2. Validate nav routes against existing pages; add redirects or not-found handling for deprecated paths.

Phase D - PWA prompt and service worker cleanup

1. Move InstallPrompt behind an explicit user action or show it once per session with a durable dismiss gate.
2. Rebuild InstallPrompt using AppModal/AppButton and Lucide icons.
3. Remove forced unregister in sw-register; switch to standard update flow with a single, non-blocking toast/confirm.

Phase E - Config and security

1. Move THEME_COLORS and VALIDATION into lib/config (or remove in favor of existing config modules).
2. Remove hardcoded VAPID key fallback in NotificationSettings. Require env value.
3. Align server/client VAPID env names and document them in .env.example.

Phase F - Documentation sync

1. Update README, repo map, dependency graph, system architecture, and design-system docs to reflect current state.
2. Add/update .env.example with all required variables.

## Acceptance Criteria

- No direct Ant Design imports in feature/page components (only in App\* wrappers).
- No emoji in UI. All icons are Lucide.
- Theme toggle fully updates UI; no persistent white backgrounds in dark mode.
- /settings route no longer dead.
- PWA prompt appears only when intended; no repeated prompts during navigation.
- README and .ai-system docs reflect current architecture and dependencies.

## Commands to Run (ai-system)

1. update-ai-system.md
   Directive: Sync repo map, dependency graph, system architecture, project plan, and summaries after compliance fixes.

2. refactor-codebase.md
   Directive: Replace direct Ant Design usage in feature components with App\* wrappers and remove hardcoded colors.

3. dev-cycle.md
   Directive: Run build, tsc, tests, and lint after each compliance batch.

## Local Verification Commands

npm run build
npx tsc --noEmit
npm test -- --passWithNoTests
npx next lint

## Deliverables

- Compliance fixes across UI and PWA components
- Updated .ai-system docs and README
- .env.example with full variable list
