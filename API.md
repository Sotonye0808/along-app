# Along App API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens stored in httpOnly cookies.

### Token Management

- **Access Token**: Short-lived token (15 minutes) stored in httpOnly cookie
- **Refresh Token**: Long-lived token (7 days) used to obtain new access tokens

### Authentication Header

For requests that require authentication, the token is automatically included via cookies. No manual header configuration needed.

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning                                |
| ---- | -------------------------------------- |
| 200  | Success                                |
| 201  | Created                                |
| 400  | Bad Request - Invalid input            |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions   |
| 404  | Not Found                              |
| 409  | Conflict - Resource already exists     |
| 500  | Internal Server Error                  |

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "userName": "string (required, unique)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, unique, valid email)",
  "password": "string (required, min 8 characters)"
}
```

**Success Response:** `201 Created`

```json
{
  "data": {
    "user": {
      "id": "string",
      "userName": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "avatar": "string | null",
      "bio": "string | null",
      "createdAt": "string (ISO 8601)",
      "verified": false,
      "location": "string | null"
    },
    "message": "Registration successful. Please verify your account."
  }
}
```

**Error Responses:**

```json
// 400 Bad Request
{
  "error": "Validation failed",
  "message": "Email already exists"
}

// 400 Bad Request
{
  "error": "Validation failed",
  "message": "Username already exists"
}
```

---

### Login

Authenticate a user and receive access token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response:** `200 OK`

```json
{
  "data": {
    "user": {
      "id": "string",
      "userName": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "avatar": "string | null",
      "bio": "string | null",
      "followers": 0,
      "following": [],
      "likes": [],
      "bookmarks": [],
      "createdAt": "string",
      "verified": true,
      "location": "string | null"
    },
    "message": "Login successful"
  }
}
```

**Sets Cookies:**

- `accessToken`: JWT access token (httpOnly, secure)
- `refreshToken`: JWT refresh token (httpOnly, secure)

**Error Responses:**

```json
// 401 Unauthorized
{
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}

// 403 Forbidden
{
  "error": "Account not verified",
  "message": "Please verify your account"
}
```

---

### Verify OTP

Verify user account with OTP code.

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**

```json
{
  "email": "string (required)",
  "code": "string (required, 6 digits)"
}
```

**Success Response:** `200 OK`

```json
{
  "data": {
    "message": "Account verified successfully"
  }
}
```

**Error Responses:**

```json
// 400 Bad Request
{
  "error": "Invalid OTP",
  "message": "The OTP code is incorrect or expired"
}

// 404 Not Found
{
  "error": "User not found",
  "message": "No user with this email exists"
}
```

---

### Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Requires:** `refreshToken` cookie

**Success Response:** `200 OK`

```json
{
  "data": {
    "message": "Token refreshed successfully"
  }
}
```

**Sets Cookie:**

- `accessToken`: New JWT access token

**Error Response:**

```json
// 401 Unauthorized
{
  "error": "Invalid token",
  "message": "Refresh token is invalid or expired"
}
```

---

### Logout

End user session and clear tokens.

**Endpoint:** `POST /api/auth/logout`

**Requires:** Authentication

**Success Response:** `200 OK`

```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Clears Cookies:**

- `accessToken`
- `refreshToken`

---

## User Endpoints

### Get All Users

Retrieve list of all users.

**Endpoint:** `GET /api/users`

**Success Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "string",
      "userName": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "avatar": "string | null",
      "bio": "string | null",
      "followers": 0,
      "following": [],
      "createdAt": "string",
      "verified": true,
      "location": "string | null"
    }
  ]
}
```

---

### Get User by ID

Retrieve a specific user's profile.

**Endpoint:** `GET /api/users/:id`

**Parameters:**

- `id` (path): User ID

**Success Response:** `200 OK`

```json
{
  "data": {
    "id": "string",
    "userName": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "avatar": "string | null",
    "bio": "string | null",
    "followers": 0,
    "following": [],
    "likes": [],
    "bookmarks": [],
    "createdAt": "string",
    "verified": true,
    "location": "string | null"
  }
}
```

**Error Response:**

```json
// 404 Not Found
{
  "error": "User not found",
  "message": "No user with this ID exists"
}
```

---

### Update User

Update user profile information.

**Endpoint:** `PUT /api/users/:id`

**Requires:** Authentication (must be the user being updated)

**Parameters:**

- `id` (path): User ID

**Request Body:**

```json
{
  "userName": "string (optional)",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "bio": "string (optional)",
  "avatar": "string (optional, base64 or URL)",
  "location": "string (optional)"
}
```

**Success Response:** `200 OK`

```json
{
  "data": {
    "user": {
      /* Updated user object */
    },
    "message": "Profile updated successfully"
  }
}
```

**Error Responses:**

```json
// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "You can only update your own profile"
}

