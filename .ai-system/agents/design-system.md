# Design System

> **Overview:** Along App uses a dual-library approach: Tailwind CSS for layout, spacing, and custom styles, combined with Ant Design v5 for UI components. The visual language reflects a travel/adventure aesthetic — clean, modern, and mobile-first. All UI must be keyboard-navigable and meet WCAG AA contrast standards.

---

## Visual Language

> **Section summary:** Core visual identity — colours, typography, spacing. Tailwind classes are used directly; Ant Design tokens handle component theming.

### Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| primary | #1677ff (Ant Design default blue) | Buttons, links, CTAs, active states |
| secondary | #52c41a (green) | Success states, verified badges |
| background | #f5f5f5 | Page background |
| surface | #ffffff | Cards, modals, panels |
| text-primary | #000000 / rgba(0,0,0,0.88) | Main body text |
| text-muted | rgba(0,0,0,0.45) | Labels, captions, placeholders |
| danger | #ff4d4f | Errors, destructive actions |
| warning | #faad14 | Warnings |
| success | #52c41a | Confirmations |

> Colours are configured via Ant Design's theme token system. Tailwind uses `[]` escape syntax for custom values not in the default palette.

### Typography

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Heading 1 | System / Geist | 2rem (32px) | 700 |
| Heading 2 | System / Geist | 1.5rem (24px) | 600 |
| Heading 3 | System / Geist | 1.25rem (20px) | 600 |
| Body | System / Geist | 1rem (16px) | 400 |
| Caption | System / Geist | 0.875rem (14px) | 400 |
| Code | Geist Mono | 0.875rem (14px) | 400 |

> Fonts are loaded from `app/fonts/` using Next.js `next/font/local`.

### Spacing Scale

Tailwind 4px base unit: `1 = 4px`, `2 = 8px`, `3 = 12px`, `4 = 16px`, `6 = 24px`, `8 = 32px`, `12 = 48px`, `16 = 64px`

---

## Component Patterns

> **Section summary:** Standard UI components used across the project. New components should follow these patterns before inventing new ones. Prefer Ant Design components for common UI; extend with Tailwind for custom needs.

### Buttons
- **Primary:** `<Button type="primary">` — blue, used for main CTAs
- **Secondary:** `<Button>` (default) — outlined, for secondary actions
- **Destructive:** `<Button danger>` — red, for delete/remove actions
- **Ghost:** `<Button type="text">` — for icon-only or subtle actions
- **Loading state:** Always set `loading={isSubmitting}` on submit buttons

### Forms
- Use Ant Design `<Form>` with `<Form.Item>` wrappers for all forms
- Validation: Zod on server; Ant Design `rules` prop for client-side
- Error messages: display inline below field via Ant Design's built-in error display
- Submit buttons: show `loading` state during async submission

### Navigation
- Primary: Left sidebar on desktop, bottom tab bar on mobile (dashboard layout)
- Auth: Centered single-column layout

### Cards / Containers
- Use Ant Design `<Card>` with shadow (`shadow-md` Tailwind) for post cards
- Border radius: `rounded-xl` (12px) for main cards, `rounded-lg` (8px) for inner elements
- Background: white (`bg-white`) on light grey page background (`bg-gray-50`)

### Modals / Dialogs
- Use Ant Design `<Modal>` for confirmations and forms
- Destructive confirmation: always use `<Popconfirm>` for inline, `<Modal>` for complex

### Post Cards
- Contain: user avatar + name, route title, images (carousel), tags, action bar (like/comment/bookmark/share)
- Action bar uses icon buttons with counts

### Avatars
- Use Ant Design `<Avatar>` with Cloudinary image URLs
- Fallback to first letter of username when no avatar

---

## UX Principles

> **Section summary:** Guiding rules for how the interface should feel and behave.

1. **Loading states always** — every async action must show a spinner or skeleton
2. **Destructive confirmation required** — delete/unfollow always requires confirm
3. **Helpful error messages** — errors must explain what the user can do to fix the problem
4. **Mobile-first** — all layouts must work at 320px wide minimum
5. **PWA-ready** — offline states must be handled gracefully with appropriate messaging
6. **Optimistic updates** — like/bookmark counts update immediately, then confirm with server
7. **Consistent icons** — use Ant Design icons (`@ant-design/icons`) unless a custom SVG is needed

---

## Responsive Breakpoints

| Breakpoint | Value | Target |
|------------|-------|--------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Wide desktop |
| 2xl | 1536px | Ultra-wide |

> Match Tailwind defaults. Dashboard layout switches from bottom tab (mobile) to side nav (lg+).

---

## Accessibility Requirements

> **Section summary:** Minimum accessibility standards to follow.

- All interactive elements must have visible keyboard focus states
- Colour contrast must meet WCAG AA (4.5:1 for text, 3:1 for large text)
- Images must have descriptive `alt` text
- Forms must have associated `<label>` elements (Ant Design Form.Item handles this)
- Modals must trap focus and support `Escape` to close
- Use semantic HTML: `<nav>`, `<main>`, `<article>`, `<header>`, `<footer>`
- Ant Design's built-in accessibility features should not be overridden
