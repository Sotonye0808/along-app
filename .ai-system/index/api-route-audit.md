# API Route Audit — 2026-04-26

## Scope

Audit of all `app/api/**/route.ts` handlers for:

- data source type
- zod/input validation usage
- rate limiting usage
- redis cache usage
- prisma known-request error handling

Total routes audited: 20

## Summary

- `prisma-direct`: 17
- `mock/in-memory`: 0
- `other` (no DB access expected): 3

## Route Matrix

| Route                                                      | Data Source   | Zod/Input Validation | Rate Limit | Redis Cache | Prisma Error Mapping | Notes                                                    |
| ---------------------------------------------------------- | ------------- | -------------------- | ---------- | ----------- | -------------------- | -------------------------------------------------------- |
| `app/api/auth/login/route.ts`                              | prisma-direct | yes                  | yes        | no          | yes                  | Uses `validateLoginData` helper + shared mapper          |
| `app/api/auth/logout/route.ts`                             | other         | no                   | yes        | no          | n/a                  | Cookie/session cleanup route (no request payload/Prisma) |
| `app/api/auth/refresh/route.ts`                            | prisma-direct | yes                  | yes        | no          | yes                  | JWT payload validated via Zod                            |
| `app/api/auth/register/route.ts`                           | prisma-direct | yes                  | yes        | yes         | yes                  | OTP persisted in Redis-backed cache only                 |
| `app/api/auth/verify/route.ts`                             | prisma-direct | yes                  | yes        | no          | yes                  | JWT payload validated via Zod                            |
| `app/api/auth/verify-otp/route.ts`                         | prisma-direct | yes                  | yes        | yes         | yes                  | Uses `verifyOtpSchema`                                   |
| `app/api/notifications/[id]/route.ts`                      | prisma-direct | yes                  | yes        | no          | yes                  | Recipient-level operations                               |
| `app/api/notifications/route.ts`                           | prisma-direct | yes                  | yes        | yes         | yes                  | Cursor-based list + mark-read actions                    |
| `app/api/notifications/subscribe/route.ts`                 | other         | yes                  | yes        | no          | n/a                  | Zod body validation; persistence TODO                    |
| `app/api/notifications/unsubscribe/route.ts`               | other         | yes                  | yes        | no          | n/a                  | Zod body validation; persistence TODO                    |
| `app/api/posts/[id]/bookmark/route.ts`                     | prisma-direct | yes                  | yes        | no          | yes                  | Bookmark toggles                                         |
| `app/api/posts/[id]/comments/[commentId]/dislike/route.ts` | prisma-direct | yes                  | yes        | no          | yes                  | Prisma comment counter updates                           |
| `app/api/posts/[id]/comments/[commentId]/like/route.ts`    | prisma-direct | yes                  | yes        | no          | yes                  | Prisma comment counter updates                           |
| `app/api/posts/[id]/comments/route.ts`                     | prisma-direct | yes                  | yes        | yes         | yes                  | Cursor-based comment list + create                       |
| `app/api/posts/[id]/like/route.ts`                         | prisma-direct | yes                  | yes        | no          | yes                  | Post reaction toggles                                    |
| `app/api/posts/[id]/route.ts`                              | prisma-direct | yes                  | yes        | yes         | yes                  | Post detail/update/delete                                |
| `app/api/posts/route.ts`                                   | prisma-direct | yes                  | yes        | yes         | yes                  | Cursor-based feed/create route                           |
| `app/api/users/[id]/follow/route.ts`                       | prisma-direct | yes                  | yes        | yes         | yes                  | Follow/unfollow                                          |
| `app/api/users/[id]/route.ts`                              | prisma-direct | yes                  | yes        | yes         | yes                  | Profile detail/update/delete                             |
| `app/api/users/route.ts`                                   | prisma-direct | yes                  | yes        | yes         | yes                  | Cursor-based user listing                                |

## Remaining Mock Dependencies

None. All `app/api/**/route.ts` handlers are now Prisma-backed or non-DB utility handlers.

## Remaining Hardening Gaps

- Some authenticated GET endpoints are intentionally uncached (`auth/verify`, post/user relation checks) to avoid stale per-user state.
- Cursor pagination is standardized for list endpoints (`posts`, `users`, `notifications`, `posts/[id]/comments`) and not applied to relation/status endpoints where it is not needed.
