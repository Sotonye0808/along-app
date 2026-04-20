# Running Tests - Quick Guide

## Run All Tests

```cmd
npm test
```

## Save Test Output to File

```cmd
npm run test:file
```

This runs tests and saves the full output to `test-output.txt`.

## Watch Mode (Re-run on changes)

```cmd
npm run test:watch
```

## Coverage Report

```cmd
npm run test:coverage
```

## Batch Scripts (Windows)

### run-tests-to-file.bat

Runs tests and saves output to `test-output.txt` with progress messages.

### test-quick.bat

Runs tests with extended 15-second timeout for slower machines.

## Test Structure

```
app/
├── __tests__/
│   └── integration/        # Integration tests
├── components/
│   └── features/
│       └── **/__tests__/   # Component unit tests
└── lib/
    └── utils/
        └── __tests__/      # Utility function tests
```

## Current Status

✅ **All 142 tests passing**

- 7 test suites
- ~60-80 second runtime
- 100% of tests passing

## Common Issues & Solutions

### PowerShell Script Execution Disabled

If you see "scripts is disabled on this system", use the batch files:

```cmd
.\run-tests-to-file.bat
```

### Tests Timeout

Use the quick test batch file with extended timeout:

```cmd
.\test-quick.bat
```

### Mock Providers

Tests use mock providers (ThemeProvider, AntdProvider, AuthProvider) for synchronous rendering. These are configured in `app/lib/test-utils.tsx`.

## Test Coverage Goals

Current coverage thresholds (configured in `jest.config.js`):

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 80%
- **Statements**: 80%

Run `npm run test:coverage` to see detailed coverage report.
