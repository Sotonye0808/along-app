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

### Mock Backend Structure
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

## Known Limitations (Current)
- Mock backend (no persistence)
- Limited real-time features
- No image optimization service
- No CDN for static assets
- No advanced search capabilities

## Glossary
- **Route**: A series of connected destinations/stops
- **Stop**: A single location in a route
- **Post**: User-generated content containing routes
- **Feed**: Stream of posts from followed users
- **Suggestion**: Trending or recommended content
- **Along**: The platform name (means "alongside transportation routes")