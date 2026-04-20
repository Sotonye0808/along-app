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
  - [x] Search across users (name, username)
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

## Phase 6: Optimization & Polish ✅

### 6.1 Performance ✅

- [x] Implement React.lazy for heavy components
- [x] Optimize images with Next.js Image component
- [x] Add loading states
- [x] Disable buttons during async actions
- [x] Prevent unnecessary re-renders with React.memo
- [x] Implement error boundaries
- [x] 404 Not Found page

### 6.1.5 Code Refactoring & Modularization ✅

- [x] Extract Feed.tsx logic into custom hooks (826 lines → 260 lines, 68% reduction)
  - [x] Create `useFeedPosts` hook for post management
  - [x] Create `useFeedInteractions` hook for user interactions
  - [x] Create `useComments` hook for comment operations
  - [x] Create `useNewPostsNotification` hook for scroll notifications
  - [x] Create `feedHelpers.ts` utility functions
- [x] Refactor UserProfile.tsx to use modular hooks
  - [x] Create `useProfileComments` hook for profile comment operations
  - [x] Create `useProfileSharing` hook for profile link sharing
  - [x] Maintain backward compatibility with prop-based handlers

### 6.2 UX Improvements ✅

- [x] Loading skeletons (Ant Design Skeleton)
- [x] Smooth transitions/animations
- [x] Toast notifications
- [x] Confirmation dialogs
- [x] Form validation feedback
- [x] Widespread Dark-mode inclusion
- [x] To the top/refresh feed notifier when user has scrolled far down

### 6.3 Accessibility ✅

- [x] Keyboard navigation
- [x] ARIA labels
- [x] Focus management
- [x] Screen reader support

### 6.4 SEO Enhancements ✅

- [x] Meta tags for each page
- [x] Open Graph tags for social sharing
- [x] Sitemap generation
- [x] JSON-LD structured data

### 6.5 PWA Features ✅

- [x] Offline support with service workers
- [x] Installable app prompt
- [x] Push notifications setup

## Phase 7: Testing & Documentation ✅

### 7.1 Testing ✅

- [x] Setup testing infrastructure (Jest + React Testing Library)
- [x] Unit tests for utilities (format.ts, auth.ts, geolocation.ts, structuredData.ts)
- [x] Component tests (LoginForm, PostCard)
- [x] Integration tests (auth flow, post creation, social interactions)
- [x] E2E tests (optional - can be added later)

### 7.2 Documentation ✅

- [x] Component documentation
- [x] API documentation
- [x] Setup guide
- [x] Contributing guidelines

## Phase 8: Database & Cloud Integration 🚀

### Overview

Migrate from mock backend to production-ready infrastructure with PostgreSQL (Prisma), Cloudinary, and Redis. Implement intelligent algorithms for feed, search, and suggestions while ensuring ACID compliance, proper pagination, and resource optimization.

### 8.1 Infrastructure Setup ✅

#### 8.1.1 Install Dependencies ✅

```bash
npm install -D prisma tsx @types/pg --save-dev --legacy-peer-deps
npm install prisma @prisma/client @prisma/adapter-pg dotenv pg --legacy-peer-deps
npm install cloudinary next-cloudinary --legacy-peer-deps
npm install bcrypt @types/bcrypt --legacy-peer-deps
npm install @upstash/redis --legacy-peer-deps
```

#### 8.1.2 Configuration Files ✅

- [x] Initialize Prisma: `npx prisma init`
- [x] Create `prisma/schema.prisma` with complete schema
- [x] Set up `.env` with database URLs
- [x] Configure Cloudinary credentials
- [x] Set up Redis/Upstash connection

#### 8.1.3 Database Schema ✅

- [x] User model with relations
- [x] Follow model (self-referential many-to-many)
- [x] Post model with JSON routes field
- [x] Comment model with cascade delete
- [x] Like/Dislike model with enum
- [x] Bookmark model
- [x] Notification models (Notification + NotificationRecipient)
- [x] UserActivity model for feed algorithm
- [x] Add indexes for performance
- [x] Add full-text search on posts

### 8.2 Core Services Setup [x]

#### 8.2.1 Prisma Client ✅

