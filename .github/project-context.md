# Along App - Project Context

## Project Vision

Along is a social platform for sharing travel routes and destination experiences. Users can create multi-stop route posts, share recommendations, and discover new places through community engagement.

## Core Features

### 1. Route Sharing

- **Multi-stop Routes**: Users can create posts with multiple connected destinations
- **Rich Content**: Support for text, images, links, and formatting
- **Tags**: Categorize routes by type, location, or theme
- **Draft System**: Save work in progress

### 2. Social Interaction

- **Engagement**: Like, dislike, comment, and share posts
- **Discovery**: Explore trending routes and suggestions
- **Bookmarks**: Save favorite routes for later
- **Following**: Connect with other travelers

### 3. User Experience

- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Instant notifications and interactions
- **Search**: Find routes by location, tags, or content
- **Personalization**: Customized feed based on interests

## Technical Architecture

### Frontend Stack

- **Next.js 15+**: App Router for modern React patterns
- **TypeScript**: Type-safe development
- **Ant Design**: Comprehensive UI component library
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client with interceptors

### Authentication

- **JWT Tokens**: Access and refresh token pattern
- **Cookie Storage**: Secure httpOnly cookies
- **Token Refresh**: Automatic token renewal
- **Protected Routes**: Middleware-based route protection

### State Management

- **React Context**: Global state (auth, theme)
- **Server State**: Server Components + Server Actions
- **Local State**: Component-level with hooks

### PWA Features

- **Offline Support**: Caching strategies
- **Installable**: Add to home screen
- **Push Notifications**: Real-time updates

### Data Flow

```
User Action → Server Action/API Route → Mock Backend → Response
           ↓
    Update UI (optimistic) → Revalidate → Final State
```

### Mock Backend Structure (Current)

```json
{
  "users": [...],
  "posts": [...],
  "comments": [...],
  "likes": [...],
  "bookmarks": [...],
  "notifications": [...]
}
```

### Production Database Architecture (Phase 8)

#### Database Stack

- **ORM**: Prisma (v5.x)
- **Database**: PostgreSQL (14+)
- **Caching**: Redis (Upstash)
- **File Storage**: Cloudinary

#### Database Models

**User Model**

- Fields: id, userName (unique), firstName, lastName, email (unique), password (bcrypt), avatar (Cloudinary URL), bio, location, verified, timestamps
- Relations: posts (1:n), comments (1:n), likes (1:n), bookmarks (1:n), following (m:n), followers (m:n)
- Indexes: userName, email, createdAt

**Follow Model** (Self-referential many-to-many)

- Fields: id, followerId, followingId, createdAt
- Relations: follower → User, following → User
- Unique: [followerId, followingId]
- Indexes: followerId, followingId, createdAt

**Post Model**

- Fields: id, userId, title, routes (JSON), images[] (Cloudinary URLs), tags[], likes, dislikes, comments, bookmarks, views, timestamps
- Relations: user (n:1), comments (1:n), likes (1:n), bookmarks (1:n)
- Indexes: userId, createdAt (DESC), tags
- Full-text: title

**Comment Model**

- Fields: id, postId, userId, text, likes, dislikes, timestamps
- Relations: post (n:1), user (n:1), likes (1:n)
- Cascade: Delete with post
- Indexes: postId, userId, createdAt

**Like Model**

- Fields: id, postId, userId, type (LIKE/DISLIKE), createdAt
- Relations: post (n:1), user (n:1)
- Unique: [postId, userId]
- Indexes: postId, userId, createdAt

**Bookmark Model**

- Fields: id, postId, userId, createdAt
- Relations: post (n:1), user (n:1)
- Unique: [postId, userId]
- Indexes: userId, createdAt

**Notification Models**

- Notification: id, type (LIKE/COMMENT/FOLLOW/MENTION), actorId, postId, commentId, message, createdAt
- NotificationRecipient: id, notificationId, userId, read, createdAt
- Indexes: createdAt (DESC), [userId, read]

