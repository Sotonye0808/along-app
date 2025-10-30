# Mock Backend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ALONG APP - NEW ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │  Client Comps   │  │  Server Comps   │  │  Server Actions │            │
│  │  (use client)   │  │  (async/await)  │  │  (use server)   │            │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │
│           │                    │                     │                      │
│           │                    │                     │                      │
│           ▼                    ▼                     ▼                      │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │              API Client (lib/utils/api.ts)                    │          │
│  │              - Axios with interceptors                        │          │
│  │              - Error handling                                 │          │
│  │              - Token management                               │          │
│  └──────────────────────────┬───────────────────────────────────┘          │
│                             │                                               │
└─────────────────────────────┼───────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │
┌─────────────────────────────▼───────────────────────────────────────────────┐
│                            API ROUTES LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  /api/users              /api/posts           /api/notifications            │
│  ┌─────────────┐        ┌─────────────┐      ┌─────────────┐              │
│  │ GET  /users │        │ GET  /posts │      │ GET  /notif │              │
│  │ POST /users │        │ POST /posts │      │ POST /notif │              │
│  └─────────────┘        └─────────────┘      │ PATCH/notif │              │
│                                               └─────────────┘              │
│  /api/users/[id]         /api/posts/[id]                                    │
│  ┌─────────────┐        ┌─────────────┐                                    │
│  │ GET  /:id   │        │ GET  /:id   │                                    │
│  │ PUT  /:id   │        │ PUT  /:id   │                                    │
│  │ DELETE /:id │        │ DELETE /:id │                                    │
│  └─────────────┘        └─────────────┘                                    │
│                                                                              │
│                         /api/posts/[id]/comments                            │
│                         ┌─────────────────────┐                             │
│                         │ GET  /:id/comments  │                             │
│                         │ POST /:id/comments  │                             │
│                         └─────────────────────┘                             │
│                                                                              │
│                         /api/posts/[id]/like                                │
│                         ┌─────────────────────┐                             │
│                         │ POST /:id/like      │                             │
│                         │ DELETE /:id/like    │                             │
│                         └─────────────────────┘                             │
│                                                                              │
│                         /api/posts/[id]/bookmark                            │
│                         ┌─────────────────────┐                             │
│                         │ POST /:id/bookmark  │                             │
│                         │ GET  /:id/bookmark  │                             │
│                         └─────────────────────┘                             │
│                                                                              │
│  All routes call:       import { db } from '@/lib/data/database'            │
│                                 ▼                                            │
└─────────────────────────────────┼───────────────────────────────────────────┘
                                  │
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                          DATABASE SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  InMemoryStore (lib/data/database.ts)                              │    │
│  │  ┌─────────────────────────────────────────────────────────────┐  │    │
│  │  │  Singleton Pattern - Single Instance                         │  │    │
│  │  └─────────────────────────────────────────────────────────────┘  │    │
│  │                                                                     │    │
│  │  Users Methods:            Posts Methods:                          │    │
│  │  • getUsers()              • getPosts(limit?)                      │    │
│  │  • getUserById(id)         • getPostById(id)                       │    │
│  │  • getUserByEmail(email)   • getPostsByUserId(userId)              │    │
│  │  • createUser(data)        • createPost(data)                      │    │
│  │  • updateUser(id, data)    • updatePost(id, data)                  │    │
│  │  • deleteUser(id)          • deletePost(id)                        │    │
│  │                                                                     │    │
│  │  Comments Methods:         Likes Methods:                          │    │
│  │  • getCommentsByPostId()   • getLikesByPostId()                    │    │
│  │  • createComment(data)     • getLike(postId, userId)               │    │
│  │  • deleteComment(id)       • createLike(data)                      │    │
│  │                            • deleteLike(postId, userId)            │    │
│  │                                                                     │    │
│  │  Bookmarks Methods:        Notifications Methods:                  │    │
│  │  • getBookmarksByUserId()  • getNotificationsByUserId()            │    │
│  │  • getBookmark()           • createNotification(data)              │    │
│  │  • createBookmark(data)    • markNotificationAsRead(id)            │    │
│  │  • deleteBookmark()        • markAllNotificationsAsRead(userId)    │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                  │                                           │
│                                  │ Initializes from                          │
│                                  ▼                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                              DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Mock Data (lib/data/mockData.ts)                                  │    │
│  │                                                                     │    │
│  │  export const mockUsers: User[] = [...]                            │    │
│  │  export const mockPosts: Post[] = [...]                            │    │
│  │  export const mockComments: Comment[] = [...]                      │    │
│  │  export const mockLikes: Like[] = [...]                            │    │
│  │  export const mockBookmarks: Bookmark[] = [...]                    │    │
│  │  export const mockNotifications: Notification[] = [...]            │    │
│  │                                                                     │    │
│  │  ✅ TypeScript                                                      │    │
│  │  ✅ Strongly Typed                                                  │    │
│  │  ✅ Nigerian Context (Lagos, Ibadan, Abuja)                        │    │
│  │  ✅ Realistic Data                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          TYPE DEFINITIONS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Global Types (lib/types/interfaces.ts)                            │    │
│  │                                                                     │    │
│  │  interface User { ... }                                            │    │
│  │  interface Post { ... }                                            │    │
│  │  interface Comment { ... }                                         │    │
│  │  interface Like { ... }                                            │    │
│  │  interface Bookmark { ... }                                        │    │
│  │  interface Notification { ... }                                    │    │
│  │  interface Route { ... }                                           │    │
│  │  interface Link { ... }                                            │    │
│  │  type VehicleType = "taxi" | "bike" | "keke" | ...                │    │
│  │                                                                     │    │
│  │  ✅ Available globally (no imports needed)                         │    │
│  │  ✅ Used throughout the app                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         MIGRATION TO PRODUCTION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  OPTION 1: External Backend                                                 │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Set NEXT_PUBLIC_API_URL=https://api.yourdomain.com                │    │
│  │                                                                     │    │
│  │  Frontend → API Client → External API → Real Database              │    │
│  │                                                                     │    │
│  │  ✅ No code changes needed                                          │    │
│  │  ✅ Complete separation of concerns                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  OPTION 2: Next.js API + Real Database                                      │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  1. Create database adapter:                                       │    │
│  │     class PostgresStore implements DatabaseInterface { ... }       │    │
│  │                                                                     │    │
│  │  2. Update database.ts:                                            │    │
│  │     export const db = new PostgresStore();                         │    │
│  │                                                                     │    │
│  │  Frontend → Next.js API Routes → Database Adapter → Real Database  │    │
│  │                                                                     │    │
│  │  ✅ No frontend changes needed                                      │    │
│  │  ✅ Keep API routes logic                                          │    │
│  │  ✅ Add real persistence                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW EXAMPLES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  GET Posts:                                                                 │
│  ┌─────────┐   GET /api/posts   ┌──────────┐   getPosts()   ┌──────────┐  │
│  │  Feed   │ ─────────────────> │   API    │ ────────────>  │ Database │  │
│  │  Comp   │ <───────────────── │  Route   │ <────────────  │  Service │  │
│  └─────────┘   [Post[], 200]    └──────────┘   Post[]       └──────────┘  │
│                                                                              │
│  Create Post:                                                               │
│  ┌─────────┐  POST /api/posts   ┌──────────┐  createPost()  ┌──────────┐  │
│  │  Modal  │ ─────────────────> │   API    │ ────────────>  │ Database │  │
│  │         │ <───────────────── │  Route   │ <────────────  │  Service │  │
│  └─────────┘   [Post, 201]      └──────────┘   Post         └──────────┘  │
│                                                                              │
│  Like Post:                                                                 │
│  ┌─────────┐POST/api/posts/1/like┌─────────┐ createLike()  ┌──────────┐  │
│  │PostCard │ ─────────────────> │   API    │ ────────────>  │ Database │  │
│  │         │ <───────────────── │  Route   │ <────────────  │  Service │  │
│  └─────────┘  [message, 201]    └──────────┘   Like         └──────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            DEPLOYMENT FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Development:                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  npm run dev                                                        │    │
│  │  └─> Next.js Dev Server                                            │    │
│  │      ├─> Frontend (localhost:3000)                                 │    │
│  │      └─> API Routes (/api/*)                                       │    │
│  │          └─> In-Memory Database                                    │    │
│  │              └─> Mock Data                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Production (Vercel/Netlify):                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  git push                                                           │    │
│  │  └─> Automatic Deployment                                          │    │
│  │      ├─> Build Next.js                                             │    │
│  │      ├─> Deploy Static Assets (CDN)                                │    │
│  │      ├─> Deploy Serverless Functions                               │    │
│  │      │   └─> API Routes as Lambda Functions                        │    │
│  │      │       └─> In-Memory Database (per request)                  │    │
│  │      │           └─> Mock Data                                     │    │
│  │      └─> Ready! ✅                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ✅ Works out of the box                                                    │
│  ✅ No configuration needed                                                 │
│  ✅ No external services                                                    │
│  ✅ Fully functional mock backend in production                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Benefits

1. **Seamless Integration** - No breaking changes to existing code
2. **Production Ready** - Deploys to Vercel/Netlify without configuration
3. **Type Safe** - Full TypeScript support throughout
4. **Easy Migration** - Swap database layer when ready
5. **Better Performance** - In-process API calls, no external HTTP
6. **Full Control** - Customize API logic as needed

## Documentation

- **Architecture**: `.github/mock-backend-architecture.md`
- **Migration Guide**: `.github/migration-summary.md`
- **Quick Reference**: `.github/quick-reference.md`
- **Complete Summary**: `.github/MOCK_BACKEND_COMPLETE.md`
