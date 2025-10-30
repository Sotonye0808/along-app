# Mock Backend - Quick Reference

## 🚀 Getting Started

```bash
# Start development server (that's it!)
npm run dev
```

## 📚 Import Mock Data

```typescript
// Import specific data collections
import { mockUsers, mockPosts, mockComments } from '@/lib/data/mockData';

// Use in Server Components
export default async function Page() {
  const users = mockUsers; // Direct access
  return <div>{users.map(user => ...)}</div>;
}
```

## 🔧 Database Service

```typescript
// Import database instance
import { db } from '@/lib/data/database';

// Users
const users = await db.getUsers();
const user = await db.getUserById('1');
const user = await db.getUserByEmail('test@example.com');
const newUser = await db.createUser({ userName: 'test', ... });
const updated = await db.updateUser('1', { bio: 'New bio' });
const success = await db.deleteUser('1');

// Posts
const posts = await db.getPosts(); // All posts, sorted by date
const posts = await db.getPosts(10); // Limit to 10
const post = await db.getPostById('1');
const userPosts = await db.getPostsByUserId('1');
const newPost = await db.createPost({ userId: '1', title: 'Test', ... });
const updated = await db.updatePost('1', { title: 'Updated' });
const success = await db.deletePost('1');

// Comments
const comments = await db.getCommentsByPostId('1');
const newComment = await db.createComment({ postId: '1', userId: '1', text: 'Great!' });
const success = await db.deleteComment('1');

// Likes
const likes = await db.getLikesByPostId('1');
const like = await db.getLike('postId', 'userId');
const newLike = await db.createLike({ postId: '1', userId: '1', type: 'like' });
const success = await db.deleteLike('postId', 'userId');

// Bookmarks
const bookmarks = await db.getBookmarksByUserId('1');
const bookmark = await db.getBookmark('postId', 'userId');
const newBookmark = await db.createBookmark({ postId: '1', userId: '1' });
const success = await db.deleteBookmark('postId', 'userId');

// Notifications
const notifications = await db.getNotificationsByUserId('1');
const newNotification = await db.createNotification({ userId: '1', type: 'like', ... });
const success = await db.markNotificationAsRead('1');
const success = await db.markAllNotificationsAsRead('1');
```

## 🌐 API Endpoints

### Users
```bash
GET    /api/users              # Get all users
POST   /api/users              # Create user
GET    /api/users/:id          # Get user by ID
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

### Posts
```bash
GET    /api/posts              # Get all posts (?limit=10&userId=1)
POST   /api/posts              # Create post
GET    /api/posts/:id          # Get post by ID
PUT    /api/posts/:id          # Update post
DELETE /api/posts/:id          # Delete post
```

### Comments
```bash
GET    /api/posts/:id/comments # Get post comments
POST   /api/posts/:id/comments # Add comment
```

### Likes
```bash
POST   /api/posts/:id/like     # Toggle like/dislike
DELETE /api/posts/:id/like     # Remove like
```

### Bookmarks
```bash
POST   /api/posts/:id/bookmark # Toggle bookmark
GET    /api/posts/:id/bookmark # Get bookmarks (?userId=1)
```

### Notifications
```bash
GET    /api/notifications      # Get notifications (?userId=1)
POST   /api/notifications      # Create notification
PATCH  /api/notifications      # Mark as read
```

## 💻 Frontend Usage

```typescript
import { api } from '@/lib/utils/api';
import { API_ENDPOINTS } from '@/lib/constants';

// GET request
const response = await api.get<Post[]>(API_ENDPOINTS.POSTS);
const posts = response.data;

// POST request
const newPost = await api.post<Post>(API_ENDPOINTS.POSTS, {
  userId: '1',
  title: 'My Route',
  routes: [...],
  images: [],
  tags: ['lagos']
});

// PUT request
await api.put(API_ENDPOINTS.POST_BY_ID('1'), {
  title: 'Updated Title'
});

// DELETE request
await api.delete(API_ENDPOINTS.POST_BY_ID('1'));