- [x] Create `lib/db/prisma.ts` with singleton pattern
- [x] Add connection pooling configuration
- [x] Implement health check function
- [x] Configure logging for development

#### 8.2.2 Cloudinary Integration ✅

- [x] Create `lib/config/cloudinary.ts` with config
- [x] Define upload presets (avatar, postImage)
- [x] Create `lib/utils/cloudinary.ts` with helper functions:
  - [x] `uploadImage()` - Upload with transformations
  - [x] `deleteImage()` - Single image deletion
  - [x] `deleteImages()` - Bulk deletion
  - [x] `extractPublicId()` - Extract ID from URL
  - [x] `validateImageFile()` - Client-side validation
  - [x] `fileToBase64()` - File conversion

#### 8.2.3 Redis Cache Layer ✅

- [x] Create `lib/cache/redis.ts` with Upstash client
- [x] Implement cache helpers:
  - [x] `get()` - Retrieve cached data
  - [x] `set()` - Store with TTL
  - [x] `del()` - Delete single key
  - [x] `delPattern()` - Delete multiple keys
  - [x] `incr()` - Counter increment
- [x] Define cache keys structure
- [x] Set appropriate TTLs (5-30 minutes)

### 8.3 Algorithm Implementation ✅

#### 8.3.1 Personalized Feed Algorithm ✅

- [x] Create `lib/services/feedService.ts`
- [x] Implement `getPersonalizedFeed()`:
  - [x] 70% weight: Posts from followed users
  - [x] 20% weight: Posts with similar tags
  - [x] 10% weight: Trending posts
- [x] Cursor-based pagination for infinite scroll
- [x] Enrich posts with user interaction state
- [x] Implement `getUserFavoriteTags()` helper
- [x] Create `getTrendingPosts()` with scoring:
  - [x] Formula: (likes + comments×2 + bookmarks×1.5) / age_in_hours
  - [x] Filter posts from last 7 days

#### 8.3.2 Search Algorithm ✅

- [x] Create `lib/services/searchService.ts`
- [x] Implement multi-category search:
  - [x] User search (username, firstName, lastName)
  - [x] Post search (full-text on title, tag matching)
  - [x] Tag search with frequency ranking
- [x] Rank results by:
  - [x] Verified users first
  - [x] Follower count for users
  - [x] Likes and recency for posts

#### 8.3.3 User Suggestions Algorithm ✅

- [x] Create `lib/services/suggestionsService.ts`
- [x] Implement `getUserSuggestions()` with scoring:
  - [x] Location proximity: 40 points
  - [x] Similar interests (tags): 30 points
  - [x] Mutual connections: 20 points
  - [x] Verified status: 10 points
- [x] Helper functions:
  - [x] `isSimilarLocation()` - Compare locations
  - [x] `getCommonTags()` - Find shared interests
  - [x] `getUserFavoriteTags()` - Activity analysis

### 8.4 Rate Limiting & Security [x]

#### 8.4.1 Rate Limiter [x]

- [x] Create `lib/utils/rateLimiter.ts`
- [x] Implement Redis-based rate limiting:
  - [x] `rateLimit()` - Generic rate limiter
  - [x] `rateLimitByIP()` - IP-based limits
  - [x] `rateLimitByUser()` - User-based limits
- [x] Apply to all API routes:
  - [x] 100 requests/minute per IP (general)
  - [x] 300 requests/minute per user
  - [x] 10 posts/hour per user
  - [x] 50 comments/hour per user

#### 8.4.2 Security Implementation [x]

- [x] Password hashing with bcrypt (12 salt rounds)
- [x] Input validation with Zod schemas
- [x] File upload validation (type, size)
- [x] Sanitize user inputs
- [x] Implement CORS for production
- [x] Secure environment variables

### 8.5 Database Migration [x]

#### 8.5.1 Schema Migration [x]

- [x] Run initial migration: `npx prisma migrate dev --name init`
- [x] Review generated SQL
- [x] Test migration rollback
- [x] Generate Prisma Client: `npx prisma generate`

#### 8.5.2 Data Migration [x]

- [x] Create `scripts/migrate-to-prisma.ts`
- [x] Migrate users:
  - [x] Hash passwords with bcrypt
  - [x] Preserve user IDs
  - [x] Map avatar URLs
