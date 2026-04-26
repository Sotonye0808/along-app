# API Route Audit — 2026-04-26

## Scope

Audit of all `app/api/**/route.ts` handlers for:

- data source type
- zod validation usage
- rate limiting usage
- redis cache usage

Total routes audited: 20

## Summary

- `prisma-direct`: 19
- `mock/in-memory`: 0
- `other` (no DB access expected): 1

## Route Matrix

| Route                                                      | Data Source   | Zod | Rate Limit | Redis Cache | Notes                                      |
| ---------------------------------------------------------- | ------------- | --- | ---------- | ----------- | ------------------------------------------ |
| `app/api/auth/login/route.ts`                              | prisma-direct | no  | yes        | no          | Uses `validateLoginData` helper            |
| `app/api/auth/logout/route.ts`                             | other         | no  | yes        | yes         | Cookie/session cleanup route               |
| `app/api/auth/refresh/route.ts`                            | prisma-direct | no  | yes        | no          | JWT refresh flow                           |
| `app/api/auth/register/route.ts`                           | prisma-direct | no  | yes        | yes         | OTP persisted in Redis-backed cache only   |
| `app/api/auth/verify/route.ts`                             | prisma-direct | no  | yes        | no          | JWT + Prisma user verification             |
| `app/api/auth/verify-otp/route.ts`                         | prisma-direct | yes | yes        | yes         | Uses `verifyOtpSchema`                     |
| `app/api/notifications/[id]/route.ts`                      | prisma-direct | no  | yes        | yes         | Recipient-level operations                 |
| `app/api/notifications/route.ts`                           | prisma-direct | no  | yes        | no          | Listing and mark-read actions              |
| `app/api/notifications/subscribe/route.ts`                 | prisma-direct | no  | yes        | yes         | Subscription preference path               |
| `app/api/notifications/unsubscribe/route.ts`               | prisma-direct | no  | yes        | yes         | Subscription preference path               |
| `app/api/posts/[id]/bookmark/route.ts`                     | prisma-direct | no  | yes        | yes         | Bookmark toggles                           |
| `app/api/posts/[id]/comments/[commentId]/dislike/route.ts` | prisma-direct | yes | yes        | no          | Migrated to Prisma comment counter updates |
| `app/api/posts/[id]/comments/[commentId]/like/route.ts`    | prisma-direct | yes | yes        | no          | Migrated to Prisma comment counter updates |
| `app/api/posts/[id]/comments/route.ts`                     | prisma-direct | no  | yes        | no          | Comment CRUD list/create                   |
| `app/api/posts/[id]/like/route.ts`                         | prisma-direct | no  | yes        | yes         | Post reaction toggles                      |
| `app/api/posts/[id]/route.ts`                              | prisma-direct | yes | yes        | yes         | Post detail/update/delete                  |
| `app/api/posts/route.ts`                                   | prisma-direct | yes | yes        | yes         | Feed/create route                          |
| `app/api/users/[id]/follow/route.ts`                       | prisma-direct | no  | yes        | yes         | Follow/unfollow                            |
| `app/api/users/[id]/route.ts`                              | prisma-direct | yes | yes        | yes         | Profile detail/update/delete               |
| `app/api/users/route.ts`                                   | prisma-direct | no  | yes        | yes         | User listing                               |

## Remaining Mock Dependencies

None. All `app/api/**/route.ts` handlers are now Prisma-backed or non-DB utility handlers.

## Next Migration Target

Move to route-level hardening tasks: consistent Zod coverage, cursor pagination alignment, Redis cache strategy normalization, and `PrismaClientKnownRequestError` handling.
