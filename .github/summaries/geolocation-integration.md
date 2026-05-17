# Geolocation Integration

This document describes the geolocation feature integration in the Along app.

## Overview

The geolocation feature allows users to automatically detect and set their current location in their profile. This helps personalize the user experience and show relevant routes based on location.

## Implementation

### 1. User Interface Type

The `User` interface already included an optional `location` field:

```typescript
interface User {
  // ... other fields
  location?: string;
}
```

### 2. Mock Data

Updated all mock users to include location data:
- Chidi: Lagos, Nigeria
- Ada: Port Harcourt, Nigeria  
- Emeka: Abuja, Nigeria
- Eddie: Lagos, Nigeria

### 3. Geolocation Utility (`lib/utils/geolocation.ts`)

Created comprehensive geolocation utilities:

#### Functions

- **`getCurrentPosition()`**: Get user's coordinates using browser Geolocation API
  - Returns: `Promise<Coordinates>`
  - Handles permission errors, timeouts, and unavailable positions
  - Caches location for 5 minutes

- **`reverseGeocode(coordinates)`**: Convert coordinates to human-readable address
  - Uses Nominatim (OpenStreetMap) API - free, no API key required
  - Returns: `Promise<LocationResult>` with city, state, country
  - Fallback to coordinates if geocoding fails

- **`getCurrentLocation()`**: Combined function
  - Gets coordinates and reverse geocodes in one call
  - Returns: `Promise<LocationResult>`

- **`isGeolocationAvailable()`**: Check if browser supports geolocation
  - Returns: `boolean`

- **`requestLocationPermission()`**: Request location permission
  - Returns: `Promise<boolean>`

#### Error Handling

- Permission denied
- Position unavailable
- Request timeout
- Network errors
- Graceful fallbacks

### 4. Edit Profile Modal Updates

Enhanced `EditProfileModal` component with geolocation:

#### New Features

1. **"Use Current" Button**
   - Icon: `<EnvironmentOutlined />`
   - Located next to location input field
   - Shows loading state while fetching location
   - Automatically fills location field with detected location

2. **Guest User Protection**
   - Checks `isAuthenticated` prop
   - Shows confirmation modal for guest users
   - Modal prompts: "Create an Account"
   - Redirects to registration page if user confirms

3. **User Feedback**
   - Success message: "Location detected successfully!"
   - Error messages based on failure type:
     - "Location access denied. Please enable location permissions."
     - "Location information unavailable"
     - "Location request timed out"
     - "Failed to get current location"

#### Props

```typescript
interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onSave: (userData: Partial<User>) => Promise<void>;
  isAuthenticated?: boolean; // NEW: Defaults to true
}
```

## User Flows

### Authenticated User Flow

1. User opens Edit Profile modal
2. Clicks "Use Current" button next to location field
3. Browser requests location permission (if not already granted)
4. App fetches coordinates and reverse geocodes to address
5. Location field auto-fills with detected location
6. User can edit or save as-is

### Guest User Flow

1. Guest user somehow accesses profile edit (future feature)
2. Clicks "Use Current" button
3. Modal appears: "Create an Account"
4. Explains need for account to use live location
5. Options:
   - Sign Up: Redirects to registration
   - Cancel: Stays on current page

## Privacy & Security

### Permission Handling
- Respects browser location permissions
- Clear error messages when permission denied
- No forced or repeated permission requests

### Data Storage
- Location stored as plain text string
- No coordinate storage in database
- User can manually edit or clear location
- Optional field - not required

### API Usage
- Uses free Nominatim API (OpenStreetMap)
- No API keys required
- Respects rate limits (1 req/sec recommended)
- Includes User-Agent header as required

## Browser Compatibility

### Supported
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS/macOS)
- Opera: Full support

### Requirements
- HTTPS required for production (browsers block geolocation on HTTP)
- User must grant location permission
- JavaScript must be enabled

## Testing

### Manual Testing Checklist

- [ ] Click "Use Current" with location permission granted
- [ ] Click "Use Current" with location permission denied
- [ ] Click "Use Current" with location permission not yet decided
- [ ] Verify location appears in correct format
- [ ] Test on mobile device
- [ ] Test with browser location disabled
- [ ] Test with slow/unreliable network
- [ ] Verify guest user sees account creation prompt
- [ ] Verify authenticated user can use feature

### Edge Cases Handled

- Browser doesn't support geolocation
- User denies permission
- Timeout waiting for position
- Geocoding API fails
- Network error during geocoding
- Invalid coordinates
- Location services disabled on device

## Future Enhancements

### Suggested Improvements

1. **Location History**: Save previous locations for quick selection
2. **Map Picker**: Visual map interface to select location
3. **Nearby Suggestions**: Auto-suggest locations based on coordinates
4. **Location Verification**: Verify location matches typical user activity
5. **Privacy Controls**: Allow users to hide exact location
6. **Timezone Detection**: Auto-set timezone based on location
7. **Location-based Features**:
   - Filter feed by location
   - Find nearby users
   - Location-based route suggestions
   - Distance to route destinations

## Configuration

### Geolocation Options

Current settings in `getCurrentPosition()`:

```javascript
{
  enableHighAccuracy: false,  // Faster, less battery usage
  timeout: 10000,             // 10 second timeout
  maximumAge: 300000,         // Cache for 5 minutes
}
```

Can be adjusted based on:
- Accuracy requirements
- Battery usage concerns
- User experience goals

### Nominatim API

- Base URL: `https://nominatim.openstreetmap.org`
- Format: JSON
- Zoom level: 10 (city-level detail)
- Rate limit: 1 request/second recommended
- User-Agent: "Along App"

## Known Limitations

1. **No coordinate storage**: Only human-readable address saved
2. **Accuracy varies**: Depends on device and method (GPS, WiFi, IP)
3. **Permission required**: Can't force users to share location
4. **HTTPS only**: Won't work on HTTP in production
5. **Rate limits**: Nominatim API has usage limits
6. **No fallback API**: Only uses one geocoding provider

## Maintenance

### Monitoring

Watch for:
- High geocoding failure rates
- Permission denial rates
- Timeout frequency
- API errors

### Updates

- Monitor browser API changes
- Check Nominatim API updates
- Review error logs
- Update error messages based on user feedback
