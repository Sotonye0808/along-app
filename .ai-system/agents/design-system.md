# Design System

> Overview: Along uses Tailwind CSS v4 with design tokens in app/globals.css and Ant Design v5 wrapped by App\* components. All UI must follow tokenized colors and Lucide icons only. No emoji in UI.

---

## Visual Language

Section summary: Tokens and visual rules that must be used everywhere.

### Color Tokens (CSS variables)

Primary tokens are defined in app/globals.css under @theme and :root. Use CSS variables in components, not hex values.

- --color-primary
- --color-primary-light
- --color-primary-dark
- --color-bg-base
- --color-bg-elevated
- --color-text-primary
- --color-text-secondary
- --color-text-muted
- --color-success
- --color-success-text
- --color-warning
- --color-warning-text
- --color-error
- --color-error-text
- --color-border

Rules:

- Do not use raw hex values in components or pages.
- Use var(--color-\*) or semantic Tailwind tokens that map to those vars.
- Ant Design theme tokens must reference CSS vars, not hardcoded colors.

### Typography

- Font stack is defined in app/globals.css (system font stack).
- Headings and body use the same family with size/weight hierarchy.

### Spacing and Radius

- Tailwind 4px base scale (1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, 6 = 24px, 8 = 32px).
- Radius tokens are defined as CSS vars: --radius-input, --radius-button, --radius-card, --radius-modal, --radius-pill.

---

## Component System Rules

Section summary: Universal components and icon rules.

- Use App\* wrappers from app/components/ui for all common UI.
- Avoid direct Ant Design imports in pages or feature components.
- Use ConfigDrivenForm and ConfigDrivenList for forms/lists with 3+ items.
- All avatars and user labels use AppAvatar or AppUserLabel.

### Icons

- Use lucide-react icons only.
- Do not use @ant-design/icons in UI.
- No emoji in UI text or labels.

---

## Theme and Dark Mode

- Theme toggle relies on CSS variables and the .dark class on html.
- Do not use hardcoded bg-white/text-gray classes in components.
- Use var(--color-bg-base), var(--color-bg-elevated), and var(--color-text-\*) instead.

---

## Accessibility

- Visible focus ring via :focus-visible (defined in globals.css).
- All icon-only buttons require aria-label.
- All images require alt text.
- Modals trap focus and close on Escape.
- Avoid low-contrast text on colored backgrounds.
