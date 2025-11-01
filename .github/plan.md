# Along App Revamp Plan

## Phase 1: Foundation Setup ✅

- [x] Update Next.js to latest version
- [x] Install and configure Ant Design
- [x] Update all dependencies
- [x] Create GitHub context files

## Phase 2: Project Structure Refactoring ✅

### 2.1 Directory Restructuring ✅

```
app/
├── (auth)/                    # Auth group route
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── otp/
│   │   └── page.tsx
│   └── layout.tsx            # Auth layout
├── (dashboard)/               # Dashboard group route
│   ├── layout.tsx            # Dashboard layout with navbar
│   ├── page.tsx              # Main feed
│   ├── explore/
│   ├── bookmarks/
│   ├── marketplace/
│   └── profile/
├── api/                       # API routes
│   └── auth/
├── components/
│   ├── ui/                   # Reusable UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Card/
│   └── features/             # Feature-specific components
│       ├── auth/
│       ├── posts/
│       └── navigation/
├── lib/
│   ├── utils/                # Utility functions
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── format.ts
│   ├── types/                # TypeScript types
│   │   ├── user.types.ts
│   │   ├── post.types.ts
│   │   └── route.types.ts
│   ├── constants/            # Constants
│   │   └── index.ts
│   └── hooks/                # Custom hooks
│       └── useAuth.ts
├── providers/
│   ├── AntdProvider.tsx
│   └── AuthProvider.tsx
├── styles/
│   └── globals.css
└── layout.tsx                # Root layout
mock-backend/                # Mock backend with json-server
    └── db.json
    └── routes.json
public/
    └── assets/
        ├── images/
        └── icons/
```

### 2.2 Mock Backend Setup ✅

- [x] ~~Install json-server: `npm install -D json-server`~~
- [x] ~~Create `mock-backend/` directory~~
- [x] Create TypeScript-based mock data in `app/lib/data/mockData.ts`
- [x] Create database service in `app/lib/data/database.ts`
- [x] Create Next.js API routes in `app/api/`:
  - Users (GET, POST, PUT, DELETE)
  - Posts (GET, POST, PUT, DELETE)
  - Comments (GET, POST)
  - Likes (POST, DELETE)
  - Bookmarks (POST, GET)
  - Notifications (GET, POST, PATCH)
- [x] Update API_BASE_URL to use Next.js API routes (`/api`)
- [x] ~~Add npm script: `"mock-api": "json-server --watch mock-backend/db.json --port 3001"`~~
- [x] **Production-ready**: Works on Vercel/Netlify without external services
- [x] **Migration-ready**: Easy to swap for real database

**Note**: The new TypeScript-based mock backend uses Next.js API routes instead of json-server. This provides better type safety, works in production environments, and makes it easy to migrate to a real database in the future. See `.github/mock-backend-architecture.md` for details.

## Phase 3: Type System Implementation

### 3.1 Core Types

```typescript
// lib/typests
interface User {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  followers?: number;
  following?: string[];
  likes?: string[];
  bookmarks?: string[];
  createdAt: string;
}

interface Route {
  id: string;
  text: string;
  links: Link[];
  order: number;
  vehicles: VehicleType[];
}

interface Post {
  id: string;
  userId: string;
  title: string;
  routes: Route[];
  images: string[];
  tags: string[];
  likes: number;
  dislikes: number;
  comments: number;
  bookmarks?: number;
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 API Response Types

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
```

## Phase 4: Component Migration 🚀 In Progress

### 4.1 Convert to App Router ✅

- [x] Migrate pages to app directory
- [x] Convert page components to Server Components
- [x] Add 'use client' only where needed (forms, interactivity)
- [x] Implement proper layouts

### 4.2 Ant Design Integration ✅

- [x] Create AntdProvider with theme configuration
- [x] Replace custom components with Ant Design equivalents:
  - Forms → `<Form />` ✅
  - Inputs → `<Input />` ✅
  - Buttons → `<Button />` ✅
  - Modals → `<Modal />` (pending)
  - Notifications → `message` / `notification` ✅
- [x] Maintain Tailwind for custom styling

### 4.3 Component Priorities

1. **Authentication Components** ✅
   - [x] Login form
   - [x] Register form
   - [x] OTP verification
2. **Navigation Components** ✅

   - [x] Dashboard navbar
   - [x] Mobile navigation
   - [x] User menu

3. **Post Components**

   - [x] Post creation modal
   - [x] Post card
   - [x] Comment section
   - [x] Like/share actions

4. **Dashboard Components**
   - [x] Feed
   - [x] Suggestions panel
   - [x] Search bar

## Phase 5: Feature Implementation

