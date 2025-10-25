# GitHub Copilot Instructions for Along App

## Project Overview
Along is a social route-sharing platform where users can share, discover, and interact with travel routes and destinations.

## Note
Make sure to follow the coding standards and architectural guidelines outlined in the project documentation. Make use of plan and project context files for reference.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Ant Design (antd)
- **State Management**: React Context API
- **API**: Mock JSON backend (json-server)
- **Authentication**: JWT tokens with cookies

## Code Style Guidelines

### TypeScript
- Use strict TypeScript settings
- Always define proper types/interfaces (no `any`)
- Use type inference where appropriate
- Prefer `interface` over `type` for object shapes
- Use proper generics for reusable components
- Apart from component interfaces, globally define all types and interfaces in `lib/types.ts` file
- Typescript configured to use custom types and interfaces without need for relative imports

### React/Next.js
- Use App Router exclusively (not Pages Router)
- Prefer Server Components by default
- Mark Client Components with `'use client'` directive only when needed
- Use proper loading.tsx, error.tsx, and not-found.tsx patterns
- Implement proper metadata exports

### Styling
- Use Tailwind CSS utility classes expertly for layout and custom styles
- Reduce vanilla CSS to absolute bare minimum by using '[]' in tailwind classes when needed and @apply directive in global CSS
- Use Ant Design components for common UI elements
- Combine Tailwind and Ant Design styles as needed

### SEO
- Optimize metadata for SEO
- Implement Open Graph tags for social sharing
- Generate a sitemap

### PWA Features
- Implement service workers for offline support
- Ensure the app is installable on devices
- Set up push notifications for real-time updates

### Component Structure
```typescript
// Example structure
interface ComponentProps {
  // Props definition
}

export function ComponentName({ prop }: ComponentProps) {
  // Component logic
}
```

### File Naming
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- API routes: lowercase with hyphens (e.g., `user-profile`)

### Ant Design Usage
- Import components from 'antd'
- Use Ant Design theme configuration
- Combine with Tailwind for custom styling
- Use Ant Design icons from '@ant-design/icons'

### API Patterns
- Use Server Actions for mutations
- Use async Server Components for data fetching
- Mock data structure should match production API shape
- Handle loading and error states properly

## Common Patterns

### Authentication
```typescript
// Check auth in Server Components
import { cookies } from 'next/headers';

const token = cookies().get('accessToken');
```

### Data Fetching
```typescript
// Server Component
async function getData() {
  const res = await fetch('http://localhost:3001/endpoint');
  return res.json();
}
```

### Form Handling
- Use Ant Design Form components
- Implement proper validation
- Use Server Actions for submissions

## Directory Structure Preferences
```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── otp/
├── (dashboard)/
│   ├── layout.tsx
│   └── page.tsx
├── api/
├── components/
│   ├── ui/
│   └── features/
├── lib/
│   ├── utils/
│   ├── types.ts
│   └── constants/
└── providers/
    ├── AntdProvider.tsx
    └── AuthProvider.tsx
```

## Testing Approach
- Write tests for utilities
- Test component logic, not implementation details
- Mock external dependencies
- Use meaningful test descriptions

## Performance Considerations
- Use Next.js Image component
- Implement proper code splitting
- Use dynamic imports for heavy components
- Optimize bundle size

## Accessibility
- Use semantic HTML
- Implement proper ARIA labels
- Ensure keyboard navigation
- Use Ant Design's built-in accessibility features

## State Management
- Use React Context for global state (auth, theme)
- Use local state with hooks for component-specific state
- Avoid unnecessary re-renders by memoizing components and values
- Use Server Actions for server state mutations

## Mock Backend 
- Use json-server for mocking API responses
- Define mock data structure in `mock-backend/db.json`
- Ensure mock DB schema aligns with types and interfaces defined in `lib/types.ts`
- Ensure mock API endpoints match production API shape