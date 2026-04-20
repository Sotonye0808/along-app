# Test Fix Guide - Along App

## PowerShell Execution Policy Issue

### Problem

PowerShell is blocking npm commands due to execution policy restrictions:

```
npm : File C:\nvm4w\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

### Solution Options

#### Option 1: Run from CMD (Recommended)

1. Open Command Prompt (cmd.exe) instead of PowerShell
2. Navigate to project: `cd C:\Users\Sotonye\Downloads\web_dev\along-app`
3. Run tests: `npm test`

#### Option 2: Change PowerShell Execution Policy (Temporary)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

Then run: `npm test`

#### Option 3: Change PowerShell Execution Policy (Permanent)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Test Fixes Implemented

### 1. ✅ Test Utilities Updated

**File**: `app/lib/test-utils.tsx`

**Changes**:

- Added Ant Design `App` component to wrapper
- Provides proper context for message, notification, modal APIs
- Fixed component rendering issues

```typescript
import { App } from "antd";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AntdProvider>
        <App>
          <AuthProvider>{children}</AuthProvider>
        </App>
      </AntdProvider>
    </ThemeProvider>
  );
}
```

### 2. ✅ Jest Configuration Updated

**Files**: `jest.setup.js`, `jest.config.js`

**Changes**:

- Increased timeout to 10 seconds
- Added cleanup in afterEach
- Proper mock cleanup between tests

### 3. ✅ Test File Imports Fixed

**Files**: All test files (\*.test.tsx)

**Changes**:

- Added `import "@testing-library/jest-dom";` to each test file
- Fixes TypeScript errors for matchers like `toBeInTheDocument()`

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- PostCard.test.tsx
npm test -- LoginForm.test.tsx
npm test -- auth-flow.test.tsx
```

### Run with Verbose Output

```bash
npm test -- --verbose
```

### Run Single Test Suite

```bash
npm test -- --testNamePattern="Rendering"
```

### Run Single Test

```bash
npm test -- --testNamePattern="should render post title"
```

## Expected Results

After fixes, you should see:

- **Test Suites**: 7 passed, 7 total
- **Tests**: 142 passed, 142 total
- **Time**: Under 60 seconds
- **No worker process warnings**

## Debugging Individual Tests

### 1. Check PostCard Tests

```bash
npm test -- PostCard.test.tsx --verbose
```

**Common Issues**:

- Component not rendering: Check if PostCard is properly exported
- Elements not found: Add `screen.debug()` in test
- Async issues: Ensure all interactions use `await` and `waitFor`

**Fix Example**:

```typescript
it("should call onLike when like button is clicked", async () => {
  const user = userEvent.setup();
  render(<PostCard {...defaultProps} />);

  // Debug: See what's rendered
  // screen.debug();

  const likeButton = screen.getByLabelText(/like/i);
  await user.click(likeButton);

  await waitFor(() => {
    expect(defaultProps.onLike).toHaveBeenCalledWith(mockPost.id);
  });
});
```

### 2. Check LoginForm Tests

```bash
npm test -- LoginForm.test.tsx --verbose
```

**Common Issues**:

- Form validation not triggering
- Router navigation not working
- Auth context not available

**Fix Example**:

```typescript
it("should show validation errors for empty fields", async () => {
  const user = userEvent.setup();
  render(<LoginForm />, { initialUser: null });

  const submitButton = screen.getByRole("button", { name: /Sign In/i });
  await user.click(submitButton);

  // Wait longer for Ant Design validation
  await waitFor(
    () => {
      expect(screen.getByText(/Please enter your email/i)).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
});
```

### 3. Check Auth Flow Tests

```bash
npm test -- auth-flow.test.tsx --verbose
```

**Common Issues**:

- Multiple component interactions failing
- State not updating properly
- Mock API not resolving

**Fix Example**:

