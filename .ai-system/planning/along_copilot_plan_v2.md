# Along — Complete Development Execution Plan
> **For:** GitHub Copilot (Workspace / Cloud Sessions / Agent mode)
> **Version:** 2.0 · April 2026
> **Authority documents:** along_copilot_plan_v2.md · Along_PRD_Engineering_Roadmap_v2.md · Google Stitch Designs · Along_Stitch_Design_Brief.md · PROJECT_CONTEXT.md
> **Workflow system:** `.ai-system` (already bootstrapped in repo)
> **Design reference (live):** https://stitch.withgoogle.com/projects/16594300379552668715
> **Design reference (local images):** `.ai-system/stitch_designs/`

---

## AGENT BOOTSTRAP INSTRUCTIONS

**Read this entire section before touching a single file.**

You are executing a complete revamp, refactoring, and feature-build of the Along app — a social travel-intelligence platform (Twitter × Google Maps hybrid for West African transport routes). The codebase is partially built. Your job is to execute this plan in phase order at maximum speed with continuous integrity assurance.

### Session Startup Protocol

Before each task or session:
1. Read `.ai-context.md` — project overview and stack
2. Read `.ai-system/agents/system-architecture.md` — current architecture state
3. Read `.ai-system/planning/task-queue.md` — confirm your exact next task
4. Read `.ai-system/checkpoints/session-log.md` — what was last completed and any blockers
5. Cross-reference `.ai-system/agents/design-system.md` before implementing any UI

### Session End Protocol

After each task:
1. Update `.ai-system/checkpoints/session-log.md` (what was done, current state, next task)
2. Update `.ai-system/planning/task-queue.md` — mark `[x]` on completed tasks
3. Log architectural decisions in `.ai-system/memory/project-decisions.md`
4. Log any error patterns resolved in `.ai-system/agents/repair-system.md`
5. Run `npm run build` — if it fails, fix it before marking the task done

### Execution Pace Expectation

With AI-assisted development and the level of detail in this plan, **multiple tasks and even full phases are expected to be completed in a single session**. Do not slow-drip one task per session. Execute sequentially and continuously, cross-referencing this document, the PRD (at .ai-systems/docs), design brief, and stitch design images at each step to ensure fidelity. The phased timeline in the PRD (weeks) is a human reference — your execution should be dramatically faster.

When a task depends on a previous one, complete them in order within the same session. Never leave the codebase in a broken state between tasks.

### Existing Code Overhaul Policy

**You are authorized and expected to rewrite existing files** to achieve full compliance with the config-driven, OOP, zero-hardcode, icon-only principles described in this plan. "Refactoring" is not cosmetic — it means replacing incompatible patterns entirely. If an existing component uses hardcoded vehicle labels, emoji, inline nav arrays, or direct Prisma calls outside of repositories, **rewrite the entire component** to comply. Do not patch non-compliant code — replace it.

---

## NON-NEGOTIABLE RULES (APPLY EVERYWHERE, ALWAYS)

These are architectural laws. Violations must be corrected before moving forward, even if it means rewriting existing code.

### Config & Architecture
- **No hardcoded values** in any component, hook, or page that belong in `lib/config/*`. Add to the registry, import from it.
- **No emoji** anywhere in the UI. All iconography uses Lucide React components. Zero exceptions.
- **No role-specific components.** Write role-aware components that receive role from context and filter via `filterNavItems()` or equivalent config functions.
- **No direct Prisma calls** outside of `lib/db/*` repository classes. All DB access through the repository pattern.
- **All multi-step DB mutations** use `prisma.$transaction([])`. Single mutations are acceptable without a transaction.
- **All destructive or sensitive UI actions** must be gated by `await ModalService.confirm(...)` before execution.
- **Interface-first:** Define the TypeScript interface before the implementation. No `any` types in new files.

### Design & Styling
- **Design token compliance is mandatory.** Use CSS custom properties (`var(--color-primary)`) and Tailwind semantic tokens. Never raw hex values in component or style files.
- **The design system** (`.ai-system/agents/design-system.md` and `Along_Stitch_Design_Brief.md`) is the **absolute source of truth** for visual output. The Google Stitch designs and the images in `.ai-system/stitch_designs/` are visual references and guides — use them for intent, layout, and component structure, but fill any responsiveness gaps or ambiguities using the design system spec. The design system wins when Stitch and spec conflict.
- **Logo and icons are already in `public/`.** Do not regenerate or replace them. Use `public/logo.svg`, `public/favicon.ico`, `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`, `public/og-image.png` as-is.
- **Glass morphism** applies to: map overlay cards, notification dropdowns, floating panels, hero sections over maps. Values in Along_Stitch_Design_Brief.md §4.

### Components
- **Prefer universal reusable components** from `components/ui/` over direct Ant Design imports in page or feature files. See §UNIVERSAL COMPONENT SYSTEM. If a universal wrapper doesn't exist and you need Ant Design functionality twice or more, create the wrapper first.
- **ConfigDrivenForm and ConfigDrivenList** must be used for all forms and lists that have 3+ items or are likely to grow. Do not write one-off `<Form.Item>` trees in feature files.
- Build pass at every phase checkpoint is mandatory.

---

## RESOURCE INDEX

| Resource | Location |
|---|---|
| PRD + Architecture Spec | `.ai-system/docs/Along_PRD_Engineering_Roadmap_v2.md` |
| Design Brief (design system spec) | `.ai-system/docs/Along_Stitch_Design_Brief.md` (absolute source of truth for visuals) |
| Stitch Design Images (local) | `.ai-system/stitch_designs/` — screenshots/exports from Google Stitch |
| Stitch Design System File | `.ai-system/stitch_designs/design-system.md` or `design-system.*` — absolute design system authority |
| Google Stitch Live Link | https://stitch.withgoogle.com/projects/16594300379552668715 |
| Logo & Icon Assets | `public/logo.svg`, `public/favicon.ico`, `public/icon-*.png` (already placed) |
| Project Context | `.ai-system/agents/project-context.md` |
| System Architecture | `.ai-system/agents/system-architecture.md` |
| Design System Agent Doc | `.ai-system/agents/design-system.md` |
| Task Queue | `.ai-system/planning/task-queue.md` |
| Session Log | `.ai-system/checkpoints/session-log.md` |
| Decisions Log | `.ai-system/memory/project-decisions.md` |
| Repair Log | `.ai-system/agents/repair-system.md` |

---

## DESIGN CONSUMPTION INSTRUCTIONS