- [x] Migrate posts:
  - [x] Convert routes to JSON
  - [x] Preserve timestamps
  - [x] Maintain relationships
- [x] Migrate comments, likes, bookmarks
- [x] Verify data integrity
- [x] Create relationships (follows)

#### 8.5.3 Database Seeding [x]

- [x] Create `prisma/seed.ts`
- [x] Generate realistic test data
- [x] Create diverse user profiles
- [x] Add varied posts with tags
- [x] Establish follow relationships
- [x] Run: `npx prisma db seed`

### 8.6 API Routes Update ✅

#### 8.6.1 Authentication Routes ✅

- [x] `POST /api/auth/register`:
  - [x] Hash password with bcrypt (12 salt rounds)
  - [x] Create user in Prisma
  - [x] Generate JWT tokens
  - [x] Store OTP in Redis cache (600s TTL)
  - [x] Rate limit: 10 per hour per IP
- [x] `POST /api/auth/login`:
  - [x] Verify credentials with bcrypt.compare
  - [x] Compare hashed passwords
  - [x] Return tokens + user data with follower counts
  - [x] Rate limit: 10 per 15 minutes per IP
- [x] `POST /api/auth/verify-otp`:
  - [x] Update for Prisma
  - [x] Redis cache + in-memory fallback
  - [x] Rate limit: 5 per 15 minutes per IP
- [x] `POST /api/auth/refresh`:
  - [x] Implement token refresh with JWT verification
  - [x] Rate limit: 20 per hour per IP
- [x] `POST /api/auth/logout`:
  - [x] Clear httpOnly cookies
  - [x] Rate limit: 10 per hour per IP

#### 8.6.2 Post Routes ✅

- [x] `GET /api/posts`:
  - [x] Check cache first (5 min TTL)
  - [x] Use `getPersonalizedFeed()` algorithm
  - [x] Return cursor for pagination
  - [x] Enrich with user interaction state
  - [x] Rate limit: 100 per minute for guests
- [x] `POST /api/posts`:
  - [x] Rate limit: 10 per hour per user
  - [x] Upload images to Cloudinary (max 5MB)
  - [x] Create post in Prisma with JSON routes
  - [x] Invalidate user feed cache
  - [x] Track SHARE activity (score: 5)
- [x] `GET /api/posts/:id`:
  - [x] Check cache first (15 min TTL)
  - [x] Track VIEW activity (score: 1)
  - [x] Include user data and counts
- [x] `PUT /api/posts/:id`:
  - [x] Verify ownership
  - [x] Handle image updates (delete old, upload new to Cloudinary)
  - [x] Update post data
  - [x] Invalidate caches
- [x] `DELETE /api/posts/:id`:
  - [x] Verify ownership
  - [x] Delete images from Cloudinary
  - [x] Cascade delete via Prisma schema
  - [x] Invalidate caches
- [x] `POST /api/posts/:id/like`:
  - [x] Toggle like/dislike with LIKE/DISLIKE enum
  - [x] Rate limit: 200 per hour per user
  - [x] Track activity (LIKE: 2, DISLIKE: 1)
  - [x] Unique constraint: postId_userId
- [x] `POST /api/posts/:id/bookmark`:
  - [x] Toggle bookmark
  - [x] Rate limit: 100 per hour per user
  - [x] Track BOOKMARK activity (score: 3)
- [x] `POST /api/posts/:id/comments`:
  - [x] Create with Prisma relations
  - [x] Rate limit: 50 per hour per user
  - [x] Track COMMENT activity (score: 3)
  - [x] Validation with Zod

#### 8.6.3 User Routes ✅

- [x] `GET /api/users`:
  - [x] Paginated list with search functionality
  - [x] Rate limit: 100 per minute per IP
  - [x] Order by verified status and creation date
  - [x] Cursor-based pagination
- [x] `GET /api/users/:id`:
  - [x] Fetch with relations (followers, following counts)
  - [x] Cache with 10 min TTL
  - [x] Transform to match frontend expectations
- [x] `PUT /api/users/:id`:
  - [x] Handle avatar upload to Cloudinary (400×400)
  - [x] Delete old avatar from Cloudinary
  - [x] Update user data with Prisma
  - [x] Password change support with bcrypt
  - [x] Ownership verification
  - [x] Rate limit: 20 per hour per user
  - [x] Invalidate user cache
