# Contributing to Along App

Thank you for your interest in contributing to Along! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Code Review Checklist](#code-review-checklist)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting, or derogatory remarks
- Public or private harassment
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

## Getting Started

### Prerequisites

1. Read the [Project Context](.github/project-context.md)
2. Review the [Development Plan](.github/plan.md)
3. Set up your development environment (see [SETUP.md](SETUP.md))
4. Familiarize yourself with the codebase structure

### Finding Issues to Work On

- Check the [GitHub Issues](https://github.com/Sotonye0808/along-app/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Ask in the issue comments if you'd like to work on something

### Claiming an Issue

1. Comment on the issue expressing your interest
2. Wait for maintainer approval before starting work
3. Reference the issue number in your commits and PR

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/along-app.git
cd along-app

# Add upstream remote
git remote add upstream https://github.com/Sotonye0808/along-app.git
```

### 2. Create a Branch

Branch naming convention:

```bash
# Feature branches
git checkout -b feature/short-description

# Bug fix branches
git checkout -b bugfix/short-description

# Hotfix branches (urgent production fixes)
git checkout -b hotfix/short-description
```

Examples:

- `feature/add-user-notifications`
- `bugfix/fix-login-redirect`
- `hotfix/security-patch`

### 3. Keep Your Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Merge upstream changes
git merge upstream/develop
```

### 4. Make Your Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Write tests for new features
- Update documentation as needed
- Keep commits focused and atomic

### 5. Commit Your Changes

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
git commit -m "type(scope): description"
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring without changing functionality
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, dependency updates
- `ci:` - CI/CD changes
- `build:` - Build system changes

**Examples:**

```bash
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(posts): resolve image upload error"
git commit -m "docs(api): update authentication endpoints"
git commit -m "refactor(utils): simplify date formatting logic"
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Coding Standards

### TypeScript

#### Type Safety

```typescript
// ✅ Good - Explicit types
interface UserProps {
  user: User;
  onUpdate: (user: User) => void;
}

// ❌ Bad - Using 'any'
function updateUser(data: any) {
  // ...
}

// ✅ Good - Proper typing
function updateUser(data: User) {
  // ...
}
```

#### Type vs Interface

```typescript
// ✅ Prefer interface for object shapes
interface User {
  id: string;
  name: string;
}

// ✅ Use type for unions, intersections, primitives
type Status = "active" | "inactive" | "pending";
type UserWithStatus = User & { status: Status };
```

#### Avoid Type Assertions

```typescript
// ❌ Bad - Type assertion
const user = data as User;

// ✅ Good - Type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" && data !== null && "id" in data && "name" in data
  );
}

if (isUser(data)) {
  // TypeScript knows data is User here
}
```

### React/Next.js

#### Component Structure

```typescript
// ✅ Good component structure
"use client"; // Only if needed

import { useState } from "react";
import { Button } from "antd";
import type { User } from "@/lib/types";

interface UserCardProps {
  user: User;
  onEdit?: () => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  const [expanded, setExpanded] = useState(false);

  return <div className="user-card">{/* Component JSX */}</div>;
}
```

#### Server vs Client Components

```typescript
// ✅ Server Component (default)
// No 'use client' directive
// Can use async/await
export default async function PostsPage() {
  const posts = await fetchPosts();
  return <PostList posts={posts} />;
}

// ✅ Client Component (when needed)
// Has 'use client' directive
// Can use hooks, event handlers
("use client");

export function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>Like</button>;
}
```

#### Hooks Best Practices

```typescript
// ✅ Good - Custom hooks
function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch user
  }, []);

  return { user, setUser };
}

// ✅ Good - Dependency arrays
useEffect(() => {
  fetchData(userId);
}, [userId]); // Include all dependencies

// ❌ Bad - Missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // userId is missing!
```

### Styling

#### Tailwind CSS

```tsx
// ✅ Good - Utility classes
<div className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
  <Avatar src={user.avatar} />
  <div className="flex-1">
    <h3 className="text-lg font-semibold">{user.name}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
  </div>
</div>

// ✅ Good - Conditional classes
<button
  className={cn(
    "px-4 py-2 rounded-lg transition-colors",
    isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
  )}
>
  Click Me
</button>
```

#### Ant Design

```tsx
// ✅ Good - Combine Ant Design with Tailwind
import { Card, Button } from "antd";

<Card className="shadow-lg dark:bg-gray-800">
  <div className="space-y-4">
    <h2 className="text-xl font-bold">Title</h2>
    <p className="text-gray-600 dark:text-gray-400">Content</p>
    <Button type="primary" className="w-full">
      Action
    </Button>
  </div>
</Card>;
```

### File Naming

```
✅ Components:     PascalCase     (UserProfile.tsx, PostCard.tsx)
✅ Utilities:      camelCase      (formatDate.ts, api.ts)
✅ API Routes:     lowercase      (route.ts, users/route.ts)
✅ Types:          camelCase      (types.ts, interfaces.ts)
✅ Constants:      camelCase      (index.ts, apiEndpoints.ts)
✅ Hooks:          camelCase      (useAuth.ts, useTheme.ts)
```

### Code Organization

```typescript
// ✅ Good - Organized imports
// 1. External libraries
import { useState, useEffect } from "react";
import { Button, Card } from "antd";
import { useRouter } from "next/navigation";