### How to use the Stitch designs
1. **`.ai-system/stitch_designs/`** contains exported images and the design system file from Google Stitch. Reference these for: layout intent, spacing patterns, component visual structure, color usage in context, page composition.
2. **`Along_Stitch_Design_Brief.md`** (in `.ai-system/docs/`) is the machine-readable translation of those designs into exact specs — tokens, spacing, component APIs, interaction patterns. This is what you implement from.
3. **The design system (`stitch_designs/design-system.md` or equivalent file)** exported from Stitch is the **absolute design source of truth.** All component styling decisions defer to it.
4. **Stitch images are guides, not hard constraints.** Where the images show a layout at one viewport size and the design system spec describes responsive breakpoints, implement the full responsive behavior per the spec. Fill gaps using design system tokens and standard web UX conventions consistent with Twitter and Google Maps patterns.
5. **The live Stitch link** (https://stitch.withgoogle.com/projects/16594300379552668715) may be consulted if you have browser access. Use it as a secondary visual sanity check.
6. **Logo and assets:** They are already in `public/`. Do not regenerate them.

---

## TECH STACK (TARGET — post Phase 0)

| Layer | Package | Version |
|---|---|---|
| Framework | `next` | 15.3.x |
| UI Runtime | `react` + `react-dom` | 19.1.x |
| Language | `typescript` | 5.7.x |
| UI Library | `antd` | 5.23.x |
| Icons | `lucide-react` | 0.469.x |
| Styling | `tailwindcss` | 4.1.x |
| ORM | `prisma` | 7.1.x |
| Cache | `@upstash/redis` | latest |
| Job Queue | `@upstash/qstash` | 2.7.x |
| Auth | `jsonwebtoken` + `bcrypt` + `js-cookie` | latest |
| Validation | `zod` | 4.x latest |
| Images | `next-cloudinary` | 6.16.x |
| Maps | `maplibre-gl` + `react-map-gl` | 4.7.x + 7.1.x |
| Polyline | `@mapbox/polyline` | latest |
| Map clustering | `supercluster` | latest |
| Avatars | DiceBear API v9 (URL-based, no npm package) | — |
| QR Codes | `qrcode.react` | latest |
| Reactive | `rxjs` | 7.8.x |
| SEO | `next/head` + Next.js Metadata API | built-in |
| Markdown | `react-markdown` + `remark` | latest |
| Charts | `@ant-design/charts` | latest |
| Testing | `jest` + `@testing-library/react` | 30.x + 16.3.x |
| PWA | `workbox-webpack-plugin` | 7.3.x |

---

## UNIVERSAL COMPONENT SYSTEM

**Before writing any page or feature component, check whether a universal component already exists in `components/ui/` that should be used.** If not, and the pattern appears in 2+ places, create the universal component first.

The goal: **zero raw Ant Design imports in page files or feature components for common patterns.** All Ant Design consumption is wrapped and standardized. This achieves visual consistency, centralized theming, and ease of global style changes.

### Required Universal Components

Create all of the following in `app/components/ui/`. Each wraps Ant Design (or is a custom implementation) and enforces the Along design system.

---

#### `AppButton`
**File:** `components/ui/AppButton.tsx`

Wraps Ant Design `Button`. Adds Along design system variants and standardizes usage across the app. Direct Ant Design `<Button>` imports are banned in page/feature files.

```typescript
interface AppButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'icon';
  size?: 'sm' | 'default' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  href?: string;         // renders as <a> if set
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;    // required for icon-only buttons (accessibility)
}
```

Variants:
- `primary`: `bg-primary text-white hover:bg-primary-light`
- `secondary`: `bg-transparent border border-primary text-primary hover:bg-primary/10`
- `ghost`: `bg-transparent text-text-secondary hover:bg-bg-elevated`
- `destructive`: `bg-error text-white hover:brightness-90`
- `icon`: icon-only, circular, `p-2`, requires `ariaLabel`

---

#### `AppTable`
**File:** `components/ui/AppTable.tsx`

Universal table wrapping Ant Design `Table`. All table usages (admin, analytics, leaderboards) use this.

```typescript
interface AppTableProps<T> {
  columns: AppTableColumn<T>[];
  data: T[];
  loading?: boolean;
  rowKey: keyof T | ((row: T) => string);
  onRowClick?: (row: T) => void;  // navigates or triggers detail panel
  rowHref?: (row: T) => string;   // if set, row is a subtle link (no border/decoration, pointer cursor)
  pagination?: AppPaginationConfig | false;
  emptyState?: EmptyStateConfig;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  size?: 'small' | 'default';
  stickyHeader?: boolean;
  className?: string;
}

interface AppTableColumn<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}
```

**Subtle row linking:** When `rowHref` is set, the entire row is a `<Link>` with `style={{ cursor:'pointer' }}`. Action buttons in cells use `e.stopPropagation()` to prevent row navigation interference. This is the standard pattern for admin user tables (row → profile), post tables (row → post detail), etc.

---

#### `AppEmptyState`
**File:** `components/ui/AppEmptyState.tsx`

Standardized empty state for all lists, tables, search results, and filtered views.

```typescript
interface EmptyStateConfig {
  icon?: LucideIcon;           // Lucide icon (no emoji)
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  size?: 'sm' | 'default' | 'lg';
}
```

Pre-configured instances (export these for reuse):
```typescript
export const EMPTY_STATES = {
  noRoutes:     { icon: MapPin,     title: 'No routes yet',         description: 'Share the first route for this area.' },
  noPosts:      { icon: FileText,   title: 'No posts yet',          description: 'Be the first to share a route.' },
  noResults:    { icon: SearchX,    title: 'No results',            description: 'Try different keywords or filters.' },
  noFollowers:  { icon: Users,      title: 'No followers yet',      description: 'Share your profile to grow your network.' },
  noFollowing:  { icon: UserPlus,   title: 'Not following anyone',  description: 'Discover routes and follow travelers.' },
  noNotifications: { icon: Bell,   title: 'All caught up',         description: 'No new notifications.' },
  noBookmarks:  { icon: Bookmark,   title: 'No bookmarks',          description: 'Save routes you want to revisit.' },
  offline:      { icon: WifiOff,    title: 'You\'re offline',       description: 'Check your connection and try again.' },
  error:        { icon: AlertTriangle, title: 'Something went wrong', description: 'Refresh the page or try again later.' },
  noEvents:     { icon: Calendar,   title: 'No events nearby',      description: 'Check back later for events in your area.' },
};
```

---

#### `AppModal`
**File:** `components/ui/AppModal.tsx`

Universal modal wrapping Ant Design `Modal`. Enforces consistent header, close button, footer layout, and responsive sizing. Used for all modals: ShareRouteModal, AvatarEditor, EditProfileModal, GlobalConfirmModal, etc.

```typescript
interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: 'primary' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'fullscreen';
  footer?: React.ReactNode | null;  // null = no footer (custom footer inside children)
  loading?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

---

#### `AppCard`
**File:** `components/ui/AppCard.tsx`

Standard card container. Used for: PostCard wrapper, dashboard stat cards, marketplace listing cards, team member cards, feature highlight cards.

```typescript
interface AppCardProps {
  variant?: 'default' | 'glass' | 'elevated' | 'flat' | 'suggestion';
  padding?: 'none' | 'sm' | 'default' | 'lg';
  hover?: boolean;    // adds hover lift shadow
  clickable?: boolean;
  onClick?: () => void;
  href?: string;      // renders as Next.js Link if set
  className?: string;
  children: React.ReactNode;
  // Glass variant props
  glassIntensity?: 'low' | 'medium' | 'high';
}
```

`suggestion` variant: adds `border-l-4 border-primary bg-primary/[0.03]` for Along Suggestion posts.

---

#### `AppTag` / `AppBadge`
**File:** `components/ui/AppTag.tsx`

Unified tag and badge component. Replaces all inline `<span>` pill patterns, Ant Design `Tag`, and hardcoded badge elements.

```typescript
interface AppTagProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted';
  size?: 'xs' | 'sm' | 'default';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  removable?: boolean;
  onRemove?: () => void;
  pill?: boolean;     // border-radius 999px
  dot?: boolean;      // colored dot prefix (for status indicators)
  onClick?: () => void;
  className?: string;
}
```

---

#### `AppAvatar`
**File:** `components/ui/AppAvatar.tsx`

Single avatar component used everywhere. Replaces all `<img>` avatar usages.

```typescript
interface AppAvatarProps {
  user: { userName: string; firstName: string; avatarConfig?: AvatarConfig | null; verified?: boolean };
  size?: 24 | 32 | 40 | 56 | 80 | 120;
  linkToProfile?: boolean;   // wraps in Next.js Link to /profile/[userName] — default true
  showVerifiedBadge?: boolean;
  className?: string;
}
```

When `linkToProfile=true` (default), the avatar is a subtle link to `/profile/[userName]`. It does not interfere with parent click handlers via `e.stopPropagation()` on the anchor.

---

#### `AppUserLabel`
**File:** `components/ui/AppUserLabel.tsx`

Standardized user name + avatar inline display. Used in PostCard header, comment items, notification items, table user cells. Automatically links to user profile.

```typescript
interface AppUserLabelProps {
  user: { userName: string; firstName: string; lastName: string; avatarConfig?: AvatarConfig | null; verified?: boolean };
  avatarSize?: 24 | 32 | 40;
  showHandle?: boolean;   // shows @userName in muted text
  showFullName?: boolean; // shows firstName lastName
  layout?: 'horizontal' | 'vertical';
  linkToProfile?: boolean; // default true — clicking name/avatar navigates to /profile/[userName]
  className?: string;
}
```

**Critical:** All user name and avatar appearances in posts, comments, tables, and notifications MUST use `AppUserLabel` (or `AppAvatar` for avatar-only cases). This ensures every user mention is a subtle link to their profile, consistent with Twitter/social platform conventions.

---

#### `AppTooltip`
**File:** `components/ui/AppTooltip.tsx`
Thin wrapper over Ant Design `Tooltip` with Along styling defaults. Ensures consistent placement, arrow behavior, and delay.

#### `AppDropdown`
**File:** `components/ui/AppDropdown.tsx`
Wraps Ant Design `Dropdown` for overflow menus (post `•••`, table row actions, etc.). Standardizes item structure including icons (Lucide), colors, and disabled states.

#### `AppSkeleton`
**File:** `components/ui/AppSkeleton.tsx`
Unified loading skeleton. Pre-built variants: `PostCardSkeleton`, `UserCardSkeleton`, `TableRowSkeleton`, `StatCardSkeleton`, `MapSkeleton`. All use CSS shimmer animation from the design system.

#### `AppPagination`
**File:** `components/ui/AppPagination.tsx`
Wraps Ant Design `Pagination` with Along styling and standard page-size options. Used in all paginated lists and tables.

#### `AppDivider`
**File:** `components/ui/AppDivider.tsx`
Wraps Ant Design `Divider`. Adds `label` prop for section dividers in forms and layouts.

#### `AppInput` / `AppTextarea` / `AppSelect`
**Files:** `components/ui/AppInput.tsx`, `AppTextarea.tsx`, `AppSelect.tsx`
Wrappers over Ant Design `Input`, `Input.TextArea`, `Select`. Enforce Along border radius (6px), focus ring color (`var(--color-primary)`), error state styling, and prefix/suffix icon standardization. All form fields in ConfigDrivenForm use these.

#### `AppProgress`
**File:** `components/ui/AppProgress.tsx`
Wraps Ant Design `Progress`. Used in: DraftingCoach score bar, RewardsPanel tier progress, TrustBadge tooltip breakdown bars.

#### `AppAlert`
**File:** `components/ui/AppAlert.tsx`
Wraps Ant Design `Alert`. Along-styled variants for info, success, warning, error — used in DraftingCoach nudges, offline indicator, validation messages.

#### `AppSpinner` / `AppPageLoader`
**Files:** `components/ui/AppSpinner.tsx`, `AppPageLoader.tsx`
`AppSpinner`: small inline spinner (Lucide `Loader2` with spin animation). `AppPageLoader`: full-page centered loading state used during initial auth check and page transitions.

#### `AppStatusDot`
**File:** `components/ui/AppStatusDot.tsx`
Colored dot for online/offline user status, post status, bug report status. Props: `status: string`, `configMap: Record<string, { color: string; label: string }>`.

---

### Component Index Export
**File:** `components/ui/index.ts`

Export everything from this barrel file. All imports of universal components use `import { AppButton, AppTable, ... } from '@/components/ui'`.

---

## SEO & META SYSTEM

Every page must have rich, accurate, dynamic metadata. This is non-negotiable for production-readiness.

### Implementation Pattern

Use Next.js 15 **Metadata API** (`export const metadata` or `export async function generateMetadata`) for all App Router pages. Never use manual `<head>` tags or `next/head` in App Router pages.

**File:** `app/lib/utils/metadata.ts`

```typescript
import type { Metadata } from 'next';

