# Backend Readiness

This client is ready to move toward a separate backend after the MVP screens are stable.

## Backend Work Notice

Before backend work starts, confirm credentials and hosting direction. Do not hardcode secrets in this client repo.

## Recommended Stack

- Authentication: Better Auth
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
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=replace-with-secure-secret
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fraudshieldbd
CLOUDINARY_CLOUD_NAME=replace-with-cloud-name
CLOUDINARY_API_KEY=replace-with-api-key
CLOUDINARY_API_SECRET=replace-with-api-secret
```

## First Backend Milestone

1. Create separate server project.
2. Add health route: `GET /health`.
3. Connect MongoDB Atlas.
4. Add Better Auth.
5. Add report API routes.
6. Replace client localStorage report reads with API calls one feature at a time.

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