// 2. Internal imports
import { api } from "@/lib/utils/api";
import { formatDate } from "@/lib/utils/format";
import type { User, Post } from "@/lib/types";

// 3. Components
import { UserAvatar } from "@/app/components/features/profile";

// 4. Styles (if any)
import styles from "./Component.module.css";
```

## Testing Requirements

### Unit Tests

Write tests for all utility functions:

```typescript
// lib/utils/__tests__/format.test.ts
import { formatDate, formatNumber } from "../format";

describe("formatDate", () => {
  it("should format date correctly", () => {
    const date = "2024-01-15T10:30:00Z";
    expect(formatDate(date)).toBe("Jan 15, 2024");
  });

  it("should handle invalid dates", () => {
    expect(formatDate("invalid")).toBe("Invalid date");
  });
});
```

### Component Tests

Write tests for components:

```typescript
// components/__tests__/UserCard.test.tsx
import { render, screen } from "@testing-library/react";
import { UserCard } from "../UserCard";

describe("UserCard", () => {
  const mockUser = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
  };

  it("should render user information", () => {
    render(<UserCard user={mockUser} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });
});
```

### Test Coverage

- Aim for at least 80% code coverage
- All critical paths must be tested
- Edge cases should be covered
- Error scenarios should be tested

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
npm test -- Component.test # Test specific file
```

## Documentation

### Code Comments

```typescript
// ✅ Good - Explain why, not what
// Use exponential backoff to avoid rate limiting
const delay = Math.pow(2, retryCount) * 1000;

// ❌ Bad - Stating the obvious
// Set delay to 2 raised to retryCount times 1000
const delay = Math.pow(2, retryCount) * 1000;
```

### JSDoc Comments

```typescript
/**
 * Formats a date string into a human-readable format
 * @param date - ISO 8601 date string
 * @param options - Formatting options
 * @returns Formatted date string
 * @example
 * formatDate('2024-01-15T10:30:00Z') // 'Jan 15, 2024'
 */
export function formatDate(date: string, options?: FormatOptions): string {
  // Implementation
}
```

### Component Documentation

Each major component should have:

- Purpose/description
- Props documentation
- Usage examples
- Edge cases and limitations

### README Updates

Update relevant README files when adding new features:

- Main README.md
- Component README files
- Feature-specific documentation

## Pull Request Process

### Before Creating a PR

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Commits follow conventional commits format
- [ ] Branch is up to date with develop

### PR Title

Follow conventional commits format:

```
feat(scope): add user notification system
fix(auth): resolve token refresh issue
docs(api): update authentication endpoints
```

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue

Closes #123

## Changes Made

- Change 1
- Change 2
- Change 3

## Testing

- [ ] Unit tests added/updated
- [ ] Component tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)

Add screenshots here

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Maintainers review code
3. **Address Feedback**: Make requested changes
4. **Approval**: Get approval from maintainer
5. **Merge**: Maintainer merges to develop

## Code Review Checklist

### For Authors

Before requesting review:

- [ ] Self-review completed
- [ ] All tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Commits are clean and descriptive
- [ ] Branch is up to date

### For Reviewers

When reviewing PRs:

#### Functionality

- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is proper
- [ ] No obvious bugs

#### Code Quality

- [ ] Code is readable and maintainable
- [ ] DRY principle followed
- [ ] No unnecessary complexity
- [ ] Proper naming conventions
- [ ] TypeScript types are correct

#### Testing

- [ ] Adequate test coverage
- [ ] Tests are meaningful
- [ ] Edge cases are tested

#### Security

- [ ] No security vulnerabilities
- [ ] Input validation present
- [ ] No sensitive data exposed
- [ ] Authentication/authorization correct

#### Performance

- [ ] No performance regressions
- [ ] Efficient algorithms used
- [ ] Proper caching implemented
- [ ] No memory leaks

#### Documentation

- [ ] Code is well-documented
- [ ] README updated if needed
- [ ] API docs updated if needed
- [ ] Breaking changes documented

## Branch Strategy

```
main (production)
  └── develop (integration)
        ├── feature/feature-name
        ├── bugfix/bug-name
        └── hotfix/critical-fix
```

### Branches

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/\***: New features
- **bugfix/\***: Bug fixes
- **hotfix/\***: Urgent production fixes

### Workflow

1. Create feature branch from `develop`
2. Make changes and commit
3. Create PR to merge into `develop`
4. After review and approval, merge to `develop`
5. Periodically merge `develop` to `main` for releases

## Getting Help

- Ask questions in issue comments
- Join discussions in pull requests
- Check existing documentation
- Review similar implementations in the codebase

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project README

Thank you for contributing to Along! 🎉
