# PWA Offline/Online Experience - Implementation Guide

## Overview

The Along app now has comprehensive offline/online detection and handling to provide a seamless experience whether users are connected or not.

## Components Created

### 1. **useOnlineStatus Hook** (`app/lib/hooks/useOnlineStatus.ts`)

Tracks the browser's online/offline state and provides:

- `isOnline`: Boolean indicating current connection status
- `wasOffline`: Boolean that becomes true when connection is restored (for showing "back online" message)

### 2. **OfflineIndicator Component** (`app/components/features/pwa/OfflineIndicator.tsx`)

A smart banner system that:

- Shows a persistent orange banner when offline (can be dismissed)
- Shows a green "You're back online!" message when reconnected
- Automatically animates in/out
- Non-intrusive placement (below top navigation)

### 3. **OfflineGuard Component** (`app/components/features/pwa/OfflineGuard.tsx`)

Wraps interactive elements to handle offline state:

- Disables network-dependent actions when offline
- Shows tooltips explaining why actions are disabled
- Displays warning messages when users try offline actions

### 4. **Enhanced Service Worker** (`public/sw.js`)

Improved with:

- Better error handling (fixes the "Failed to fetch" errors)
- Cross-origin request filtering
- Improved caching strategies
- Graceful fallbacks for failed requests
- Offline response generation

## Usage Examples

### Basic Usage - Wrap Network-Dependent Actions

```tsx
import { OfflineGuard } from "@/components/features/pwa";

// Wrap a button that requires internet
<OfflineGuard requiresOnline message="You need to be online to like posts">
  <Button icon={<HeartOutlined />} onClick={handleLike}>
    Like
  </Button>
</OfflineGuard>;
```

### Usage in PostCard Component

```tsx
import { OfflineGuard } from "@/components/features/pwa";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

export function PostCard({ post, onLike, onComment, onShare }: Props) {
  const { isOnline } = useOnlineStatus();

  return (
    <Card>
      {/* Post content */}

      <div className="actions">
        {/* Like button - requires online */}
        <OfflineGuard
          requiresOnline
          message="You need to be online to like posts">
          <Button disabled={!isOnline} onClick={onLike}>
            Like
          </Button>
        </OfflineGuard>

        {/* Comment button - requires online */}
        <OfflineGuard requiresOnline message="You need to be online to comment">
          <Button disabled={!isOnline} onClick={onComment}>
            Comment
          </Button>
        </OfflineGuard>

        {/* Share button - works offline (uses native share) */}
        <Button onClick={onShare}>Share</Button>
      </div>
    </Card>
  );
}
```

### Usage in Feed Component

```tsx
import { OfflineGuard } from "@/components/features/pwa";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

export function Feed() {
  const { isOnline } = useOnlineStatus();

  const handleRefresh = async () => {
    if (!isOnline) {
      message.warning("You're offline. Showing cached content.");
      return;
    }
    // Fetch fresh data
  };

  return (
    <div>
      {/* Refresh button */}
      <OfflineGuard
        requiresOnline
        message="You need to be online to refresh the feed">
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          disabled={!isOnline}>
          Refresh Feed
        </Button>
      </OfflineGuard>

      {/* Posts */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Usage in ShareRouteModal

```tsx
import { OfflineGuard } from "@/components/features/pwa";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

export function ShareRouteModal({ open, onClose }: Props) {
  const { isOnline } = useOnlineStatus();

  const handleSubmit = async (data: Post) => {
    if (!isOnline) {
      message.error("You need to be online to share a route");
      return;
    }
    // Submit post
  };

  return (
    <Modal open={open} onCancel={onClose}>
      {/* Form fields */}

      <OfflineGuard
        requiresOnline
        message="You need to be online to share routes">
        <Button type="primary" onClick={handleSubmit} disabled={!isOnline}>
          Share Route
        </Button>
      </OfflineGuard>
    </Modal>
  );
}
```

## What Works Offline

✅ **Available Offline:**

- View cached feed posts
- Browse bookmarks (if previously loaded)
- View profile pages
- Read comments
- Navigate between pages
- View images (if previously cached)

❌ **Requires Online:**

- Liking/disliking posts or comments
- Creating new posts
- Commenting on posts
- Following users
- Updating profile
- Uploading images
- Searching

## Service Worker Caching Strategy

### Static Assets (Cache-First)

- Images, fonts, stylesheets, scripts
- Served from cache immediately, updated in background

### API Requests (Network-First)

- User data, posts, comments
- Tries network first, falls back to cache if offline

### Pages (Stale-While-Revalidate)

- HTML pages
- Shows cached version immediately, updates in background

## Testing Offline Mode

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Refresh page to test offline experience

### Production Testing

1. Install the PWA
2. Turn off WiFi/mobile data
3. Open the app
4. Verify cached content is accessible
5. Try network actions - should show appropriate feedback

## Console Errors - Fixed

The following errors have been resolved:

- ✅ "FetchEvent resulted in network error" - Now properly caught and handled
- ✅ "Failed to fetch" at sw.js:111 - Added error handling for all fetch requests
- ✅ Cross-origin request errors - Now filtered out in service worker

## Future Enhancements

- **Offline Queue**: Queue actions performed offline and sync when back online
- **Background Sync**: Automatically sync data in the background
- **Offline Drafts**: Save post drafts locally when offline
- **Smart Caching**: Cache user's bookmarks and followed users' posts automatically
