# Quick Reference: Adding Offline Support to Components

## 1️⃣ Import the Tools

```tsx
import { OfflineGuard } from "@/components/features/pwa";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
```

## 2️⃣ Get Online Status

```tsx
const { isOnline, wasOffline } = useOnlineStatus();
```

## 3️⃣ Wrap Network-Dependent Actions

### Basic Button Protection

```tsx
<OfflineGuard
  requiresOnline
  message="You need to be online to perform this action">
  <Button onClick={handleAction}>Do Something</Button>
</OfflineGuard>
```

### With Disabled State

```tsx
<OfflineGuard requiresOnline message="You need to be online to like posts">
  <Button
    disabled={!isOnline}
    onClick={handleLike}
    icon={isLiked ? <LikeFilled /> : <LikeOutlined />}>
    {post.likes}
  </Button>
</OfflineGuard>
```

### Multiple Actions in a Group

```tsx
<Space>
  <OfflineGuard requiresOnline message="You need to be online to like">
    <Button disabled={!isOnline} onClick={onLike}>
      Like
    </Button>
  </OfflineGuard>

  <OfflineGuard requiresOnline message="You need to be online to comment">
    <Button disabled={!isOnline} onClick={onComment}>
      Comment
    </Button>
  </OfflineGuard>

  {/* Share works offline using native API */}
  <Button onClick={onShare}>Share</Button>
</Space>
```

## 4️⃣ Function-Level Checks

```tsx
const handleSubmit = async () => {
  // Check if online
  if (!isOnline) {
    message.warning(
      "You're offline. This action requires an internet connection."
    );
    return;
  }

  // Proceed with network request
  try {
    await api.post("/posts", data);
    message.success("Post created!");
  } catch (error) {
    message.error("Failed to create post");
  }
};
```

## 5️⃣ Conditional UI Rendering

```tsx
{
  isOnline ? (
    <Button type="primary" onClick={handleRefresh}>
      Refresh Feed
    </Button>
  ) : (
    <Button type="default" disabled>
      Offline - Showing Cached Content
    </Button>
  );
}
```

## 6️⃣ Show Offline Status in Components

```tsx
export function Feed() {
  const { isOnline } = useOnlineStatus();

  return (
    <div>
      {!isOnline && (
        <Alert
          message="You're viewing cached content"
          description="Connect to the internet to see new posts"
          type="info"
          showIcon
          closable
        />
      )}

      {/* Feed content */}
    </div>
  );
}
```

## 7️⃣ Modal/Form Submission

```tsx
export function ShareRouteModal({ open, onClose }) {
  const { isOnline } = useOnlineStatus();

  const handleSubmit = async (values) => {
    if (!isOnline) {
      message.error("You need to be online to share a route");
      return;
    }

    await submitPost(values);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <OfflineGuard
          key="submit"
          requiresOnline
          message="You need to be online to share routes">
          <Button type="primary" disabled={!isOnline} onClick={handleSubmit}>
            Share Route
          </Button>
        </OfflineGuard>,
      ]}>
      {/* Form fields */}
    </Modal>
  );
}
```

## 8️⃣ API Calls with Feedback

```tsx
const fetchData = async () => {
  if (!isOnline) {
    message.info("You're offline. Showing cached data.");
    // Load from local state/cache
    return cachedData;
  }

  try {
    const response = await api.get("/posts");
    return response.data;
  } catch (error) {
    message.error("Failed to fetch data");
    // Fallback to cache
    return cachedData;
  }
};
```

## 🎯 Quick Tips

✅ **Always disable** buttons that require network when offline
✅ **Provide feedback** - Tell users why they can't perform an action
✅ **Use tooltips** - OfflineGuard automatically shows helpful tooltips
✅ **Test thoroughly** - Use Chrome DevTools offline mode
✅ **Consider alternatives** - Some features can work offline (like native share)

❌ **Don't block** everything - Let users browse cached content
❌ **Don't hide** offline actions - Show them disabled with explanations
❌ **Don't be silent** - Always provide feedback for attempted offline actions

## 🚀 Common Patterns

### Like/Dislike Actions

```tsx
<OfflineGuard requiresOnline message="You need to be online to like posts">
  <Button
    disabled={!isOnline}
    icon={
      isLiked ? <LikeFilled style={{ color: "#00623B" }} /> : <LikeOutlined />
    }
    onClick={onLike}>
    {post.likes}
  </Button>
</OfflineGuard>
```

### Comment Actions

```tsx
<OfflineGuard requiresOnline message="You need to be online to comment">
  <Button disabled={!isOnline} icon={<CommentOutlined />} onClick={onComment}>
    {post.comments}
  </Button>
</OfflineGuard>
```

### Follow Actions

```tsx
<OfflineGuard requiresOnline message="You need to be online to follow users">
  <Button
    type={isFollowing ? "default" : "primary"}
    disabled={!isOnline}
    onClick={handleFollow}>
    {isFollowing ? "Following" : "Follow"}
  </Button>
</OfflineGuard>
```

### Refresh Actions

```tsx
<OfflineGuard requiresOnline message="You need to be online to refresh">
  <Button
    icon={<ReloadOutlined />}
    disabled={!isOnline}
    onClick={handleRefresh}>
    Refresh
  </Button>
</OfflineGuard>
```

## 📋 Checklist for New Components

When creating a component with network actions:

- [ ] Import `useOnlineStatus` hook
- [ ] Get `isOnline` state
- [ ] Wrap network buttons with `<OfflineGuard>`
- [ ] Add `disabled={!isOnline}` to buttons
- [ ] Add offline checks in async functions
- [ ] Provide user feedback for offline attempts
- [ ] Test with DevTools offline mode
- [ ] Consider what can work offline

That's it! You're ready to add offline support to any component! 🎉