interface MetaConfig {
  title: string;
  description: string;
  path: string;
  image?: string;       // Cloudinary URL or /og-image.png fallback
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;    // for admin pages, auth pages
  canonical?: string;
  keywords?: string[];
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://along.app';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'Along';
const DEFAULT_DESCRIPTION = 'Navigate Together. Discover and share transport routes in your city.';

export function buildMetadata(config: MetaConfig): Metadata {
  const title = `${config.title} | Along`;
  const image = config.image ?? DEFAULT_OG_IMAGE;
  const canonical = config.canonical ?? `${BASE_URL}${config.path}`;

  return {
    title,
    description: config.description,
    keywords: config.keywords,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical },
    robots: config.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description: config.description,
      url: canonical,
      siteName: SITE_NAME,
      type: config.type ?? 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: config.description,
      images: [image],
      site: '@alongapp',
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
  };
}

export function buildPostMetadata(post: Post, author: User): Metadata {
  const firstImage = post.images?.[0];
  return buildMetadata({
    title: post.title,
    description: `${post.routes?.length ?? 0}-step route by @${author.userName}. ${post.tags?.slice(0,3).join(', ')}.`,
    path: `/posts/${post.id}`,
    image: firstImage ?? DEFAULT_OG_IMAGE,
    type: 'article',
    keywords: post.tags,
  });
}

