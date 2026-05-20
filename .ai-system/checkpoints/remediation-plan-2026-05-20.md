# Remediation Plan — 2026-05-20

> **Overview:** Comprehensive audit findings and remediation plan for Along App quality issues. Root causes identified across OAuth, theme consistency, seed data, and avatar customization.

---

## 1. Issues Found & Fixes Applied

### 1.1 OAuth "Not Configured" Response

**Problem:** `GOOGLE_REDIRECT_URI` was empty in `.env`, causing Google OAuth to return 503 "not configured" even though `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` were present.

**Root Cause:** OAuth redirect URI not set in environment.

**Fix Applied:**
- Set `GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback` in `.env`

**Files Changed:**
- `.env` — added `GOOGLE_REDIRECT_URI`

---

### 1.2 Hardcoded Blue Link Colors

**Problem:** Some links and text retained native browser blue color instead of using Along brand tokens. Also several hardcoded hex values scattered across the codebase not respecting dark mode.

**Root Cause:** Legacy components using raw hex colors (`#00623B`, `text-gray-600`, `bg-white`) instead of CSS variables.

**Fix Applied (Audit sweep):**
- `app/page.tsx` — replaced `text-gray-600` → `text-[var(--color-text-secondary)]`; `#00623B` → `var(--color-primary)`; `hover:bg-gray-50` → `hover:bg-[var(--color-bg-elevated)]`
- `app/components/features/auth/OtpForm.tsx` — replaced `text-gray-600`, `text-gray-900`, `bg-gray-100`, `border-gray-300`, `#00623B` with CSS variables
- `app/components/features/posts/ShareRouteModal.tsx` — added `!text-[var(--color-text-primary)]` to icon button
- `app/components/features/dashboard/profile/page.tsx` — replaced `#00623B` / `#004d2e` → `var(--color-primary)` / `var(--color-primary-light)`
- `app/components/features/dashboard/profile/[username]/page.tsx` — same as above
- `app/(dashboard)/invite/page.tsx` — replaced `bg-white` → `bg-[var(--color-bg-base)]`
- `app/components/ErrorBoundary.tsx` — replaced `bg-gray-50` → `bg-[var(--color-bg-elevated)]`

**Files Changed:**
- `app/page.tsx`
- `app/components/features/auth/OtpForm.tsx`
- `app/components/features/posts/ShareRouteModal.tsx`
- `app/(dashboard)/profile/page.tsx`
- `app/(dashboard)/profile/[username]/page.tsx`
- `app/(dashboard)/invite/page.tsx`
- `app/components/ErrorBoundary.tsx`

**Note:** No native browser blue links found — global `a { color: var(--color-primary) }` rule in `globals.css` is correctly applied.

---

### 1.3 Seed Data Missing Images & Map Coordinates

**Problem:** All 10 seed posts had empty `images: []` arrays, meaning no map preview thumbnails and no image galleries in the feed. Also no `startLat`, `startLng`, `endLat`, `endLng`, `region`, or `totalDistanceKm` fields — maps would not render in PostCard components.

**Root Cause:** Seed data created with placeholder empty arrays; geographic coordinates never added.

**Fix Applied:**
- Extended `SeedPost` interface to include `startLat?`, `startLng?`, `endLat?`, `endLng?`, `region?`, `totalDistanceKm?` fields
- Added 2 Cloudinary placeholder image URLs per post (10 posts = 20 images)
- Added real Nigerian location coordinates for all 10 posts (Lagos, Ibadan, Abuja, Enugu, Calabar, Owerri, Port Harcourt, Kano, Jos, Lekki)
- Added region labels and approximate distances
- Updated Prisma `create` call to include all geographic fields

**Files Changed:**
- `prisma/seed.ts` — full seed data overhaul

---

### 1.4 DiceBear Avatar Editor — Per-Style Customization

**Problem:** `AvatarEditor` only allowed background color selection. DiceBear offers far more options per style (skin tone, hair color, headwear, clothing color, etc.) but these were not exposed in the UI.

**Root Cause:** `AvatarConfig` interface only had 4 fields; no style-specific option controls built.

**Fix Applied:**
- Extended `avatar.ts` with `StyleOption`, `StyleConfig`, and `AVATAR_STYLE_CONFIGS` for all 9 styles
- Added per-style configuration objects with color pickers, select dropdowns, and option arrays
- Added `buildAvatarUrlWithOptions()` function to handle style-specific query params
- Added `getStyleConfig()`, `getAllStyles()` helper functions
- Rewrote `AvatarEditor.tsx` to:
  - Show style grid with descriptions
  - Display style-specific option controls (color pickers for skin/hair, select dropdowns for headwear/expressions)
  - Live preview updates in real time as options change
  - Background color always shown
- Updated `app/api/users/[id]/avatar/route.ts` to validate and store per-style options

**Files Changed:**
- `app/lib/config/avatar.ts` — complete rewrite with style configs
- `app/components/features/profile/AvatarEditor.tsx` — complete rewrite
- `app/api/users/[id]/avatar/route.ts` — updated schema and validation

---

## 2. Additional Findings

### Already Correct (No Action Needed)

- **Native blue links:** `globals.css` global `a { color: var(--color-primary) }` rule correctly applies brand green to all links
- **Theme tokens in PostCard:** All route text, status badges, action buttons use `var(--color-*)` correctly
- **DashboardNavbar:** Uses CSS variables for active state (`bg-[var(--color-primary)]`) and hover (`hover:bg-[var(--color-bg-elevated)]`)
- **AppCard:** All variant classes use CSS variables
- **AppFooter:** All text colors use CSS variables
- **LoginForm:** Link styled with `text-[var(--color-primary)]`
- **OAuth flow:** Google callback handler is correctly implemented with user upsert logic

### Remaining Items (Lower Priority)

- Some Ant Design components may still use raw color values in Ant token overrides — affects only Ant Design internals, not custom components
- `app/conflicting/` directory exists as legacy reference — never modify per architecture guidelines

---

## 3. Pre-Deployment Checklist

- [ ] Run `npx prisma migrate dev` with valid `LOCAL_DB` env set
- [ ] Run `npx prisma db seed` to populate data with images and map coordinates
- [ ] Verify Google OAuth flow at `http://localhost:3000/api/auth/google`
- [ ] Run `npm run build` to confirm no regressions
- [ ] Run `npm test` to verify no test breakage
- [ ] Upload actual images to Cloudinary `along-app/` folder (20 placeholder URLs in seed currently point to Cloudinary path but no images uploaded yet)
- [ ] Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for production Maps functionality

---

## 4. Environment Changes

| Variable | Before | After |
|---|---|---|
| `GOOGLE_REDIRECT_URI` | (empty) | `http://localhost:3000/api/auth/google/callback` |

---

*Generated: 2026-05-20 — Source: `.ai-system/planning/along_copilot_plan_v2.md` + full codebase audit*