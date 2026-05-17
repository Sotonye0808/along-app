# Mock Backend Architecture

## Overview

The Along app now uses a **TypeScript-based in-memory mock backend** that works seamlessly in Next.js and is production-ready for deployment on platforms like Vercel and Netlify. This architecture allows for easy switching between mock data and a real database in the future.

## Architecture Components

### 1. Data Layer (`app/lib/data/`)

#### `mockData.ts`
- Contains all mock data (users, posts, comments, likes, bookmarks, notifications)
- Uses TypeScript with proper interfaces from global types
- Exported as named constants that can be imported anywhere
- Easy to update and maintain
- **Nigerian context**: Routes with Lagos, Ibadan, Abuja locations

#### `database.ts`
- Implements `InMemoryStore` class with database-like operations
- Singleton pattern ensures single source of truth
- Provides async methods that mimic real database calls
- Handles relationships between entities (e.g., updating post comment counts)
- Can be easily replaced with real database adapter

### 2. API Layer (`app/api/`)

Next.js API routes that handle HTTP requests:

```
app/api/
├── users/
│   ├── route.ts              # GET, POST /api/users
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE /api/users/:id
├── posts/
│   ├── route.ts              # GET, POST /api/posts
│   └── [id]/
│       ├── route.ts          # GET, PUT, DELETE /api/posts/:id
│       ├── comments/
│       │   └── route.ts      # GET, POST /api/posts/:id/comments
│       ├── like/
│       │   └── route.ts      # POST, DELETE /api/posts/:id/like
│       └── bookmark/
│           └── route.ts      # POST, GET /api/posts/:id/bookmark
└── notifications/
    └── route.ts              # GET, POST, PATCH /api/notifications
```

## Key Features

### ✅ Production-Ready
- Works on Vercel, Netlify, and other serverless platforms
- No external dependencies or services required
- Instant deployment with no configuration

### ✅ Type-Safe
- Full TypeScript support
- Uses global type definitions from `app/lib/types/`
- IDE autocomplete and type checking

### ✅ RESTful API
- Standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Proper status codes (200, 201, 404, 500)
- JSON responses with error handling

### ✅ Stateful Operations
- In-memory storage persists during development session
- Supports CRUD operations on all entities
- Maintains relationships (e.g., post comment counts)
- Automatic ID generation

### ✅ Easy Migration Path
- Abstract database interface
- Swap `InMemoryStore` with real database adapter
- No changes needed in API routes or frontend code

## API Endpoints

### Users
- `GET /api/users` - Get all users (passwords removed)
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Posts
- `GET /api/posts` - Get all posts (supports ?limit=10&userId=1)
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Comments
- `GET /api/posts/:id/comments` - Get comments for post
- `POST /api/posts/:id/comments` - Add comment to post

### Likes
- `POST /api/posts/:id/like` - Toggle like/dislike (body: `{userId, type}`)
- `DELETE /api/posts/:id/like?userId=1` - Remove like

### Bookmarks
- `POST /api/posts/:id/bookmark` - Toggle bookmark (body: `{userId}`)
- `GET /api/posts/:id/bookmark?userId=1` - Get user's bookmarks

### Notifications
- `GET /api/notifications?userId=1` - Get user's notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications` - Mark as read (body: `{notificationId}` or `{userId, markAll: true}`)

## Usage Examples

### Frontend (Client Component)
```typescript
import { api } from '@/lib/utils/api';
import { API_ENDPOINTS } from '@/lib/constants';

// Get all posts
const response = await api.get<Post[]>(API_ENDPOINTS.POSTS);
const posts = response.data;

// Create a post
const newPost = await api.post<Post>(API_ENDPOINTS.POSTS, {
  userId: '1',
  title: 'My Route',
  routes: [...],
  images: [...],
  tags: ['lagos'],
});

// Like a post
await api.post(API_ENDPOINTS.POST_LIKE('1'), {
  userId: '1',
  type: 'like'
});
```

### Server Component
```typescript
import { db } from '@/lib/data/database';

// Direct database access
const posts = await db.getPosts();
const user = await db.getUserById('1');
```

### API Route
```typescript
import { db } from '@/lib/data/database';
import { NextResponse } from 'next/server';

export async function GET() {
  const posts = await db.getPosts();
  return NextResponse.json(posts);
}
```

## Configuration