export function buildProfileMetadata(user: User): Metadata {
  return buildMetadata({
    title: `${user.firstName} ${user.lastName} (@${user.userName})`,
    description: user.bio ?? `Routes and travel tips by ${user.firstName} on Along.`,
    path: `/profile/${user.userName}`,
    type: 'profile',
  });
}
```

### Per-Page Metadata Requirements

| Page | Metadata Strategy | Dynamic? |
|---|---|---|
| `/` (landing) | `buildMetadata` — site description + OG image | Static |
| `/home` | `noIndex: true` (authenticated feed) | Static |
| `/explore` | "Explore transport routes near you" | Static |
| `/posts/[id]` | `buildPostMetadata(post, author)` — post title, first image | Dynamic (SSR) |
| `/profile/[username]` | `buildProfileMetadata(user)` — name, bio, avatar | Dynamic (SSR) |
| `/about` | Company description + team OG | Static |
| `/marketplace` | "Along Marketplace — route guides and transport tips" | Static |
| `/(admin)/*` | `noIndex: true` | Static |
| `/(auth)/*` | `noIndex: true` | Static |
| `/privacy`, `/terms` | Standard legal page meta | Static |
| `/invite` | "Join Along — navigate your city together" | Static |

### JSON-LD Structured Data

**File:** `app/lib/utils/structuredData.ts`

Add JSON-LD for:
- `WebSite` schema on all public pages (enables Google Sitelinks Search Box)
- `Article` schema on post detail pages (enables rich results)
- `ProfilePage` schema on user profile pages
- `Event` schema for Tega-linked posts
- `BreadcrumbList` on nested pages (post detail, admin pages)

Render via a `<StructuredData schema={...} />` component that injects a `<script type="application/ld+json">`.

### Sitemap and Robots

**File:** `app/sitemap.ts` — Next.js dynamic sitemap generator

Include: all public post URLs, all public profile URLs (paginated), static public pages. Exclude: auth pages, admin pages, API routes.

**File:** `app/robots.ts` — robots.txt generator

Disallow: `/admin`, `/api`, `/(auth)`. Allow all else.

---

## UI/UX ACCESSIBILITY & PRODUCTION FEATURES

### Cookie Consent Banner

**File:** `components/ui/CookieConsent.tsx`

A non-blocking bottom banner that appears on first visit for unauthenticated users (and authenticated users on first consent). Stores consent in a cookie (`along_cookie_consent=accepted; max-age=31536000`).

UI requirements:
- Fixed bottom, full width, `z-50`
- Message: *"Along uses necessary cookies to keep you signed in and improve your experience. By using Along, you accept this. [Find out more in our Privacy Policy →]"*
- "Privacy Policy" is an inline link to `/privacy`
- Single "Got it" button (primary style)
- Does not appear if `along_cookie_consent` cookie is already set
- GDPR-compliant — necessary cookies only, no marketing/tracking disclaimer needed for v1

**File:** `app/providers/CookieConsentProvider.tsx`

Wraps the app root. Provides `useCookieConsent()` hook for any component that needs to know consent status.

Add to the public pages layout and the root layout.

### User Tagging in Comments

**File:** `components/features/comments/CommentInput.tsx`

Implement `@mention` functionality:
- When user types `@` in a comment textarea, show a dropdown of matching users (search `/api/users/search?q=username`)
- Dropdown shows: user avatar (AppAvatar, size 32) + full name + @handle
- Selecting a user inserts `@username` into the comment text and closes dropdown
- `@username` in rendered comment text renders as a subtle link (`text-primary font-medium hover:underline`) to `/profile/[username]`
- Store mentions as an array of `{ userId, userName }` objects alongside the comment text
- Notify mentioned users via `NotificationType.MENTION`

**File:** `app/lib/utils/commentParser.ts`

```typescript
// Parse comment text and replace @username with <Link> components
export function renderCommentWithMentions(
  text: string,
  mentions: { userId: string; userName: string }[]
): React.ReactNode
```

### Subtle Contextual Links (Twitter-standard UX)

These are non-interactive-looking but clickable elements — they do not show underlines by default, only on hover. They never interfere with explicit action buttons.

Apply the following everywhere without exception:

| Element | Link Target | Behavior |
|---|---|---|
| User avatar (in post, comment, notification, table) | `/profile/[userName]` | `AppAvatar` with `linkToProfile=true` |
| User display name (in post header, comment) | `/profile/[userName]` | `AppUserLabel` with `linkToProfile=true` |
| `@username` handle | `/profile/[userName]` | `text-primary` subtle link |
| Post title (in feed, search results, related posts) | `/posts/[id]` | Next.js `Link`, no decoration |
| Tag/hashtag chip (on post) | `/explore?tag=[tag]` | Navigates to filtered explore |
| Region chip (on post) | `/explore?region=[region]` | Navigates to filtered explore map |
| Notification item (entire row) | Relevant post/profile | Entire `<li>` is a link |
| Admin table user row | `/admin/users/[id]` | `rowHref` on AppTable |
| Admin table post row | `/posts/[id]` (opens in new tab) | `rowHref` on AppTable |
| Reward tier badge | `/rewards` (or section on profile) | Subtle tooltip + link |

**All of these must be implemented using Next.js `<Link>` with `onClick={(e) => e.stopPropagation()}`** to prevent parent click handlers (like PostCard expand) from firing when a sub-element is clicked.

### Accessibility Requirements

- All interactive elements have `aria-label` — especially icon-only buttons (`AppButton variant="icon"` enforces this)
- All images have `alt` text — avatars use `${user.firstName}'s avatar`, post images use the post title
- All form inputs have associated `<label>` elements (ConfigDrivenForm handles this)
- Color contrast: all text on primary green backgrounds must be white (`#FFFFFF`) at minimum 4.5:1 ratio — verify with design tokens
- Focus rings: visible on all interactive elements (`outline: 2px solid var(--color-primary); outline-offset: 2px`)
- Keyboard navigation: modals trap focus; dropdowns close on Escape; all interactive elements reachable by Tab
- Screen reader support: `role="alert"` on toast notifications; `aria-live="polite"` on dynamic content regions (feed updates, score updates)
- Reduced motion: wrap animations in `@media (prefers-reduced-motion: reduce) { animation: none; transition: none; }`

### Additional Platform-Standard Features

These must be implemented as part of their respective phases, not as afterthoughts:

**Post interactions:**
- Double-tap / double-click on a post image to like (Twitter/Instagram pattern)
- Long-press on mobile PostCard shows context menu (like, share, bookmark, copy link)
- Share post: generates `along.app/posts/[id]` URL, native Web Share API on mobile, fallback clipboard copy
- Copy link button on PostCard overflow menu

**Profile page:**
- "Following" button changes to "Unfollow" on hover (with Lucide `UserMinus` icon) — don't just show "Following" statically
- Profile page shows mutual follows count if viewing another user's profile

**Explore map:**
- "Share this view" button: copies a URL with lat/lng/zoom in the query params (`/explore?lat=x&lng=y&zoom=z`)
- Permalinkable explore URLs

**Feed:**
- "Back to top" FAB appears after scrolling past 500px (Lucide `ArrowUp`)
- "New posts available" banner: shows count of new posts since last load, clicking scrolls to top and refreshes

**Notifications:**
- "Mark all as read" button
- Unread count shown in nav badge (from `NOTIFICATION_REGISTRY.badge`)

**Error states:**
- Custom `app/not-found.tsx` — Along-branded 404 with navigation back to home
- Custom `app/error.tsx` — Along-branded error boundary with retry button
- Custom `app/global-error.tsx` — top-level error boundary

**Loading states:**
- `app/loading.tsx` — root-level loading (AppPageLoader)
- Per-segment `loading.tsx` in each route group

---

## PHASE 0 — FOUNDATION (Execute immediately; complete all tasks before Phase 1)

**Goal:** Dependency updates, config migration, global infrastructure, Prisma schema, nav wiring. Zero new visible features — architectural groundwork only. Build must pass at end of every task.

---

### TASK 0.1 — Audit and update all dependencies

**File:** `package.json`

1. Update all packages to versions in the Tech Stack table
2. Add new packages: `lucide-react`, `maplibre-gl`, `react-map-gl`, `@mapbox/polyline`, `supercluster`, `qrcode.react`, `rxjs`, `@upstash/qstash`, `react-markdown`, `remark`, `@ant-design/charts`
3. Upgrade `tailwindcss` to v4 (has breaking changes — handled in TASK 0.2)
4. Run `npm install`, resolve all peer dependency conflicts
5. Run `npm run build` — fix any resulting errors
6. Document any packages removed or replaced in `.ai-system/memory/project-decisions.md`

**Acceptance:** `npm install` succeeds with zero errors. `npm run build` passes.

---

### TASK 0.2 — Migrate Tailwind v4

**Files:** `tailwind.config.ts`, `app/globals.css`

Tailwind v4 is CSS-first. Migration steps:
1. Add `@import "tailwindcss"` at top of `globals.css`
2. Move all custom design tokens into a `@theme { }` block in `globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #00623B;
  --color-primary-light: #00A862;
  --color-primary-dark: #004A2C;
  --color-bg-base: #FFFFFF;
  --color-bg-elevated: #F7F7F7;
  --color-bg-base-dark: #0F0F0F;
  --color-bg-card-dark: #1F1F1F;
  --color-text-primary: #232323;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  --color-success: #A4F4E7;
  --color-success-text: #15B097;
  --color-warning: #F4C790;
  --color-warning-text: #CC7914;
  --color-error: #E4626F;
  --color-error-text: #8C1823;
  --color-border: #E5E7EB;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --radius-input: 6px;
  --radius-button: 8px;
  --radius-card: 12px;
  --radius-modal: 16px;
  --radius-sheet: 24px;
  --radius-pill: 999px;
}

/* Glass morphism utility */
.glass {
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.20);
}
.dark .glass {
  background: rgba(15, 15, 15, 0.55);
}