### 5.1 Authentication Flow ✅

- [x] Implement Server Actions for auth
- [x] JWT token management with httpOnly cookies
- [x] Protected routes with middleware
- [x] User session management automatically keeping them signed in till they sign out
- [x] Centralized AuthProvider with React Context
- [x] Dashboard layout using AuthProvider
- [x] LoginForm using AuthProvider
- [x] Ensure sufficient access to basic functionality for guest users without causing errors by restricting them from doing things requiring an account and giving feedback
- [x] Guest users can browse feed, explore, and marketplace
- [x] Actions requiring auth (like, comment, bookmark, share route) show login prompt
- [x] Top bars display login button for guests, user info for authenticated users
- [x] ShareRouteButton shows login modal for guests

### 5.2 Post Management ✅

- [x] Create post with routes
- [x] Edit/delete posts
- [x] Image upload (mock with base64)
- [x] Rich text formatting (Markdown syntax support)
- [x] Tags and links
- [x] Post ownership verification
- [x] Delete confirmation dialog
- [x] Edit mode in ShareRouteModal
- [x] Image preview and removal
- [x] Formatting buttons (Bold, Italic, Underline, Strikethrough)

### 5.3 Social Features

- [x] Like/dislike system with toggle logic (can't like and dislike simultaneously)
- [x] Icon color changes (filled when active, Along Green for like/bookmark, red for dislike)
- [x] Optimistic UI updates with rollback on error
- [x] User interaction state tracking (fetch and display existing likes/dislikes/bookmarks)
- [x] Bookmark system with toggle
- [x] Comment system
- [x] Share functionality
- [x] User following

### 5.4 User Profile

- [x] View own profile
- [x] Edit own profile
- [x] Change profile picture
- [x] View own posts
- [x] View own comments

### 5.4.5 Side task: User location

- [x] Seamlessly integrate user location field into project
- [x] Update relevant types, mock data, and API routes without breaking changes!
- [x] Allow users to set/update location in profile using window location api to geodata
- [x] Prompt guest users to create accounts before being able to use their current/live location

### 5.5 Search and Suggestions Functionality ✅

- [x] Search bar with live results
  - [x] Debounced search (300ms delay)
  - [x] Search across users (name, username, location)
  - [x] Search across posts (title, routes, tags)
  - [x] Search across tags
  - [x] Categorized results dropdown (Users, Posts, Tags)
  - [x] Click-outside to close
  - [x] Loading and empty states
- [x] User suggestions based on location and previous searches/activity
  - [x] Intelligent scoring algorithm
  - [x] Location-based scoring (40 points max)
  - [x] Activity-based scoring (30 points - likes & bookmarks)
  - [x] Common interests scoring (20 points - shared tags)
  - [x] Mutual connections scoring (10 points)
  - [x] Verified user boost (5 points)
  - [x] Top 5 ranked suggestions display

## Phase 6: Optimization & Polish

### 6.1 Performance

- [ ] Implement React.lazy for heavy components
- [ ] Optimize images
- [ ] Add loading states
- [ ] Implement error boundaries

### 6.2 UX Improvements

- [ ] Loading skeletons (Ant Design Skeleton)
- [ ] Toast notifications
- [ ] Confirmation dialogs
- [ ] Form validation feedback
- [ ] Widespread Dark-mode inclusion
- [ ] To the top/refresh feed notifier when user has scrolled far down

### 6.3 Accessibility

- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Focus management
- [ ] Screen reader support

### 6.4 SEO Enhancements

- [ ] Meta tags for each page
- [ ] Open Graph tags for social sharing
- [ ] Sitemap generation

### 6.5 PWA Features

- [ ] Offline support with service workers
- [ ] Installable app prompt
- [ ] Push notifications setup

## Phase 7: Testing & Documentation

### 7.1 Testing

- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests (optional)

### 7.2 Documentation

- [ ] Component documentation
- [ ] API documentation
- [ ] Setup guide
- [ ] Contributing guidelines

## Migration Strategy

### Incremental Approach

1. Keep existing pages working
2. Create new app directory structure
3. Migrate one feature at a time
4. Test thoroughly before removing old code
5. Update imports and references

### Testing Checklist for Each Migration

- [ ] Component renders correctly
- [ ] All interactions work
- [ ] Styling matches design
- [ ] TypeScript types are correct
- [ ] Performance is acceptable
- [ ] Accessibility is maintained

## Success Metrics

- ✅ TypeScript coverage: 100%
- ✅ Build passes without errors
- ✅ All features working
- ✅ Performance improved
- ✅ Code maintainability improved
- ✅ Developer experience improved
