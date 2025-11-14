# Along App - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Verify Installation

```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
git --version   # Any recent version
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sotonye0808/along-app.git
cd along-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:

- Next.js 16
- React 19
- Ant Design 5
- TypeScript
- Tailwind CSS
- And all other dependencies

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# API Configuration (mock backend runs on 3001)
NEXT_PUBLIC_API_URL=http://localhost:3001

# PWA Configuration (for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

#### Generate VAPID Keys (for Push Notifications)

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Copy the generated keys to your `.env.local` file.

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### With Mock Backend (Optional)

If you want to use the json-server mock backend instead of Next.js API routes:

```bash
npm run dev:all
```

This runs both the Next.js dev server and the mock API server concurrently.

### Production Build

```bash
npm run build
npm start
```

The production build will be optimized and minified.

## Project Structure

```
along-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── otp/
│   ├── (dashboard)/             # Dashboard routes
│   │   ├── home/
│   │   ├── explore/
│   │   ├── bookmarks/
│   │   ├── marketplace/
│   │   ├── notifications/
│   │   ├── posts/
│   │   └── profile/
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   ├── posts/
│   │   ├── users/
│   │   └── notifications/
│   ├── components/              # React components
│   │   ├── features/           # Feature-specific components
│   │   └── ui/                 # Reusable UI components
│   ├── providers/              # Context providers
│   └── lib/                    # Utilities and types
│       ├── utils/              # Utility functions
│       ├── types/              # TypeScript types
│       ├── constants/          # Constants
│       ├── hooks/              # Custom hooks
│       └── data/               # Mock data and database
├── public/                      # Static assets
│   ├── assets/                 # Images and icons
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── offline.html            # Offline fallback
├── lib/                        # External libraries (if any)
├── mock-backend/               # JSON Server mock backend
├── .github/                    # GitHub configuration
│   ├── plan.md                 # Development plan
│   ├── project-context.md      # Project documentation
│   └── summaries/              # Implementation summaries
└── Configuration files
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow the coding standards (see CONTRIBUTING.md)
- Write tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
npm run lint          # Check for linting errors
npm run build         # Verify production build works
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

   For production:

   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Install Netlify CLI**

   ```bash
   npm install -g netlify-cli
   ```

2. **Build the application**

   ```bash
   npm run build
   ```

3. **Deploy**

   ```bash
   netlify deploy
   ```

   For production:

   ```bash
   netlify deploy --prod
   ```

### Environment Variables for Production

Make sure to set the following environment variables in your deployment platform:

- `NEXT_PUBLIC_APP_URL` - Your production URL
- `NEXT_PUBLIC_API_URL` - Your API URL (or use Next.js API routes)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - VAPID public key for push notifications
- `VAPID_PRIVATE_KEY` - VAPID private key (keep secret!)

## PWA Setup

### 1. Generate App Icons

You'll need icons in the following sizes:

- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Tools:

- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

Place icons in `public/assets/icons/`

### 2. Update Manifest

Edit `public/manifest.json` with your app details:

- App name and description
- Theme colors
- Icon paths
- Start URL

### 3. Test PWA Features

1. **Service Worker**

   - Open DevTools > Application > Service Workers
   - Verify service worker is registered

2. **Install Prompt**

   - Open app in Chrome/Edge
   - Wait for install prompt
   - Test installation

3. **Offline Mode**

   - Enable offline mode in DevTools
   - Verify cached content loads

4. **Push Notifications**
   - Go to notifications settings
   - Enable notifications
   - Test with push event in DevTools

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill process on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on Mac/Linux
lsof -ti:3000 | xargs kill -9
```

Or use a different port:

```bash
PORT=3001 npm run dev
```

### Module Not Found Errors

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### TypeScript Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update TypeScript definitions
npm update @types/react @types/react-dom @types/node
```

### Service Worker Not Updating

```bash
# Clear browser cache
# Open DevTools > Application > Clear storage

# Unregister service worker
# Application > Service Workers > Unregister

# Hard reload
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

## Common Issues

### Issue: Images not loading

**Solution**: Check image paths are correct and files exist in `public/assets/images/`

### Issue: API requests failing

**Solution**: Verify the mock backend is running or Next.js API routes are working

### Issue: Styles not applying

**Solution**: Check Tailwind CSS is configured correctly and rebuild

### Issue: Authentication not working

**Solution**: Clear cookies and local storage, then try logging in again

## Performance Optimization

### 1. Image Optimization

Use Next.js Image component:

```tsx
import Image from "next/image";

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority={false} // Set to true for above-the-fold images
/>;
```

### 2. Code Splitting

Use dynamic imports for heavy components:

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <LoadingSkeleton />,
});
```

### 3. Bundle Analysis

```bash
npm install -D @next/bundle-analyzer
```

Add to `next.config.mjs`:

```js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
```

Run analysis:

```bash
ANALYZE=true npm run build
```

## Testing

### Run Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report
```

### Test Specific Files

```bash
npm test -- api.test.ts
npm test -- auth.test.ts
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Ant Design Documentation](https://ant.design/components/overview/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## Getting Help

- Check the [GitHub Issues](https://github.com/Sotonye0808/along-app/issues)
- Read the [Contributing Guidelines](CONTRIBUTING.md)
- Review the [Project Context](.github/project-context.md)
- See [Development Plan](.github/plan.md)

## License

This project is proprietary and confidential.