**UserActivity Model** (For feed algorithm)

- Fields: id, userId, type (VIEW/LIKE/COMMENT/BOOKMARK/SHARE), postId, tagId, score, createdAt
- Purpose: Track user behavior for personalization
- Indexes: [userId, createdAt], type

#### Algorithms

**Personalized Feed Algorithm**

- Scoring System:
  - 40% weight: Local posts (same location as user)
  - 30% weight: Posts from followed users
  - 20% weight: Posts matching user's favorite tags
  - 10% weight: Trending posts
- Sorting: Location proximity, recency, engagement
- Pagination: Cursor-based for infinite scroll
- Caching: 5-minute TTL per user
- Enrichment: Includes user interaction state (isLiked, isBookmarked)

**Trending Algorithm**

- Formula: `(likes + comments×2 + bookmarks×1.5) / age_in_hours`
- Filters: Posts from last 7 days only
- Purpose: Discover page content
- Cache: 10-minute TTL

**Search Algorithm**

- Multi-category: Users, Posts, Tags
- User Ranking:
  - Verified users first
  - Then by follower count
  - Case-insensitive matching on username, firstName, lastName
- Post Ranking:
  - Full-text search on title
  - Location proximity
  - Tag matching
  - Sort by likes and recency
- Tag Ranking: By frequency of use

**User Suggestions Algorithm**

- Scoring System (max 100 points):
  - Location proximity: 40 points (exact match) or 20 points (similar)
  - Similar interests via tags: 30 points (7.5 per common tag, max 4)
  - Mutual connections: 20 points (5 per mutual, max 4)
  - Verified status: 10 points
- Returns: Top 5 scored users
- Cache: 30-minute TTL
- Excludes: Already following, self

#### Caching Strategy

**Cache Keys**

- User feed: `feed:{userId}:{cursor}`
- User profile: `user:{userId}`
- Post: `post:{postId}`
- Trending posts: `trending:posts`
- User suggestions: `suggestions:{userId}`

**Cache TTLs**

- Feed: 5 minutes
- Profile: 10 minutes
- Post: 15 minutes
- Trending: 10 minutes
- Suggestions: 30 minutes

**Invalidation**

- On post creation: Clear user's feed cache
- On profile update: Clear user cache
- On like/comment: Don't invalidate (eventual consistency)
- On follow: Clear suggestions cache

#### Rate Limiting

**IP-based Limits** (General)

- 100 requests per minute
- Applied to all unauthenticated requests

**User-based Limits**

- 300 requests per minute (authenticated)
- 10 post creations per hour
- 50 comments per hour
- 200 likes per hour

**Implementation**

- Redis-based sliding window
- Returns: remaining count and reset time
- Response: 429 Too Many Requests with Retry-After header

#### Image Management

**Cloudinary Integration**

- Upload folders: `along/avatars`, `along/posts`
- Transformations:
  - Avatars: 400×400, crop fill, face gravity, auto quality
  - Posts: 1200px width limit, auto quality, auto format
- Allowed formats: jpg, png, webp
- Max file size: 5MB
- Storage: Public IDs stored in database
- Cleanup: Delete from Cloudinary on post/user deletion

**Image Operations**

- Upload: Convert to base64 → Cloudinary API → Store URL
- Update: Delete old image → Upload new → Update URL
- Delete: Extract public ID → Cloudinary destroy API
- Validation: Client-side (type, size) + server-side

#### Performance Optimizations

**Database**

- Indexes on frequently queried fields
- Composite indexes for complex queries
- Connection pooling (Prisma default)
- Only select needed fields
- Batch queries where possible
- Full-text search on posts.title

**Caching**

- Redis for frequently accessed data
- Cache-aside pattern (check cache → DB → set cache)
- Invalidate on writes
- Short TTLs to balance freshness and performance

**Pagination**