// 400 Bad Request
{
  "error": "Validation failed",
  "message": "Username already taken"
}
```

---

## Post Endpoints

### Get All Posts

Retrieve list of all posts.

**Endpoint:** `GET /api/posts`

**Query Parameters:**

- `userId` (optional): Filter posts by user ID
- `limit` (optional): Number of posts to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Success Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "string",
      "userId": "string",
      "title": "string",
      "routes": [
        {
          "id": "string",
          "text": "string",
          "links": [
            {
              "text": "string",
              "url": "string"
            }
          ],
          "order": 0,
          "vehicles": ["bus", "train"],
          "status": "verified",
          "fare": 100
        }
      ],
      "images": [],
      "tags": [],
      "likes": 0,
      "dislikes": 0,
      "comments": 0,
      "bookmarks": 0,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

---

### Get Post by ID

Retrieve a specific post.

**Endpoint:** `GET /api/posts/:id`

**Parameters:**

- `id` (path): Post ID

**Success Response:** `200 OK`

```json
{
  "data": {
    "id": "string",
    "userId": "string",
    "title": "string",
    "routes": [],
    "images": [],
    "tags": [],
    "likes": 0,
    "dislikes": 0,
    "comments": 0,
    "bookmarks": 0,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Response:**

```json
// 404 Not Found
{
  "error": "Post not found",
  "message": "No post with this ID exists"
}
```

---

### Create Post

Create a new post.

**Endpoint:** `POST /api/posts`

**Requires:** Authentication

**Request Body:**

```json
{
  "title": "string (required)",
  "routes": [
    {
      "text": "string (required)",
      "links": [
        {
          "text": "string",
          "url": "string"
        }
      ],
      "order": 0,
      "vehicles": ["bus", "train"],
      "fare": 100
    }
  ],
  "images": ["string (base64 or URL)"],
  "tags": ["string"]
}
```

**Success Response:** `201 Created`

```json
{
  "data": {
    /* Created post object */
  },
  "message": "Post created successfully"
}
```

**Error Response:**

```json
// 400 Bad Request
{
  "error": "Validation failed",
  "message": "Title and routes are required"
}
```

---

### Update Post

Update an existing post.

**Endpoint:** `PUT /api/posts/:id`

**Requires:** Authentication (must be post owner)

**Parameters:**

- `id` (path): Post ID

**Request Body:**

```json
{
  "title": "string (optional)",
  "routes": [] (optional),
  "images": [] (optional),
  "tags": [] (optional)
}
```

**Success Response:** `200 OK`

```json
{
  "data": {
    /* Updated post object */
  },
  "message": "Post updated successfully"
}
```

**Error Responses:**

```json
// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "You can only update your own posts"
}

// 404 Not Found
{
  "error": "Post not found"
}
```

---

### Delete Post

Delete a post.

**Endpoint:** `DELETE /api/posts/:id`

**Requires:** Authentication (must be post owner)

**Parameters:**

- `id` (path): Post ID

**Success Response:** `200 OK`

```json
{
  "data": {
    "message": "Post deleted successfully"
  }
}
```

**Error Responses:**

```json
// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "You can only delete your own posts"
}

// 404 Not Found
{
  "error": "Post not found"
}
```

---

### Like/Dislike Post

Like or dislike a post.

**Endpoint:** `POST /api/posts/:id/like`

**Requires:** Authentication

**Parameters:**

- `id` (path): Post ID

**Request Body:**

```json
{
  "type": "like | dislike"
}
```

**Success Response:** `200 OK`

```json
{
  "data": {
    "postId": "string",
    "userId": "string",
    "type": "like",
    "message": "Post liked successfully"
  }
}
```

---

### Get Post Comments

Get all comments for a post.

**Endpoint:** `GET /api/posts/:id/comments`

**Parameters:**

- `id` (path): Post ID

**Success Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "string",
      "postId": "string",
      "userId": "string",
      "text": "string",
      "createdAt": "string",
      "likes": 0,
      "dislikes": 0
    }
  ]
}
```

---

### Add Comment

Add a comment to a post.

**Endpoint:** `POST /api/posts/:id/comments`

**Requires:** Authentication

**Parameters:**

- `id` (path): Post ID

**Request Body:**

```json
{
  "text": "string (required)"
}
```

**Success Response:** `201 Created`

```json
{
  "data": {
    /* Created comment object */
  },
  "message": "Comment added successfully"
}
```

---

### Bookmark Post

Bookmark or unbookmark a post.

**Endpoint:** `POST /api/posts/:id/bookmark`

**Requires:** Authentication

**Parameters:**

- `id` (path): Post ID

**Success Response:** `200 OK`

```json
{
  "data": {
    "postId": "string",
    "userId": "string",
    "bookmarked": true,
    "message": "Post bookmarked successfully"
  }
}
```

---

## Notification Endpoints

### Get Notifications

Get user's notifications.

**Endpoint:** `GET /api/notifications`

**Requires:** Authentication

**Query Parameters:**

- `userId` (required): User ID
- `read` (optional): Filter by read status (true/false)

**Success Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "string",
      "userId": "string",
      "type": "like | comment | follow | mention",
      "message": "string",
      "postId": "string | null",
      "read": false,
      "createdAt": "string"
    }
  ]
}
```

