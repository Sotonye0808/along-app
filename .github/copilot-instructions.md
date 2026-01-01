# GitHub Copilot Instructions for Along App

## Project Overview

Along is a social route-sharing platform where users can share, discover, and interact with travel routes and destinations.

## Note

- Make sure to follow the coding standards and architectural guidelines outlined in the project documentation.
- Make use of plan and project context files for reference. Provide as close to production-ready code as possible.
- Leave nothing unimplemented but with flexibility and consideration of scalability.
- Ignore 'app/conflicting' directory and its contents as it is old code kept for reference during migration.
- Store any summary files in the '.github/summaries' directory for organization.

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
- No need to manually import custom types and interfaces in files, as they are already included in `tsconfig.json`

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
- Use Ant Design icons from '@ant-design/icons' for cases not covered by custom SVGs in assets/icons

### API Patterns

- Use Server Actions for mutations
- Use async Server Components for data fetching
- Mock data structure should match production API shape
- Handle loading and error states properly

## Common Patterns

### Authentication

```typescript
// Check auth in Server Components
import { cookies } from "next/headers";

const token = cookies().get("accessToken");
```

### Data Fetching

```typescript
// Server Component
async function getData() {
  const res = await fetch("http://localhost:3001/endpoint");
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

## Backend Architecture

### Current (Phase 7): Mock Backend

- TypeScript-based mock data in `app/lib/data/mockData.ts`
- In-memory database service in `app/lib/data/database.ts`
- Next.js API routes in `app/api/`
- No persistence across restarts

### Production (Phase 8): Database Integration

#### Prisma ORM

- Use Prisma Client for all database operations
- Never write raw SQL (Prisma prevents SQL injection)
- Always use singleton pattern: `import { prisma } from '@/lib/db/prisma'`
- Use transactions for multi-step operations
- Select only needed fields: `select: { id: true, name: true }`
- Use proper relations: `include: { user: true }`
- Implement cursor-based pagination, not offset-based

```typescript
// Good: Cursor-based pagination
const posts = await prisma.post.findMany({
  take: 20,
  cursor: cursor ? { id: cursor } : undefined,
  skip: cursor ? 1 : 0,
  orderBy: { createdAt: "desc" },
});

// Bad: Offset-based pagination (slow at scale)
const posts = await prisma.post.findMany({
  take: 20,
  skip: page * 20, // Don't do this
});
```

#### Cloudinary Image Management

- Upload images using `uploadImage()` from `lib/utils/cloudinary.ts`
- Always delete old images before uploading new ones
- Store Cloudinary URLs in database, not local paths
- Use appropriate upload preset (avatar or postImage)
- Validate files client-side before upload
- Handle upload failures gracefully

```typescript
// Image upload pattern
try {
  // Validate
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);

  // Convert to base64
  const base64 = await fileToBase64(file);

  // Upload
  const result = await uploadImage(base64, "postImage");

  // Store URL in database
  await prisma.post.update({
    where: { id: postId },
    data: { images: { push: result.url } },
  });
} catch (error) {
  // Handle error
}
```

#### Redis Caching

- Check cache before database queries
- Set appropriate TTLs (5-30 minutes)
- Invalidate cache on writes
- Use structured cache keys: `{resource}:{id}:{variant}`

```typescript
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis';

// Cache pattern
const cacheKey = CACHE_KEYS.userFeed(userId);
const cached = await cache.get(cacheKey);

if (cached) return cached;

const data = await prisma.post.findMany({...});
await cache.set(cacheKey, data, CACHE_TTL.feed);

return data;
```

#### Rate Limiting

- Apply rate limits to all API routes
- Use `rateLimitByUser()` for authenticated routes
- Use `rateLimitByIP()` for public routes
- Return 429 status with Retry-After header

```typescript
import { rateLimitByUser } from "@/lib/utils/rateLimiter";

const rateLimit = await rateLimitByUser(userId, {
  maxRequests: 10,
  windowSeconds: 3600, // 1 hour
});

if (!rateLimit.success) {
  return NextResponse.json(
    { error: "Rate limit exceeded" },
    { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
  );
}
```

#### Security Best Practices

- Always hash passwords with bcrypt (10+ salt rounds)
- Never log sensitive data (passwords, tokens)
- Validate all inputs with Zod schemas
- Use parameterized queries (Prisma does this)
- Implement CORS for production domain only
- Set secure cookie flags in production
- Rate limit all endpoints
- Sanitize user-generated content

#### Error Handling

- Use try-catch for all async operations
- Log errors with context (user ID, request ID)
- Return user-friendly error messages
- Don't expose stack traces in production
- Handle Prisma errors specifically

```typescript
try {
  // Database operation
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Resource already exists" },
        { status: 409 }
      );
    }
  }
  console.error("Database error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

#### Performance Guidelines

- Use indexes for frequently queried fields
- Avoid N+1 queries (use `include` or `select` with relations)
- Implement pagination on all list endpoints
- Cache expensive queries
- Use connection pooling (Prisma default)
- Monitor slow queries in production
- Use database-level constraints (unique, foreign keys)

#### Migration Strategy

- Never modify Prisma schema directly in production
- Always create migration: `npx prisma migrate dev`
- Review generated SQL before applying
- Test migrations on staging first
- Use `prisma migrate deploy` for production
- Keep migrations in version control
- Document breaking changes