```typescript
it("should complete full login process successfully", async () => {
  const user = userEvent.setup();

  // Mock API call
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({ user: mockUser, token: "fake-token" }),
    })
  ) as jest.Mock;

  render(<LoginForm />, { initialUser: null });

  // Fill form
  await user.type(
    screen.getByPlaceholderText("youremail@example.com"),
    "test@example.com"
  );
  await user.type(
    screen.getByPlaceholderText("Enter your password"),
    "password123"
  );

  // Submit
  await user.click(screen.getByRole("button", { name: /Sign In/i }));

  // Wait for redirect
  await waitFor(
    () => {
      expect(mockPush).toHaveBeenCalledWith("/home");
    },
    { timeout: 5000 }
  );
});
```

## Common Test Patterns

### Pattern 1: Async User Interactions

```typescript
const user = userEvent.setup();
await user.click(button);
await user.type(input, "text");
```

### Pattern 2: Waiting for Elements

```typescript
await waitFor(() => {
  expect(screen.getByText("Success")).toBeInTheDocument();
});
```

### Pattern 3: Querying Elements

```typescript
// Use getBy for elements that should exist
const button = screen.getByRole("button", { name: /submit/i });

// Use queryBy for elements that might not exist
const error = screen.queryByText("Error");
expect(error).not.toBeInTheDocument();

// Use findBy for async elements
const message = await screen.findByText("Loaded", {}, { timeout: 3000 });
```

### Pattern 4: Dropdown/Menu Interactions

```typescript
// Open dropdown
const moreButton = screen.getByLabelText(/more/i);
await user.click(moreButton);

// Wait for menu
await waitFor(() => {
  expect(screen.getByText("Edit")).toBeInTheDocument();
});

// Click menu item
await user.click(screen.getByText("Edit"));
```

### Pattern 5: Form Validation

```typescript
// Trigger validation
await user.click(submitButton);

// Wait for Ant Design validation (takes time)
await waitFor(
  () => {
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  },
  { timeout: 3000 }
);
```

## Additional Debugging Tools

### 1. Screen Debug

```typescript
// Show entire DOM
screen.debug();

// Show specific element
screen.debug(screen.getByRole("button"));

// Show with size limit
screen.debug(undefined, 300000); // Increase limit
```

### 2. Console Logs

```typescript
// Log element state
console.log(screen.getByRole("button").className);
console.log(screen.getByRole("button").getAttribute("disabled"));
```

### 3. Query Results

```typescript
// See all matching elements
screen.getAllByRole("button").forEach((btn) => {
  console.log(btn.textContent);
});
```

## Next Steps

1. **Switch to CMD** or fix PowerShell execution policy
2. **Run all tests**: `npm test`
3. **If any fail**, run individual test file with `--verbose`
4. **Add debug output** to failing tests
5. **Fix issues** based on error messages
6. **Re-run tests** until all pass

## Quick Command Reference

```bash
# Run all tests
npm test

# Run specific file
npm test -- PostCard.test.tsx

# Run with verbose output
npm test -- --verbose

# Run specific test
npm test -- --testNamePattern="should render"

# Run and watch
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Clear cache and run
npm test -- --clearCache
npm test
```

## Expected Output After Fixes

```
PASS  app/lib/utils/__tests__/format.test.ts
PASS  app/lib/utils/__tests__/auth.test.ts
PASS  app/lib/utils/__tests__/geolocation.test.ts
PASS  app/lib/utils/__tests__/structuredData.test.ts
PASS  app/components/features/auth/__tests__/LoginForm.test.tsx
PASS  app/components/features/posts/__tests__/PostCard.test.tsx
PASS  app/__tests__/integration/auth-flow.test.tsx

Test Suites: 7 passed, 7 total
Tests:       142 passed, 142 total
Snapshots:   0 total
Time:        45.678 s
```

## Contact Support

If tests still fail after following this guide:

1. Run: `npm test -- --verbose > test-output.txt 2>&1`
2. Share the `test-output.txt` file
3. Include specific error messages
4. Note which tests are failing
