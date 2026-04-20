# Components Documentation

This directory contains all React components organized by purpose.

## Directory Structure

```
components/
├── features/           # Feature-specific components
│   ├── auth/          # Authentication components
│   ├── dashboard/     # Dashboard components
│   ├── navigation/    # Navigation components
│   ├── posts/         # Post-related components
│   ├── profile/       # Profile components
│   └── pwa/           # PWA components
└── ui/                # Reusable UI components
```

## Feature Components

### Authentication (`features/auth/`)

#### LoginForm

Email and password login form with validation.

**Props:**

```typescript
interface LoginFormProps {
  onSuccess?: () => void;
}
```

**Usage:**

```tsx
import { LoginForm } from "@/app/components/features/auth";

<LoginForm onSuccess={() => router.push("/home")} />;
```

**Features:**

- Email/password validation
- Error handling
- Loading states
- Redirect after login

---

#### RegisterForm

User registration form with validation.

**Props:**

```typescript
interface RegisterFormProps {
  onSuccess?: (email: string) => void;
}
```

**Usage:**

```tsx
import { RegisterForm } from "@/app/components/features/auth";

<RegisterForm onSuccess={(email) => router.push(`/otp?email=${email}`)} />;
```

**Features:**

- Multi-field validation
- Password strength indicator
- Username availability check
- Email format validation

---

#### OtpForm

OTP verification form for account activation.

**Props:**

```typescript
interface OtpFormProps {
  email: string;
  onSuccess?: () => void;
}
```

**Usage:**

```tsx
import { OtpForm } from "@/app/components/features/auth";

<OtpForm email="user@example.com" onSuccess={() => router.push("/login")} />;
```

**Features:**

- 6-digit OTP input
- Auto-focus on fields
- Resend OTP functionality
- Countdown timer

---

### Navigation (`features/navigation/`)

#### DesktopTopBar

Top navigation bar for desktop view.

**Usage:**

```tsx
import { DesktopTopBar } from "@/app/components/features/navigation";

<DesktopTopBar />;
```

**Features:**

- Search functionality
- User menu dropdown
- Notifications icon
- Theme toggle
- Responsive design

---

#### MobileTopBar

Top navigation bar for mobile view.

**Usage:**

```tsx
import { MobileTopBar } from "@/app/components/features/navigation";

<MobileTopBar />;
```

**Features:**

- Hamburger menu
- Search button
- User profile link
- Mobile-optimized

---

#### DashboardNavbar

Left sidebar navigation for dashboard.

**Usage:**

```tsx
import { DashboardNavbar } from "@/app/components/features/navigation";

<DashboardNavbar />;
```

**Features:**

- Navigation links
- Active route highlighting
- Mobile bottom navigation
- Dark mode support

---

#### SearchBar

Global search component with live results.

**Props:**

```typescript
interface SearchBarProps {
  placeholder?: string;
  onResultClick?: (result: SearchResult) => void;
}
```

**Usage:**

```tsx
import { SearchBar } from "@/app/components/features/navigation";

<SearchBar
  placeholder="Search routes, users..."
  onResultClick={(result) => router.push(result.link)}
/>;
```

**Features:**

- Debounced search (300ms)
- Categorized results (Users, Posts, Tags)
- Keyboard navigation
- Click-outside to close
- Loading states

---

#### ScrollToTop

Floating button to scroll to top of page.

**Usage:**

```tsx
import { ScrollToTop } from "@/app/components/features/navigation";

<ScrollToTop />;
```

**Features:**

- Shows after 500px scroll
- Smooth scroll animation
- Tooltip on hover
- Mobile-friendly positioning

---

### Dashboard (`features/dashboard/`)

#### Feed

Main feed component displaying posts.

**Usage:**

```tsx
import { Feed } from "@/app/components/features/dashboard";

<Feed />;
```

**Features:**

- Infinite scroll
- New posts notification
- Loading skeletons
- Empty state
- Pull to refresh

---

#### SuggestionsPanel

User suggestions based on location and activity.

**Usage:**

```tsx
import { SuggestionsPanel } from "@/app/components/features/dashboard";

<SuggestionsPanel />;
```

**Features:**

- Intelligent scoring algorithm
- Location-based suggestions
- Activity-based suggestions
- Follow/unfollow functionality

---

### Posts (`features/posts/`)

#### PostCard

Display a single post with all interactions.

**Props:**

```typescript
interface PostCardProps {
  post: Post;
  user?: User;
  onUpdate?: () => void;
}
```

**Usage:**

```tsx
import { PostCard } from "@/app/components/features/posts";

<PostCard post={post} user={author} onUpdate={() => refetch()} />;
```

**Features:**

- Like/dislike with toggle
- Comment section
- Bookmark functionality
- Share options
- Edit/delete for owners
- Image gallery
- Route display

---

#### ShareRouteModal

Modal for creating/editing posts.

**Props:**

```typescript
interface ShareRouteModalProps {
  visible: boolean;
  onClose: () => void;
  editPost?: Post;
  onSuccess?: () => void;
}
```

**Usage:**

```tsx
import { ShareRouteModal } from "@/app/components/features/posts";

<ShareRouteModal
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  editPost={postToEdit}
  onSuccess={() => refetch()}
/>;
```

**Features:**

- Multi-stop route builder
- Rich text formatting
- Image upload (base64)
- Tag management
- Link insertion
- Vehicle selection
- Draft saving
- Edit mode

---

#### CommentSection

Display and add comments on posts.

**Props:**

