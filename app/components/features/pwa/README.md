# PWA Features - Along App

This directory contains components and utilities for Progressive Web App (PWA) features.

## Components

### InstallPrompt

A modal component that prompts users to install the Along app on their device.

**Features:**

- Detects `beforeinstallprompt` event
- Shows custom install UI after 3 seconds
- Remembers if user dismissed (waits 7 days before showing again)
- Handles install completion and app installed state
- Mobile-friendly design with benefits list

**Usage:**

```tsx
import { InstallPrompt } from "@/app/components/features/pwa";

// Add to your layout
<InstallPrompt />;
```

### NotificationSettings

A settings card for managing push notification preferences.

**Features:**

- Checks browser support for push notifications
- Requests notification permission
- Subscribes/unsubscribes to push notifications
- Saves subscription to server
- Shows permission status and instructions
- Lists notification types user will receive

**Usage:**

```tsx
import { NotificationSettings } from "@/app/components/features/pwa";

// Add to your settings/notifications page
<NotificationSettings />;
```

## Utilities

### Service Worker Registration (`/lib/utils/sw-register.ts`)

Handles service worker lifecycle management.

**Functions:**

- `registerServiceWorker()` - Register the service worker
- `unregisterServiceWorker()` - Unregister all service workers
- `isServiceWorkerActive()` - Check if service worker is active
- `sendMessageToSW(message)` - Send messages to service worker
- `clearAllCaches()` - Clear all cached data

**Usage:**

```typescript
import { registerServiceWorker } from "@/lib/utils/sw-register";

// Register on app load
registerServiceWorker().then(({ success, registration }) => {
  if (success) {
    console.log("Service worker registered");
  }
});
```

### Push Notifications (`/lib/utils/push-notifications.ts`)

Manages push notification subscriptions and permissions.

**Functions:**

- `isPushNotificationSupported()` - Check browser support
- `getNotificationPermission()` - Get current permission status
- `requestNotificationPermission()` - Request permission
- `subscribeToPushNotifications(vapidKey)` - Subscribe to push
- `unsubscribeFromPushNotifications()` - Unsubscribe from push
- `isPushSubscribed()` - Check subscription status
- `getPushSubscription()` - Get current subscription
- `showLocalNotification(title, options)` - Show local notification
- `saveSubscriptionToServer(subscription)` - Save to backend
- `removeSubscriptionFromServer()` - Remove from backend

**Usage:**

```typescript
import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  saveSubscriptionToServer,
} from "@/lib/utils/push-notifications";

// Subscribe to notifications
const permission = await requestNotificationPermission();
if (permission === "granted") {
  const subscription = await subscribeToPushNotifications(VAPID_KEY);
  if (subscription) {
    await saveSubscriptionToServer(subscription);
  }
}
```

## Service Worker (`/public/sw.js`)

Implements caching strategies and handles push notifications.

**Caching Strategies:**

- **Static Assets** (images, fonts, styles, scripts): Cache-first
- **API Requests**: Network-first with cache fallback
- **Pages**: Stale-while-revalidate
- **Offline Fallback**: Serves `/offline.html` when network fails

**Features:**

- Pre-caches critical routes on install
- Cleans up old caches on activation
- Handles push notification events
- Opens notification URL on click
- Background sync support (for future offline queue)

## Web App Manifest (`/public/manifest.json`)

Defines the app's metadata for installation.

**Configuration:**

- App name and description
- Start URL and display mode
- Theme and background colors
- Icons in multiple sizes (72x72 to 512x512)
- Shortcuts for quick actions
- Screenshots for install preview

## Setup Instructions

### 1. Generate App Icons

Create icons in the following sizes and place them in `/public/assets/icons/`:

- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

You can use tools like:

- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

### 2. Configure VAPID Keys

For push notifications, generate VAPID keys:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Add keys to your environment variables:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### 3. Test PWA Features

**Install Prompt:**

1. Open app in Chrome/Edge
2. Wait 3 seconds for install prompt
3. Click "Install Now"
4. App should be installable

**Service Worker:**

1. Open DevTools > Application > Service Workers
2. Verify service worker is registered and active
3. Go offline and test cached content

**Push Notifications:**

1. Go to Notifications page
2. Enable notifications in settings
3. Grant permission when prompted
4. Test by sending a push notification

**Offline Support:**

1. Open app and browse content
2. Turn off internet connection
3. Refresh page - should load from cache
4. Navigate to cached pages
5. API calls should show cached data

### 4. Lighthouse PWA Audit

Run a PWA audit to ensure everything is configured correctly:

1. Open DevTools > Lighthouse
2. Select "Progressive Web App" category
3. Run audit
4. Fix any issues reported

**Target Scores:**

- PWA: 100/100
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 100/100

## Production Checklist

- [ ] All icons generated and optimized
- [ ] Manifest.json configured with correct URLs
- [ ] VAPID keys generated and stored securely
- [ ] Service worker registered only in production
- [ ] Push notification backend implemented
- [ ] Offline fallback page styled
- [ ] Install prompt tested on mobile devices
- [ ] Lighthouse PWA audit passes (100/100)
- [ ] Service worker caching strategies tested
- [ ] Push notifications work across browsers

## Browser Support

### Install Prompt

- ✅ Chrome 68+
- ✅ Edge 79+
- ✅ Samsung Internet 8+
- ❌ Safari (limited - Add to Home Screen only)
- ❌ Firefox (manual Add to Home Screen)

### Service Workers

- ✅ Chrome 40+
- ✅ Edge 17+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Opera 27+

### Push Notifications

- ✅ Chrome 42+
- ✅ Edge 17+
- ✅ Firefox 44+
- ⚠️ Safari 16+ (limited)
- ✅ Opera 29+

## Troubleshooting

### Install prompt not showing

- Check browser support (Chrome/Edge)
- Ensure HTTPS connection (or localhost)
- Clear localStorage if previously dismissed
- Verify manifest.json is valid
- Check service worker is registered

### Service worker not registering

- Check console for errors
- Verify `/sw.js` path is correct
- Ensure HTTPS connection (or localhost)
- Clear browser cache and retry
- Check service worker scope

### Push notifications not working

- Verify notification permission granted
- Check VAPID keys are correct
- Ensure service worker is active
- Test with browser DevTools > Application > Push
- Check server subscription endpoint

### Offline mode not working

- Verify service worker is active
- Check cache names match in sw.js
- Ensure resources are being cached
- Test with DevTools offline mode
- Check Network tab for cache hits

## Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