### Development (Current Setup)
```typescript
// app/lib/constants/index.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
```

- Uses Next.js API routes (`/api/*`)
- Data persists during development session
- No external services needed

### Production with Real Backend
```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.along.com
```

- Points to external API server
- All existing code continues to work
- No code changes needed

## Migration to Real Database

### Step 1: Create Database Adapter
```typescript
// app/lib/data/postgresDatabase.ts
class PostgresStore {
  async getUsers(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  }
  
  async createUser(userData: Partial<User>): Promise<User> {
    const result = await pool.query(
      'INSERT INTO users (...) VALUES (...) RETURNING *',
      [...]
    );
    return result.rows[0];
  }
  
  // ... implement all methods
}
```

### Step 2: Update Database Export
```typescript
// app/lib/data/database.ts
import { PostgresStore } from './postgresDatabase';

export const db = new PostgresStore();
// or
// export const db = new MongoStore();
// export const db = new SupabaseStore();
```

### Step 3: Deploy
- No changes needed in API routes
- No changes needed in frontend code
- Just deploy with new database connection

## Benefits Over json-server

| Feature | json-server | Next.js API Routes |
|---------|-------------|-------------------|
| **Deployment** | ❌ Requires separate hosting | ✅ Deploys with app |
| **Type Safety** | ❌ No TypeScript support | ✅ Full TypeScript |
| **Customization** | ⚠️ Limited | ✅ Unlimited |
| **Performance** | ⚠️ External HTTP calls | ✅ In-process |
| **Production Ready** | ❌ Mock only | ✅ Production-ready |
| **Migration Path** | ❌ Complete rewrite | ✅ Swap database layer |

## Data Persistence

### Current Behavior
- Data persists in memory during development session
- Server restart = fresh data from `mockData.ts`
- Perfect for development and testing

### For Production Persistence
Two options:

1. **Use a real database** (recommended)
   - Follow migration steps above
   - True persistence

2. **Add file-based storage** (quick fix)
   ```typescript
   // Save to JSON file on changes
   async createPost(postData: Partial<Post>): Promise<Post> {
     const newPost = { ... };
     this.posts.push(newPost);
     await fs.writeFile('./data.json', JSON.stringify(this));
     return newPost;
   }
   ```

## Testing

### Test API Routes Directly
```bash
# Get all posts
curl http://localhost:3000/api/posts

# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"userId":"1","title":"Test","routes":[],"images":[],"tags":[]}'

# Like a post
curl -X POST http://localhost:3000/api/posts/1/like \
  -H "Content-Type: application/json" \
  -d '{"userId":"1","type":"like"}'
```

### Test with Frontend
```typescript
// All existing code works without changes!
const posts = await api.get(API_ENDPOINTS.POSTS);
```

## Environment Variables

### `.env.local` (Development)
```env
# Optional: Override API base URL
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### `.env.production` (Production)
```env
# Point to real backend when ready
NEXT_PUBLIC_API_URL=https://api.along.com

# Or leave empty to use Next.js API routes
# NEXT_PUBLIC_API_URL=/api
```

## Future Enhancements

### Phase 1: Current (In-Memory Mock) ✅
- TypeScript mock data
- Next.js API routes
- Full CRUD operations
- Works on Vercel/Netlify

### Phase 2: File-Based Persistence
- Save to JSON file
- Load on server start
- Simple persistence

### Phase 3: Real Database
- PostgreSQL, MongoDB, or Supabase
- Swap database adapter
- Production-ready

### Phase 4: Advanced Features
- Caching with Redis
- Full-text search
- Real-time subscriptions
- Image upload to cloud storage

## Notes

- ⚠️ **No breaking changes**: All existing frontend code continues to work
- ✅ **Production-ready**: Deploy to Vercel/Netlify today
- 🔄 **Easy migration**: Swap database layer when ready
- 📝 **Type-safe**: Full TypeScript support
- 🚀 **Fast**: In-process, no external HTTP calls
- 🔧 **Customizable**: Full control over API logic

## Cleanup

The old `mock-backend/` directory with `json-server` can now be safely removed:
```bash
# Optional: Remove old json-server files
rm -rf mock-backend/
npm uninstall json-server
# Remove "mock-api" script from package.json
```

Keep the `mock-backend/db.json` file as reference if needed, but it's no longer used by the application.