- [x] `DELETE /api/users/:id`:
  - [x] Delete avatar from Cloudinary
  - [x] Cascade delete via Prisma
  - [x] Ownership verification
- [x] `POST /api/users/:id/follow`:
  - [x] Toggle follow/unfollow
  - [x] Create Follow relationship in Prisma
  - [x] Create FOLLOW notification
  - [x] Rate limit: 100 per hour per user
  - [x] Invalidate caches (user, suggestions)
- [x] `GET /api/users/:id/follow`:
  - [x] Check follow status
  - [x] Optional authentication

#### 8.6.4 Notification Routes ✅

- [x] `GET /api/notifications`:
  - [x] Fetch via NotificationRecipient model
  - [x] Include actor information
  - [x] Cursor-based pagination
  - [x] Rate limit: 100 per minute per user
  - [x] Authentication required
- [x] `PATCH /api/notifications`:
  - [x] Mark single notification as read
  - [x] Mark all notifications as read
  - [x] Update NotificationRecipient.read
  - [x] Rate limit: 50 per minute per user
- [x] `GET /api/notifications/:id`:
  - [x] Fetch single notification
  - [x] Verify ownership
  - [x] Include actor and post data
- [x] `PATCH /api/notifications/:id`:
  - [x] Mark as read
  - [x] Ownership verification
- [x] `DELETE /api/notifications/:id`:
  - [x] Delete recipient record
  - [x] Ownership verification
- [x] `POST /api/notifications/subscribe`:
  - [x] Authentication required
  - [x] Rate limit: 10 per hour per user
  - [x] TODO: Implement PushSubscription model
- [x] `POST /api/notifications/unsubscribe`:
  - [x] Authentication required
  - [x] Rate limit: 10 per hour per user
  - [x] TODO: Implement subscription deletion

### 8.7 Real-time Features (WebSocket/SSE) [ ]

#### 8.7.1 Architecture Decision [ ]

- [ ] Evaluate WebSocket vs Server-Sent Events (SSE)
  - [ ] **WebSocket**: Bidirectional, better for chat/collaborative features
  - [ ] **SSE**: Unidirectional, simpler, works with HTTP/2, better for notifications
  - [ ] Recommendation: SSE for Phase 8.7, WebSocket for future chat features
- [ ] Choose implementation:
  - [ ] Native WebSocket/EventSource
  - [ ] Socket.IO (WebSocket library)
  - [ ] Pusher/Ably (managed service)
  - [ ] Supabase Realtime (if using Supabase)

#### 8.7.2 Real-time Notifications (SSE) [ ]

- [ ] Create `/api/notifications/stream` endpoint:
  - [ ] Return `text/event-stream` content type
  - [ ] Send keep-alive pings every 30s
  - [ ] Push new notifications as they occur
  - [ ] Handle client disconnection/reconnection
- [ ] Update `useNotifications` hook:
  - [ ] Replace polling with EventSource
  - [ ] Handle connection states (connecting, open, error, closed)
  - [ ] Auto-reconnect on disconnect
  - [ ] Fallback to polling if SSE not supported

#### 8.7.3 Real-time Feed Updates (Optional) [ ]

- [ ] Create `/api/posts/stream` for new posts notification
- [ ] Update `useNewPostsNotification`:
  - [ ] Listen for new post events
  - [ ] Show notification badge
  - [ ] Preload new posts in background
- [ ] Handle rate limiting on SSE connections

#### 8.7.4 Infrastructure Considerations [ ]

- [ ] Serverless limitations:
  - [ ] Vercel/Netlify have connection time limits
  - [ ] Consider dedicated WebSocket server for scale
  - [ ] Use managed service (Pusher/Ably) for production
- [ ] Connection pooling:
  - [ ] Limit concurrent SSE connections per user
  - [ ] Clean up stale connections
  - [ ] Monitor connection count
- [ ] Security:
  - [ ] Authenticate SSE connections with JWT
  - [ ] Validate event subscriptions
  - [ ] Implement connection rate limiting

**Note**: Currently disabled polling in production (Phase 8.5.4 fix) to prevent Netlify function abuse. SSE/WebSocket should be implemented before re-enabling real-time features.