/* Focus ring */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

3. Keep `:root` CSS custom properties for Ant Design theme token overrides
4. Fix any `@apply` directives that changed in v4
5. Verify all existing pages render correctly

**Acceptance:** `npm run build` passes. App renders with correct styles.

---

### TASK 0.3 — Create all config files

**Directory:** `app/lib/config/`

Create every file listed below. Each must export a typed TypeScript interface AND a typed constant. Zero hardcoded values elsewhere in the codebase after this task. All configs listed in the RESOURCE INDEX are to be treated as the spec.

Files to create (full implementations per PRD §1.2–1.7 and this plan's NON-NEGOTIABLE RULES):

- `vehicles.ts` — `VEHICLE_REGISTRY` with Lucide icons (full code in PRD §1.3)
- `routeStatus.ts` — `ROUTE_STATUS_REGISTRY` with Lucide icons
- `navigation.ts` — `NAV_REGISTRY` + `filterNavItems()` (full code in this plan §TASK 0.3 Nav section above)
- `forms.ts` — `REGISTER_FIELDS`, `LOGIN_FIELDS`, `EDIT_PROFILE_FIELDS`, `POST_CREATE_FIELDS`, `BUG_REPORT_FIELDS`, `CONTACT_FIELDS` as `FieldConfig[]`
- `notifications.ts` — `NOTIFICATION_REGISTRY` as `Record<NotificationType, NotificationTypeConfig>` with Lucide icons per type
- `feedAlgorithm.ts` — `DEFAULT_FEED_CONFIG` as `FeedAlgorithmConfig` with all weights
- `draftingCoach.ts` — `QUALITY_CHECKPOINTS` as `QualityCheckpoint[]` — replace all `celebrationEmoji` with `celebrationIcon: LucideIcon`
- `avatar.ts` — `DICEBEAR_BASE_URL`, `AVATAR_STYLES`, `AvatarConfig` interface, `buildAvatarUrl()`, `getFallbackAvatarUrl()` (full code in PRD §1.5)
- `footer.ts` — `FOOTER_CONFIG` with brand, links, social, devCredit (to `https://sotonye-dagogo.is-a.dev`)
- `teamConfig.ts` — `TeamMember` interface + `TEAM_MEMBERS: TeamMember[]`
- `mapIntegrations.ts` — `TRANSPORT_INTEGRATION_REGISTRY` per PRD §3.6
- `rewards.ts` — `REWARD_TIERS`, `POINTS_CONFIG`, `PointsAction` enum per PRD §7
- `inviteConfig.ts` — `INVITE_CONFIG` per PRD §7.3
- `rateLimits.ts` — promote from `lib/utils/rateLimiter.ts`
- `validationRules.ts` — all magic numbers and regex patterns from validation utilities
- `cache.ts` — `CACHE_TTL`, `CACHE_KEYS` promoted from redis utility
- `apiRegistry.ts` — full `API_REGISTRY` with method metadata
- `validityConfig.ts` — `ValidityConfig` interface + `DEFAULT_VALIDITY_CONFIG` (weights + thresholds)
- `seo.ts` — `DEFAULT_META`, `PAGE_META` (static page metadata map for all public pages)
- `emptyStates.ts` — `EMPTY_STATES` record (re-export from AppEmptyState defaults)

**Acceptance:** All config files exist, TypeScript strict mode passes, no implicit `any`.

---

### TASK 0.4 — Create all Universal Components

**Directory:** `app/components/ui/`

Implement all universal components defined in the **UNIVERSAL COMPONENT SYSTEM** section above:

- `AppButton.tsx`
- `AppTable.tsx`
- `AppEmptyState.tsx` (with `EMPTY_STATES` presets)
- `AppModal.tsx`
- `AppCard.tsx`
- `AppTag.tsx`
- `AppAvatar.tsx` (DiceBear-backed, with fallback, with optional profile link)
- `AppUserLabel.tsx` (avatar + name, always links to profile)
- `AppTooltip.tsx`
- `AppDropdown.tsx`
- `AppSkeleton.tsx` (with `PostCardSkeleton`, `UserCardSkeleton`, `TableRowSkeleton`, `StatCardSkeleton`, `MapSkeleton` exports)
- `AppPagination.tsx`
- `AppDivider.tsx`
- `AppInput.tsx`, `AppTextarea.tsx`, `AppSelect.tsx`
- `AppProgress.tsx`
- `AppAlert.tsx`
- `AppSpinner.tsx`, `AppPageLoader.tsx`
- `AppStatusDot.tsx`
- `ConfigDrivenForm.tsx` — generic form from `FieldConfig[]` using AppInput/AppSelect/etc.
- `ConfigDrivenList.tsx` — generic list from `items[]` with skeleton, empty state, pagination
- `GlobalConfirmModal.tsx` — consumes `ModalService`, renders `AppModal` with destructive/sensitive variants
- `GlobalUndoToast.tsx` — countdown bar + undo button, consumes `ToastService`
- `CookieConsent.tsx` — bottom banner with policy link
- `StructuredData.tsx` — JSON-LD script tag injector
- `AppFooter.tsx` — config-driven footer consuming `FOOTER_CONFIG`
- `TrustBadge.tsx` — validity score badge with tooltip breakdown (PRD §2.2)
- `index.ts` — barrel export of all the above

**Acceptance:** All components compile, TypeScript strict mode passes, no raw Ant Design imports leak from component internals into their usage API.

---

### TASK 0.5 — Implement global services

**Directory:** `app/lib/services/`

Create or refactor:
- `modalService.ts` — singleton imperative modal (see PRD §4.1)
- `toastService.ts` — singleton toast with `success/error/info/warning/undo` methods
- `undoService.ts` — TTL-based undo queue wired to `toastService`
- `offlineQueue.ts` — action queue for offline persistence

**Directory:** `app/providers/`

Create:
- `GlobalModalProvider.tsx` — app root wrapper, registers modal setter with ModalService
- `GlobalToastProvider.tsx` — app root wrapper, registers toast setter
- `CookieConsentProvider.tsx` — tracks consent cookie state

**File:** `app/layout.tsx`

Wrap root with all providers in correct order:
```tsx
<CookieConsentProvider>
  <GlobalToastProvider>
    <GlobalModalProvider>
      {/* AntdProvider already here */}
      {children}
      <CookieConsent />
      <GlobalConfirmModal />
      <GlobalUndoToast />
    </GlobalModalProvider>
  </GlobalToastProvider>
</CookieConsentProvider>
```

---

### TASK 0.6 — Update Prisma schema

**File:** `prisma/schema.prisma`

Apply full schema additions per PRD §5.1:
- New enums: `UserRole`, `RewardTier`, `BugStatus`, `BugCategory`, `ReviewStatus`
- Extend `User`: `role`, `rewardPoints`, `rewardTier`, `inviteCode`, `invitedById`, `googleId`, `avatarConfig`, `lastKnownLat`, `lastKnownLng`, plus self-relation for invites
- Extend `Post`: `validityScore`, `validityTier`, `startLat`, `startLng`, `endLat`, `endLng`, `region`, `totalDistanceKm`, `estimatedMins`, `isPlatformGen`, `views`, `shares`
- New models: `SiteConfig`, `BugReport`, `UserReview`, `AnalyticsEvent`
- All indexes per PRD §5.2

Run:
```bash
npx prisma migrate dev --name phase-0-schema
npx prisma generate
```

**Acceptance:** Migration succeeds. `npx prisma generate` passes. `npm run build` passes.

---

### TASK 0.7 — Overhaul existing components for config + universal component compliance

**Audit and rewrite** (not patch) every existing component that violates the rules. Key files:

- `PostCard.tsx` → use `AppCard`, `AppUserLabel`, `AppAvatar`, `AppTag`, `AppButton`, `AppDropdown`, `TrustBadge`. Replace vehicle emoji with `VEHICLE_REGISTRY[v].icon` rendered as JSX. All user name/avatar links via `AppUserLabel`.
- `ShareRouteModal.tsx` → use `AppModal`, `AppButton`, `AppInput`, `AppSelect`, `AppProgress`. Vehicle options from `VEHICLE_REGISTRY`.
- `DashboardNavbar.tsx`, `DesktopTopBar.tsx`, all nav components → full `filterNavItems(NAV_REGISTRY, ...)` wiring. Admin section visually separated.
- `LoginForm.tsx`, `RegisterForm.tsx` → `ConfigDrivenForm` consuming `LOGIN_FIELDS`, `REGISTER_FIELDS`.
- `EditProfileModal.tsx` → `AppModal` + `ConfigDrivenForm` consuming `EDIT_PROFILE_FIELDS`.
- `NotificationItem.tsx` → use `AppUserLabel`, `AppTag`, `NOTIFICATION_REGISTRY[type]` for icon/color.
- All `<img>` avatar usages → `AppAvatar`
- All hardcoded `<Button>` from antd in pages/features → `AppButton`

---

### TASK 0.8 — SEO foundation

**Files:** `app/lib/utils/metadata.ts`, `app/lib/utils/structuredData.ts`, `app/sitemap.ts`, `app/robots.ts`

Implement the full SEO system per the **SEO & META SYSTEM** section above.

Add static metadata exports to all existing public and dashboard pages. Add `generateMetadata` to `posts/[id]` and `profile/[username]`.

Add `<StructuredData>` to post detail page, profile page, and landing page.

---

### TASK 0.9 — Wire navigation + error/loading pages

1. Wire `NAV_REGISTRY` → all nav components per TASK 0.7
2. Create `app/not-found.tsx` — Along-branded 404
3. Create `app/error.tsx` — Along-branded error boundary with retry
4. Create `app/global-error.tsx` — top-level error boundary
5. Create `app/loading.tsx` — AppPageLoader
6. Create `app/(dashboard)/loading.tsx`, `app/(admin)/loading.tsx`

---

### TASK 0.10 — Phase 0 checkpoint

```bash
npm run build
npx tsc --noEmit
npm test -- --passWithNoTests
npx next lint
```

Fix all errors and warnings. Commit: `chore(phase-0): config foundation, universal components, global services, schema, SEO`.

---

## PHASE 1 — CORE PRODUCT

**Goal:** ValidityEngine, DraftingCoach, DiceBear avatars, admin pages, bug reporting, confirmations, undo, Google OAuth, PWA queue, cookie consent, mention system.

Tasks execute in sequence but multiple should be completed per session.

---

### TASK 1.1 — ValidityEngine + TrustBadge

Implement `app/lib/services/ValidityEngine.ts` per PRD §2.1 in full. Config-driven via `getSiteConfig('validityConfig', DEFAULT_VALIDITY_CONFIG)`. Class-based with all four sub-computations.

Implement `TrustBadge.tsx` (already created as shell in Phase 0) with full logic: 4 trust levels, Lucide icons, `AppTooltip` breakdown with `AppProgress` bars per dimension.

Wire into `PostCard.tsx`: `<TrustBadge score={post.validityScore} size="small" />`.

Also create `app/lib/db/SiteConfigRepository.ts` and `app/lib/utils/siteConfig.ts` per PRD §5 pattern.

---

### TASK 1.2 — DraftingCoachService + DraftingCoach component

`app/lib/services/DraftingCoachService.ts` — full implementation. Class-based. Uses `QUALITY_CHECKPOINTS` (all with `celebrationIcon` not emoji). Exposes `evaluate()`, `getScore()`, `getNextSuggestion()`.

`components/features/posts/DraftingCoach.tsx` — embedded in `ShareRouteModal`. Uses `AppProgress`, `AppAlert`, `AppTag`. Re-evaluates on every draft change via `useMemo` with 200ms debounce.

---

### TASK 1.3 — DiceBear AvatarEditor + UserAvatar

Full `AvatarEditor` modal per PRD §1.5 spec. Left panel: style grid with DiceBear API preview images. Right panel: live 120px preview + options. Save → PATCH `/api/users/[id]/avatar`.

`AppAvatar` (already created as shell in Phase 0) — wire full DiceBear URL building from `user.avatarConfig`. Fallback to `getFallbackAvatarUrl`. Verified badge overlay.

Replace all remaining `<img>` avatar instances with `<AppAvatar>`.

---

### TASK 1.4 — Google OAuth

`app/api/auth/google/route.ts` + `app/api/auth/google/callback/route.ts`. Full flow per PRD §7 (code → token → userInfo → upsert user → Along JWT → cookies → redirect). Add Google sign-in button to `LoginForm.tsx`.

---

### TASK 1.5 — Bug Report system

`app/(public)/report-bug/page.tsx` — `ConfigDrivenForm` with `BUG_REPORT_FIELDS`. Cloudinary attachment. Email pre-fill for auth users. Metadata for this page.

`app/api/bug-reports/route.ts` — POST handler with Zod validation.

`app/(admin)/bugs/page.tsx` — `AppTable` with status filter, `AppStatusDot` per status, `AppDropdown` for status updates.

---

### TASK 1.6 — Admin pages group

`app/(admin)/layout.tsx` — auth guard (`role !== 'admin'` → redirect), full nav with admin section.

Pages per PRD §4.11 (admin dashboard, users, posts, config, bugs, reviews). All use `AppTable` with `rowHref` for subtle row linking. All destructive admin actions use `ModalService.confirm()`.

---

### TASK 1.7 — Confirmations + Undo

Audit and apply `ModalService.confirm()` to all actions per the confirmation table in PRD §4.2. Apply `UndoService` to all reversible actions per the undo table. Verify undo toast renders correctly with countdown bar.

---

### TASK 1.8 — User tagging in comments

Implement full `@mention` system per **USER TAGGING** section above. `CommentInput.tsx` with typeahead dropdown. `commentParser.ts` for rendering mentions as links. `NotificationType.MENTION` notification. Wire mention notifications into existing notification system.

---

### TASK 1.9 — Subtle links audit

Audit the entire codebase and ensure every occurrence of:
- User name or avatar in a post, comment, notification, or table → `AppUserLabel` or `AppAvatar` with `linkToProfile=true`
- Post title in feeds, searches, or related content → `Next.js Link` to `/posts/[id]`
- Tag chip → `Link` to `/explore?tag=[tag]`
- Region chip → `Link` to `/explore?region=[region]`

This is a full-codebase sweep. Do not skip any occurrence.

---

### TASK 1.10 — Privacy & Terms pages

`app/(public)/privacy/page.tsx` — Markdown-rendered privacy policy. Use `react-markdown`. Metadata. Link from CookieConsent banner.

`app/(public)/terms/page.tsx` — Markdown-rendered terms of service. Metadata.

---

### TASK 1.11 — Phase 1 checkpoint

```bash
npm run build && npx tsc --noEmit && npm test -- --passWithNoTests && npx next lint
```

Commit: `feat(phase-1): validity, coach, avatars, admin, oauth, mentions, accessibility`.

---

## PHASE 2 — MAPS & DISCOVERY

**Goal:** MapLibre migration, route tracing, geographic data, suggestion algorithms, Along Suggestions, Explore map.

All tasks per original Phase 2 plan (TASK 2.1 through 2.8). Additional requirements:

- **TASK 2.1 (MapLibre):** Route map must be fully responsive — desktop shows inline in PostDetail (300px tall), mobile shows in a bottom sheet or collapsible panel. The glass-morphism summary card overlay must be implemented.
- **TASK 2.5 (Suggestions):** The `suggestionsService` must use `getSiteConfig('feedAlgorithm', DEFAULT_FEED_CONFIG)` for all weights — they are admin-adjustable.
- **TASK 2.6 (Along Suggestions):** Platform-generated posts must set `isPlatformGen: true` in DB. Feed must use `AppCard variant="suggestion"` for these entries. The "Along Suggestion" label chip must use `AppTag variant="primary"` with a `Sparkles` Lucide icon.
- **TASK 2.7 (Explore):** Explore page must have full OG metadata with description "Explore transport routes near you". Share-this-view URL generation with query params. Back-to-top FAB.
- Explore page map + PostCard markers: clicking a marker opens a glass-morphism popup (use `AppCard variant="glass"`) with a mini PostCard preview (no images, just title, user, trust badge, view button).

Phase 2 checkpoint:
```bash
npm run build && npx tsc --noEmit && npx next lint
```
Commit: `feat(phase-2): maplibre, route tracing, suggestions, explore`.

---

## PHASE 3 — ECOSYSTEM & REWARDS

**Goal:** Rewards engine, invite system, Transact, Tega, analytics, public pages (About, Contact).

All tasks per original Phase 3 plan (TASK 3.1 through 3.9). Additional requirements:

- **TASK 3.2 (Invite):** Invite page uses `AppCard` for the link/QR section. Leaderboard uses `AppTable` with `rowHref` to inviter profiles.
- **TASK 3.5 (Analytics):** All charts use `@ant-design/charts`. Charts must respect `prefers-color-scheme` for dark mode. Export to CSV button on all data tables.
- **TASK 3.6 (About page):** Team grid uses `AppCard`. Reviews carousel uses `AppCard variant="glass"`. Both sections must be visually consistent with the Stitch design images in `.ai-system/stitch_designs/`. Page must have full `generateMetadata` with team OG image.
- **TASK 3.6 (Contact page):** `ConfigDrivenForm` with `CONTACT_FIELDS`. Success state uses `AppEmptyState` variant with a checkmark icon instead of the form.
- All new pages must have appropriate `metadata` exports.

Phase 3 checkpoint:
```bash
npm run build && npx tsc --noEmit && npm test -- --passWithNoTests && npx next lint
```
Commit: `feat(phase-3): rewards, invites, ecosystem, analytics, public pages`.

---

## PHASE 4 — SCALE & POLISH

**Goal:** Background workers, N+1 fixes, RxJS feed, full test suite, PWA audit, SEO audit, i18n foundation.

All tasks per original Phase 4 plan (TASK 4.1 through 4.8). Additional requirements:

- **TASK 4.4 (AppFooter):** Implement using `FOOTER_CONFIG`. Dev credit must be present: `"Built by S.D"` as `<a href="https://sotonye-dagogo.is-a.dev">` in `text-xs opacity-60` style. Add to all public page layouts and dashboard layout.
- **TASK 4.5 (Tests):** Include tests for `filterNavItems()`, `buildAvatarUrl()`, `buildMetadata()`, `renderCommentWithMentions()`, and the `AppEmptyState` and `AppUserLabel` components.
- **TASK 4.6 (PWA):** Verify `manifest.json` references `public/icon-192.png` and `public/icon-512.png` (already placed). Verify `favicon.ico` path. Lighthouse PWA score ≥ 90 required.
- **TASK 4.7 (SEO audit):** Run a full SEO audit: verify every page has a unique `<title>`, every public page has OG tags, every post page has correct JSON-LD, sitemap.xml is accessible at `/sitemap.xml`, robots.txt is correct at `/robots.txt`.
- **TASK 4.8 (Final gate):** Run full suite. Fix everything. No exceptions.

```bash
npm run build && npx tsc --noEmit && npm test && npx next lint
```

Final commit: `feat(phase-4): workers, n+1, rxjs, tests, pwa, seo-audit, footer, polish`.

---

## APPENDIX A — .AI-SYSTEM BOOTSTRAP TEMPLATES

### `.ai-context.md`
```markdown
# Along — AI Context

## Project
Social travel-intelligence platform. Twitter × Google Maps hybrid.
Users share, verify, and discover transport routes in West African cities.
Mobile-first. Nigerian urban commuters primary audience.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript 5 (strict) · Tailwind 4
Ant Design 5 · Prisma 7 · PostgreSQL · Upstash Redis · MapLibre GL 4
Lucide React · DiceBear API v9 · Cloudinary · Zod 4 · Jest 30
react-map-gl · rxjs · @upstash/qstash · react-markdown · @ant-design/charts

## Architecture
Config-Driven: ALL features derive from lib/config/* registries. No hardcoded values.
OOP: class-based services in lib/services/*. Interface-first types.
Repository pattern: lib/db/BaseRepository<T>.
Universal components: ALL common UI patterns go through components/ui/* wrappers.
No emoji anywhere — Lucide icons only.
No role-specific components — role-aware via filterNavItems().
All multi-step DB mutations use prisma.$transaction([]).

## Critical Rules (never violate)
1. Config registry or nothing — no magic strings/values in components
2. Universal components only — no raw antd imports in pages/features
3. AppUserLabel/AppAvatar for all user displays — always links to profile
4. Subtle links on all contextual elements (name, avatar, tag, title)
5. ModalService.confirm() before all destructive/sensitive actions
6. Interface before implementation — no any types in new files
7. SEO metadata on every page
8. build + tsc + lint all pass before marking any task complete

## Design References
- Google Stitch live: https://stitch.withgoogle.com/projects/16594300379552668715
- Local design images: .ai-system/stitch_designs/
- Design system authority: .ai-system/stitch_designs/design-system.* or Along_Stitch_Design_Brief.md
- Logo/icons: public/ (already placed — do not regenerate)

## Current Phase
See .ai-system/planning/task-queue.md
```

### `.ai-system/planning/task-queue.md`
```markdown
# Along — Task Queue

## Current Phase: 0 — Foundation

## Phase 0 Tasks
- [ ] 0.1 — Update all dependencies
- [ ] 0.2 — Migrate Tailwind v4
- [ ] 0.3 — Create all config files
- [ ] 0.4 — Create all Universal Components
- [ ] 0.5 — Implement global services (ModalService, ToastService, UndoService, OfflineQueue)
- [ ] 0.6 — Update Prisma schema
- [ ] 0.7 — Overhaul existing components for compliance
- [ ] 0.8 — SEO foundation
- [ ] 0.9 — Wire navigation + error/loading pages
- [ ] 0.10 — Phase 0 checkpoint

## Phase 1 Tasks
- [ ] 1.1 — ValidityEngine + TrustBadge
- [ ] 1.2 — DraftingCoachService + DraftingCoach component
- [ ] 1.3 — DiceBear AvatarEditor + UserAvatar
- [ ] 1.4 — Google OAuth
- [ ] 1.5 — Bug Report system
- [ ] 1.6 — Admin pages group
- [ ] 1.7 — Confirmations + Undo
- [ ] 1.8 — User tagging in comments (@mentions)
- [ ] 1.9 — Subtle links full-codebase audit
- [ ] 1.10 — Privacy & Terms pages
- [ ] 1.11 — Phase 1 checkpoint

## Phase 2 Tasks
- [ ] 2.1 — MapLibre migration
- [ ] 2.2 — Route tracing service + API
- [ ] 2.3 — Google Places Autocomplete in route inputs
- [ ] 2.4 — Geographic data on post create/edit
- [ ] 2.5 — Enhanced suggestion algorithms
- [ ] 2.6 — Platform-generated route suggestions (Along Suggestions)
- [ ] 2.7 — Explore page map view
- [ ] 2.8 — Phase 2 checkpoint

## Phase 3 Tasks
- [ ] 3.1 — RewardsService
- [ ] 3.2 — Invite system
- [ ] 3.3 — Transact Marketplace integration
- [ ] 3.4 — Tega Events integration
- [ ] 3.5 — Analytics dashboard (user-facing)
- [ ] 3.6 — Public pages (About, Contact)
- [ ] 3.7 — Reviews system
- [ ] 3.8 — RewardsPanel in Profile
- [ ] 3.9 — Phase 3 checkpoint

## Phase 4 Tasks
- [ ] 4.1 — QStash background workers
- [ ] 4.2 — N+1 query elimination
- [ ] 4.3 — RxJS reactive feed
- [ ] 4.4 — AppFooter (with dev credit)
- [ ] 4.5 — Jest test suite
- [ ] 4.6 — PWA full audit
- [ ] 4.7 — SEO audit
- [ ] 4.8 — Final build and quality gate
```

### `.ai-system/agents/system-architecture.md`
```markdown
# Along — System Architecture

## Layer Map
┌─ Config Layer (app/lib/config/) ─────────────────────────────────────┐
│  vehicles · routeStatus · navigation · forms · notifications          │
│  feedAlgorithm · draftingCoach · validityConfig · avatar · rewards    │
│  footer · teamConfig · mapIntegrations · cache · rateLimits           │
│  validationRules · apiRegistry · seo · emptyStates · inviteConfig     │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ imported by
┌───────────────────────────▼──────────────────────────────────────────┐
│  Engine Layer (app/lib/services/) ─────────────────────────────────  │
│  ValidityEngine · DraftingCoachService · FeedService                  │
│  SuggestionsService · PlatformSuggestionsService                      │
│  RewardsService · RouteTracingService · InviteService                 │
│  ModalService · ToastService · UndoService · OfflineQueueService      │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ accessed through
┌───────────────────────────▼──────────────────────────────────────────┐
│  Repository Layer (app/lib/db/) ───────────────────────────────────  │
│  BaseRepository<T> · UserRepository · PostRepository                  │
│  NotificationRepository · SiteConfigRepository · AnalyticsRepository  │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ consumed by
┌───────────────────────────▼──────────────────────────────────────────┐
│  Universal Component Layer (app/components/ui/) ──────────────────── │
│  AppButton · AppTable · AppEmptyState · AppModal · AppCard            │
│  AppTag · AppAvatar · AppUserLabel · AppInput · AppSelect             │
│  AppSkeleton · AppProgress · AppAlert · TrustBadge                    │
│  ConfigDrivenForm · ConfigDrivenList · AppFooter                      │
│  GlobalConfirmModal · GlobalUndoToast · CookieConsent                  │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ composes into
┌───────────────────────────▼──────────────────────────────────────────┐
│  Feature Component Layer (app/components/features/) ──────────────── │
│  PostCard · ShareRouteModal · DraftingCoach · RouteMap                │
│  AvatarEditor · RewardsPanel · CommentInput · NotificationItem        │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ used in
┌───────────────────────────▼──────────────────────────────────────────┐
│  Page Layer (app/) ────────────────────────────────────────────────  │
│  (auth)/ · (dashboard)/ · (admin)/ · (public)/                        │
│  Each page: metadata export · StructuredData · AppEmptyState          │
└──────────────────────────────────────────────────────────────────────┘

## Critical Constraints
1. No component reads from DB directly — API routes only
2. All config is typed — zero implicit any
3. All >1 table mutations use prisma.$transaction([])
4. All destructive actions gated by ModalService.confirm()
5. All user name/avatar renders use AppUserLabel/AppAvatar with linkToProfile
6. All forms use ConfigDrivenForm with typed FieldConfig[]
7. All lists/tables use ConfigDrivenList/AppTable
8. All Ant Design consumed through universal wrappers in components/ui/
9. SEO metadata on every page via Next.js Metadata API
10. Logo/favicon served from public/ — never regenerated by agent
```

---

## APPENDIX B — DESIGN TOKEN QUICK REFERENCE

Implement these tokens in `globals.css @theme` (TASK 0.2). Reference everywhere via CSS variables or Tailwind semantic classes.

```
Primary:      #00623B (--color-primary)
Primary lt:   #00A862 (--color-primary-light)
Primary dk:   #004A2C (--color-primary-dark)
Bg base:      #FFFFFF / #0F0F0F dark
Bg elevated:  #F7F7F7 / #1A1A1A dark
Bg card:      #FFFFFF / #1F1F1F dark
Text primary: #232323 / #F5F5F5 dark
Text sec:     #6B7280
Text muted:   #9CA3AF
Success bg:   #A4F4E7   Success text: #15B097
Warning bg:   #F4C790   Warning text: #CC7914
Error bg:     #E4626F   Error text:   #8C1823
Border:       #E5E7EB

Glass (light): rgba(255,255,255,0.10), blur(16px) saturate(180%), border rgba(255,255,255,0.20)
Glass (dark):  rgba(15,15,15,0.55),   blur(16px) saturate(180%), border rgba(255,255,255,0.10)

Radius: input 6px · button 8px · card 12px · modal 16px · sheet 24px · pill 999px
Shadow card: 0 2px 16px rgba(0,0,0,0.08)
Shadow primary: 0 8px 32px rgba(0,98,59,0.15)
Font: Inter (system-ui fallback)
```

---

## APPENDIX C — ENVIRONMENT VARIABLES CHECKLIST

```env
# Core
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
JWT_SECRET=
JWT_REFRESH_SECRET=
NEXT_PUBLIC_APP_URL=https://along.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Maps (Phase 2)
GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_MAPLIBRE_STYLE_URL=
OPEN_ROUTE_SERVICE_KEY=

# Ecosystem (Phase 3)
TRANSACT_API_KEY=
TRANSACT_WEBHOOK_SECRET=
TEGA_API_KEY=
TEGA_WEBHOOK_SECRET=
QSTASH_TOKEN=

# Public (safe to expose)
NEXT_PUBLIC_API_URL=/api
```

---

## APPENDIX D — LOGO & ASSET STATUS

**Status: COMPLETE — do not regenerate.**

All logo and icon assets have been placed in `public/` by the developer:
- `public/logo.svg` — full wordmark
- `public/logo-icon.svg` — icon only
- `public/favicon.ico` — multi-size ICO
- `public/icon-192.png` — PWA 192×192
- `public/icon-512.png` — PWA 512×512
- `public/apple-touch-icon.png` — 180×180
- `public/og-image.png` — Open Graph 1200×630

Reference these in `manifest.json`, `globals.css`, and metadata. Do not replace or regenerate them.

---

*End of Along Development Execution Plan v2.0*
*Authoritative for all Copilot execution sessions.*
*along_copilot_plan_v2.md · Along_PRD_Engineering_Roadmap_v2.md · Google Stitch Designs · Along_Stitch_Design_Brief.md · PROJECT_CONTEXT.md · .ai-system workflow*
*Built by S.D — https://sotonye-dagogo.is-a.dev*
