# Profile Components

This directory contains components for user profile functionality.

## Components

### `UserProfile`

Main profile view component that displays user information, posts, and comments.

**Props:**

- `user`: User object to display
- `isOwnProfile`: Boolean indicating if viewing own profile
- `posts`: Array of user's posts
- `comments`: Array of user's comments
- `currentUserId`: ID of currently logged-in user
- `onEditProfile`: Callback for edit profile action
- `onFollow`: Callback for follow/unfollow action
- `isFollowing`: Boolean indicating follow status
- Post interaction handlers (like, dislike, comment, bookmark, share, edit, delete)
- `userInteractions`: Object containing sets of liked, disliked, and bookmarked post IDs

**Features:**

- Profile header with avatar, name, username, and verification badge
- Bio and location display
- User stats (posts count, followers, following)
- Edit profile button (for own profile)
- Follow/Unfollow button (for other users)
- Share profile link
- Tabbed interface for posts and comments
- Empty states when no content
- Responsive design

### `EditProfileModal`

Modal dialog for editing user profile information.

**Props:**

- `open`: Boolean to control modal visibility
- `onClose`: Callback to close modal
- `user`: Current user object
- `onSave`: Async callback to save profile updates

**Features:**

- Avatar upload with preview (base64 conversion for mock backend)
- Image validation (type and size < 2MB)
- Form fields:
  - Profile picture
  - First name (required, min 2 chars)
  - Last name (required, min 2 chars)
  - Username (required, min 3 chars, alphanumeric + underscore)
  - Bio (optional, max 160 chars with counter)
  - Location (optional, max 50 chars)
- Form validation with error messages
- Loading state during save
- Success/error notifications

## Usage

### Profile Page

```tsx
import { UserProfile, EditProfileModal } from "@/components/features/profile";

function ProfilePage() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { user } = useAuth();

  const handleUpdateProfile = async (userData: Partial<User>) => {
    await api.put(`/api/users/${user.id}`, userData);
  };

  return (
    <>
      <UserProfile
        user={user}
        isOwnProfile={true}
        posts={posts}
        comments={comments}
        currentUserId={user.id}
        onEditProfile={() => setEditModalOpen(true)}
        // ... other handlers
      />

      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        onSave={handleUpdateProfile}
      />
    </>
  );
}
```

## Styling

### Custom Classes

- Uses Ant Design components with custom Along theme
- Along Green (`#00623B`) for primary actions
- Tailwind CSS for layout and custom styling
- Responsive breakpoints for mobile/desktop views

### Tab Styling

Profile tabs can be customized with the `.profile-tabs` class in global CSS if needed.

## Integration

### Data Flow

1. **Profile Page** fetches user data, posts, and comments
2. **UserProfile** displays the data and handles UI interactions
3. **EditProfileModal** handles profile updates
4. Updates are sent to API and local state is refreshed

### API Endpoints Used

- `GET /api/users/:id` - Fetch user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/posts` - Fetch posts (filtered by user)
- `GET /api/posts/:id/comments` - Fetch comments per post

### State Management

- Local state for user data, posts, comments
- User interactions tracked in Set objects
- Auth context provides current user info
- Optimistic UI updates for better UX

## Features Implemented

- ✅ View own profile with complete information
- ✅ Edit profile (name, username, bio, location)
- ✅ Change profile picture (base64 upload)
- ✅ View own posts in tabbed interface
- ✅ View own comments with post context
- ✅ Profile stats (posts, followers, following)
- ✅ Share profile link (copy to clipboard)
- ✅ Responsive mobile/desktop layouts
- ✅ Form validation and error handling
- ✅ Loading and empty states
- ✅ Integration with post interactions

## Future Enhancements

- View other users' profiles (not just own profile)
- Edit/delete comments from profile
- Filter posts by tags or date
- Follower/following lists
- Profile themes or customization
- Activity timeline
- Stats and analytics