### 8.8 Frontend Updates [ ]

#### 8.8.1 API Client Updates [ ]

- [ ] Update `lib/utils/api.ts` for cursor pagination
- [ ] Add rate limit error handling
- [ ] Implement retry logic with exponential backoff
- [ ] Handle 429 (Rate Limit) responses

#### 8.8.2 Image Upload Components [ ]

- [ ] Create `components/ui/ImageUpload.tsx`:
  - [ ] File validation (5MB max, jpg/png/webp)
  - [ ] Preview before upload
  - [ ] Progress indicator
  - [ ] Error handling
  - [ ] Multiple file support
- [ ] Update `ShareRouteModal` for Cloudinary
- [ ] Update profile edit for avatar upload

#### 8.8.3 Pagination Updates [ ]

- [ ] Implement infinite scroll in Feed
- [ ] Use `react-intersection-observer` for scroll detection
- [ ] Load more posts when near bottom
- [ ] Show loading skeleton while fetching
- [ ] Handle end of feed state

### 8.9 Testing [ ]

#### 8.9.1 Unit Tests [ ]

- [ ] Test Prisma service functions
- [ ] Test Cloudinary upload/delete
- [ ] Test rate limiter logic
- [ ] Test feed algorithm scoring
- [ ] Test search ranking

#### 8.9.2 Integration Tests [ ]

- [ ] Test complete auth flow with database
- [ ] Test post creation with image upload
- [ ] Test feed algorithm with real data
- [ ] Test search across all categories
- [ ] Test cascade deletes

#### 8.9.3 Performance Tests [ ]

- [ ] Load test with k6 or Artillery:
  - [ ] 1000 concurrent users
  - [ ] Feed loading performance
  - [ ] Search response times
  - [ ] Image upload throughput
- [ ] Query performance profiling
- [ ] Cache hit rate monitoring

### 8.10 Deployment [ ]

#### 8.10.1 Database Setup [ ]

- [ ] Choose provider (Supabase/Neon/Railway/Vercel Postgres)
- [ ] Create production database
- [ ] Set up connection pooling
- [ ] Configure backup schedule
- [ ] Set up monitoring/alerts

#### 8.10.2 Cloudinary Setup [ ]

- [ ] Create production account
- [ ] Configure upload presets
- [ ] Set up webhooks (optional)
- [ ] Configure auto-backup
- [ ] Set usage alerts

#### 8.10.3 Redis Setup [ ]

- [ ] Create Upstash Redis instance
- [ ] Configure for production
- [ ] Set up persistence
- [ ] Monitor memory usage

#### 8.10.4 Environment Configuration [ ]

- [ ] Set all environment variables in Vercel
- [ ] Test with production database
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed production data (minimal)
- [ ] Verify all integrations

#### 8.10.5 Monitoring [ ]

- [ ] Set up Prisma query logging
- [ ] Monitor database performance
- [ ] Track Cloudinary usage
- [ ] Monitor Redis cache hit rates
- [ ] Set up error tracking (Sentry)
- [ ] Create performance dashboard

### 8.11 Performance Optimizations [ ]

- [ ] Database indexes on frequently queried fields
- [ ] Implement query result caching (5-30 min TTL)
- [ ] Use `select` to fetch only needed fields
- [ ] Optimize image transformations in Cloudinary
- [ ] Implement connection pooling
- [ ] Use cursor-based pagination everywhere
- [ ] Lazy load images with Next/Image
- [ ] Compress API responses with gzip

### 8.12 Documentation [ ]

- [ ] Update API documentation with new endpoints
- [ ] Document Prisma schema and relations
- [ ] Create migration guide from mock to real DB
- [ ] Document algorithm implementations
- [ ] Add troubleshooting guide
- [ ] Update README with setup instructions

### Success Metrics

- [ ] All API routes working with Prisma
- [ ] Image upload/delete functional
- [ ] Feed algorithm delivering personalized content
- [ ] Search returning relevant results
- [ ] Suggestions providing quality recommendations
- [ ] Rate limiting preventing abuse
- [ ] Cache reducing database load by 60%+
- [ ] Page load times < 2 seconds
- [ ] Database queries < 100ms (95th percentile)
- [ ] 99.9% uptime

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