---

### Mark Notification as Read

Mark a notification as read.

**Endpoint:** `PATCH /api/notifications/:id`

**Requires:** Authentication

**Parameters:**

- `id` (path): Notification ID

**Success Response:** `200 OK`

```json
{
  "data": {
    /* Updated notification object */
  },
  "message": "Notification marked as read"
}
```

---

### Delete Notification

Delete a notification.

**Endpoint:** `DELETE /api/notifications/:id`

**Requires:** Authentication

**Parameters:**

- `id` (path): Notification ID

**Success Response:** `200 OK`

```json
{
  "data": {
    "message": "Notification deleted successfully"
  }
}
```

---

### Subscribe to Push Notifications

Subscribe to push notifications.

**Endpoint:** `POST /api/notifications/subscribe`

**Requires:** Authentication

**Request Body:**

```json
{
  "endpoint": "string (required)",
  "keys": {
    "p256dh": "string (required)",
    "auth": "string (required)"
  }
}
```

**Success Response:** `200 OK`

```json
{
  "message": "Subscription saved successfully",
  "subscription": {
    /* Subscription object */
  }
}
```

---

### Unsubscribe from Push Notifications

Unsubscribe from push notifications.

**Endpoint:** `POST /api/notifications/unsubscribe`

**Requires:** Authentication

**Success Response:** `200 OK`

```json
{
  "message": "Subscription removed successfully"
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Anonymous requests**: 60 requests per hour
- **Authenticated requests**: 300 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1640000000
```

---

## Webhooks (Future)

_Webhook support planned for future releases_

---

## SDK/Client Libraries

### JavaScript/TypeScript

```typescript
import { api } from '@/lib/utils/api';

// Get all posts
const posts = await api.get<Post[]>('/posts');

// Create a post
const newPost = await api.post<Post>('/posts', {
  title: 'My Route',
  routes: [...],
});

// Update user profile
const user = await api.put<User>(`/users/${userId}`, {
  bio: 'Updated bio',
});
```

---

## Changelog

### v1.0.0 (Current)

- Initial API release
- Authentication endpoints
- User management
- Post CRUD operations
- Comments and likes
- Notifications
- Push notification subscriptions

---

## Support

For API support:

- GitHub Issues: [Report bugs or request features](https://github.com/Sotonye0808/along-app/issues)
- Documentation: See [Project Context](.github/project-context.md)

---

## License

API access is subject to the application's terms of service.