- Cursor-based (not offset-based)
- Consistent performance at any page depth
- Works with infinite scroll
- Returns next cursor for client

**API Response**

- Gzip compression
- Minimal payloads (select only needed fields)
- Paginated results (20 items default)
- HTTP caching headers

## Design System

### Color Palette

- **Primary**: `#00623B` (Along Green)
- **Success**: `#a4f4e7`
- **Warning**: `#f4c790`
- **Error**: `#e4626f`
- **Neutrals**: Gray scale from 100-500
- **Base**: White `#f7f7f7`, Black `#232323`

### Typography

- **Primary Font**: Inter
- **Fallbacks**: Roboto, System UI
- **Scale**: Tailwind default scale

### Spacing

- Consistent use of Tailwind spacing utilities
- 8px base unit

### Components

- Ant Design components as foundation
- Custom styling with Tailwind
- Consistent border radius, shadows
- Smooth transitions and animations

## User Flows

### Registration Flow

1. User enters registration details
2. Backend validates and creates account
3. OTP sent to email/phone
4. User verifies OTP
5. Redirect to dashboard

### Post Creation Flow

1. User clicks "Share a route"
2. Modal opens with route builder
3. Add stops (text, images, links)
4. Apply formatting and tags
5. Preview and publish
6. Post appears in feed

### Feed Interaction Flow

1. User scrolls feed
2. Sees posts with routes
3. Can like/dislike/comment
4. Can bookmark for later
5. Can share to other platforms
6. Can view user profile

## API Endpoints (Mock)

### Authentication

- `POST /register` - Create new user
- `POST /login` - Authenticate user
- `POST /verify-otp` - Verify OTP code
- `POST /refresh-token` - Refresh access token
- `POST /logout` - End session

### Posts

- `GET /posts` - List posts (paginated)
- `GET /posts/:id` - Get single post
- `POST /posts` - Create post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

### Interactions

- `POST /posts/:id/like` - Like post
- `POST /posts/:id/dislike` - Dislike post
- `POST /posts/:id/comments` - Add comment
- `POST /posts/:id/bookmark` - Bookmark post
- `POST /posts/:id/share` - Share post

### User

- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update profile
- `GET /users/:id/posts` - Get user's posts
- `GET /users/:id/bookmarks` - Get bookmarks

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent fixes
- Branches with feature, bugfix, or hotfix prefixes should be based off develop and merged back into develop, then into main via PR.
- Branches other than main and develop should be deleted after merging.

### Code Review Process

1. Create feature branch
2. Implement changes
3. Write/update tests
4. Create pull request
5. Code review
6. Address feedback
7. Merge to develop

### Deployment

- Automatic preview deployments (Vercel)
- Staging environment for testing
- Production deployment from main branch

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 200KB (initial)

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Accessibility Standards

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels
- Focus management

## Security Considerations

- XSS protection
- CSRF tokens
- Secure cookie settings
- Input sanitization
- Rate limiting
- SQL injection prevention (when using real DB)

## Future Enhancements

- Real-time chat
- Map integration
- Route planning tools
- Travel expense tracking
- Group travel features
- Mobile app (React Native)
- PWA support
- Offline mode

## Known Limitations (Current - Phase 7)

- Mock backend (no persistence across restarts)
- Limited real-time features
- No image optimization service
- No CDN for static assets
- No advanced search capabilities

## Upcoming (Phase 8 - Database Integration)

- PostgreSQL database with Prisma ORM
- Cloudinary for image management
- Redis caching layer
- Intelligent feed and search algorithms
- Rate limiting and security hardening
- Production-ready infrastructure

## Glossary

- **Route**: A series of connected destinations/stops
- **Stop**: A single location in a route
- **Post**: User-generated content containing routes
- **Feed**: Stream of posts from followed users
- **Suggestion**: Trending or recommended content
- **Along**: The platform name (means "alongside transportation routes")
