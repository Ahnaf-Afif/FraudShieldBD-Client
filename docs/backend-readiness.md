# Backend Readiness

The client is connected to the separate Express backend and is ready for production hardening.

## Backend Work Notice

Keep backend credentials in the server environment only. Do not hardcode secrets in this client repo.

## Recommended Stack

- Authentication: Express middleware with JWT access tokens
- Database: MongoDB Atlas
- File storage: Cloudinary
- Server: Express + Node.js
- Client hosting: Vercel or equivalent Next.js host
- Server hosting: Render, Railway, Fly.io, or VPS

## Environment Variables

Client:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Server:

```bash
JWT_SECRET=replace-with-secure-secret
RESEND_API_KEY=replace-with-resend-api-key
RESEND_FROM_EMAIL=FraudShield BD <onboarding@resend.dev>
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fraudshieldbd
CLOUDINARY_CLOUD_NAME=replace-with-cloud-name
CLOUDINARY_API_KEY=replace-with-api-key
CLOUDINARY_API_SECRET=replace-with-api-secret
```

## First Backend Milestone

1. Create separate server project. (Complete)
2. Add health route: `GET /api/health`. (Complete)
3. Connect MongoDB Atlas. (Complete)
4. Add JWT authentication and protected API routes. (Complete)
5. Add report, engagement, watchlist, notification, upload, and moderation routes. (Complete)
6. Keep localStorage only as an MVP fallback when the client has no API session.

## Suggested Collections

- users
- reports
- reportComments
- reportReactions
- watchlistItems
- notifications
- evidenceFiles

## Important Rule

Only `NEXT_PUBLIC_*` variables should be visible to the browser. Keep database, auth and Cloudinary secrets on the server.