// Like a post
await api.post(API_ENDPOINTS.POST_LIKE('1'), {
  userId: '1',
  type: 'like' // or 'dislike'
});

// Bookmark a post
await api.post(API_ENDPOINTS.POST_BOOKMARK('1'), {
  userId: '1'
});
```

## 🔄 Server Components

```typescript
// Direct database access (faster, no HTTP overhead)
import { db } from '@/lib/data/database';

export default async function PostsPage() {
  const posts = await db.getPosts(10);
  const users = await db.getUsers();
  
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

## 🎯 Server Actions

```typescript
'use server';

import { db } from '@/lib/data/database';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  
  const newPost = await db.createPost({
    userId: '1', // Get from session
    title,
    routes: [],
    images: [],
    tags: [],
  });
  
  revalidatePath('/main');
  return newPost;
}

export async function likePost(postId: string, userId: string) {
  await db.createLike({
    postId,
    userId,
    type: 'like',
  });
  
  revalidatePath('/main');
}
```

## 📝 Adding New Mock Data

```typescript
// app/lib/data/mockData.ts

export const mockUsers: User[] = [
  ...existingUsers,
  {
    id: "5",
    userName: "newuser",
    firstName: "New",
    lastName: "User",
    email: "new@example.com",
    password: "password123",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=New",
    bio: "New user bio",
    followers: 0,
    following: [],
    likes: [],
    bookmarks: [],
    createdAt: new Date().toISOString(),
  },
];
```

## 🔧 Environment Variables

```env
# .env.local (Development)
# Leave empty to use Next.js API routes
# NEXT_PUBLIC_API_URL=/api

# .env.production (Production with external API)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 🚦 Error Handling

```typescript
try {
  const posts = await api.get<Post[]>(API_ENDPOINTS.POSTS);
  console.log(posts.data);
} catch (error) {
  console.error('Failed to fetch posts:', error);
  // Handle error (show toast, retry, etc.)
}
```

## 📊 Response Format

### Success Response
```json
{
  "data": [...],
  "status": 200
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 400
}
```

## 🎨 TypeScript Types

All types are globally available:
```typescript
// No imports needed!
const user: User = { ... };
const post: Post = { ... };
const comment: Comment = { ... };

// For API responses
import type { ApiResponse, PaginatedResponse } from '@/lib/types';
```

## 🧪 Testing API Routes

```bash
# Get all users
curl http://localhost:3000/api/users

# Get all posts
curl http://localhost:3000/api/posts

# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1",
    "title": "Test Post",
    "routes": [],
    "images": [],
    "tags": ["test"]
  }'

# Like a post
curl -X POST http://localhost:3000/api/posts/1/like \
  -H "Content-Type: application/json" \
  -d '{"userId": "1", "type": "like"}'

# Get post comments
curl http://localhost:3000/api/posts/1/comments
```

## 📖 Common Patterns

### Fetch and Display Posts
```typescript
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/utils/api';
import { API_ENDPOINTS } from '@/lib/constants';

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await api.get<Post[]>(API_ENDPOINTS.POSTS);
        setPosts(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);
  
  if (loading) return <Spin />;
  
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Create Post with Server Action
```typescript
// app/actions/posts.ts
'use server';

import { db } from '@/lib/data/database';

export async function createPost(data: Partial<Post>) {
  const newPost = await db.createPost({
    ...data,
    userId: '1', // Get from session
    likes: 0,
    dislikes: 0,
    comments: 0,
    bookmarks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  return newPost;
}

// Use in component
import { createPost } from '@/actions/posts';

async function handleSubmit(data: Partial<Post>) {
  const post = await createPost(data);
  console.log('Created:', post);
}
```

## 🔗 Related Documentation

- **Full Architecture**: `.github/mock-backend-architecture.md`
- **Migration Guide**: `.github/migration-summary.md`
- **Project Plan**: `.github/plan.md`
- **Type Definitions**: `app/lib/types/interfaces.ts`

---

**Happy Coding! 🚀**