```typescript
interface CommentSectionProps {
  postId: string;
  comments: PostComment[];
  onCommentAdded?: () => void;
}
```

**Usage:**

```tsx
import { CommentSection } from "@/app/components/features/posts";

<CommentSection
  postId={post.id}
  comments={comments}
  onCommentAdded={() => refetchComments()}
/>;
```

**Features:**

- Add new comments
- Like/dislike comments
- Delete own comments
- User avatars
- Timestamp display

---

### Profile (`features/profile/`)

#### ProfileHeader

User profile header with avatar and info.

**Props:**

```typescript
interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
  onEdit?: () => void;
}
```

**Usage:**

```tsx
import { ProfileHeader } from "@/app/components/features/profile";

<ProfileHeader
  user={user}
  isOwnProfile={currentUser?.id === user.id}
  onEdit={() => setEditMode(true)}
/>;
```

**Features:**

- Avatar display
- Bio information
- Stats (followers, posts)
- Edit button for own profile
- Follow/unfollow for others

---

#### EditProfileModal

Modal for editing user profile.

**Props:**

```typescript
interface EditProfileModalProps {
  visible: boolean;
  user: User;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Usage:**

```tsx
import { EditProfileModal } from "@/app/components/features/profile";

<EditProfileModal
  visible={isEditing}
  user={user}
  onClose={() => setIsEditing(false)}
  onSuccess={() => refetch()}
/>;
```

**Features:**

- Avatar upload
- Bio editing
- Location update
- Username/name editing
- Validation

---

### PWA (`features/pwa/`)

#### InstallPrompt

Prompt users to install the app.

**Usage:**

```tsx
import { InstallPrompt } from "@/app/components/features/pwa";

<InstallPrompt />;
```

**Features:**

- Detects beforeinstallprompt event
- Custom modal UI
- Benefits list
- Dismissal tracking (7 days)
- Install state detection

---

#### NotificationSettings

Manage push notification preferences.

**Usage:**

```tsx
import { NotificationSettings } from "@/app/components/features/pwa";

<NotificationSettings />;
```

**Features:**

- Permission request
- Subscribe/unsubscribe toggle
- Browser support detection
- Instructions for blocked permissions
- Notification type list

---

## UI Components

### Button (Ant Design)

Use Ant Design Button component with custom styling.

**Usage:**

```tsx
import { Button } from "antd";

<Button type="primary" size="large" className="bg-[#00623B] hover:bg-[#004d2e]">
  Click Me
</Button>;
```

---

### Card (Ant Design)

Use Ant Design Card component with custom styling.

**Usage:**

```tsx
import { Card } from "antd";

<Card title="Title" className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
  Content
</Card>;
```

---

### Input (Ant Design)

Use Ant Design Input components.

**Usage:**

```tsx
import { Input } from "antd";

<Input placeholder="Enter text" size="large" className="dark:bg-gray-800" />;
```

---

## Component Patterns

### Server Components

Use for data fetching and static content:

```tsx
// app/posts/[id]/page.tsx
export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await fetchPost(params.id);
  return <PostDetail post={post} />;
}
```

### Client Components

Use for interactivity and hooks:

```tsx
"use client";

import { useState } from "react";

export function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Compound Components

For complex, composable components:

```tsx
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Render Props

For flexible component logic:

```tsx
<DataProvider>
  {({ data, loading }) => (loading ? <Spinner /> : <DataDisplay data={data} />)}
</DataProvider>
```

---

## Styling Guidelines

### Tailwind CSS

Use utility classes for styling:

```tsx
<div className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
  <Avatar src={user.avatar} />
  <div className="flex-1">
    <h3 className="text-lg font-semibold">{user.name}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
  </div>
</div>
```

### Ant Design Theming

Combine with Tailwind for custom styling:

```tsx
<Button type="primary" className="w-full bg-[#00623B] hover:bg-[#004d2e]">
  Submit
</Button>
```

### Dark Mode

Use `dark:` prefix for dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content
</div>
```

---

## Performance Optimization

### Code Splitting

Use dynamic imports for heavy components:

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### Memoization

Prevent unnecessary re-renders:

```tsx
import { memo } from "react";

export const PostCard = memo(function PostCard({ post }: PostCardProps) {
  return <div>{/* Component JSX */}</div>;
});
```

### useMemo and useCallback

Optimize expensive calculations and callbacks:

```tsx
const sortedPosts = useMemo(() => {
  return posts.sort((a, b) => b.likes - a.likes);
}, [posts]);

const handleLike = useCallback(() => {
  likePost(postId);
}, [postId]);
```

---

## Accessibility

### ARIA Labels

```tsx
<button aria-label="Like post">
  <HeartIcon />
</button>
```

### Keyboard Navigation

```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === "Enter" && handleClick()}
  onClick={handleClick}>
  Click me
</div>
```

### Focus Management

```tsx
useEffect(() => {
  inputRef.current?.focus();
}, []);
```

---

## Testing Components

### Unit Tests

```tsx
import { render, screen } from "@testing-library/react";
import { PostCard } from "./PostCard";

test("renders post title", () => {
  render(<PostCard post={mockPost} />);
  expect(screen.getByText("Post Title")).toBeInTheDocument();
});
```

### Integration Tests

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { PostCard } from "./PostCard";

test("likes post when like button clicked", async () => {
  render(<PostCard post={mockPost} />);
  fireEvent.click(screen.getByLabelText("Like post"));
  await waitFor(() => {
    expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
  });
});
```

---

## Resources

- [Ant Design Components](https://ant.design/components/overview/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Best Practices](https://react.dev/learn)
