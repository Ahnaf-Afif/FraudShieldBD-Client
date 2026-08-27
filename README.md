# FraudShield BD Client

FraudShield BD is a community safety MVP for reporting scams, checking suspicious identifiers, browsing approved reports, and tracking personal report/watchlist activity.

## Current Status

This repo is the Next.js client MVP. Authenticated sessions use the separate API for reports, engagement, watchlists, notifications, profile updates, moderation data, and uploads. Browser localStorage remains the fallback for demo sessions and temporary draft data when the API is unavailable.

Completed client flows:

- Home community newsfeed
- Check Before You Pay
- Browse Reports with filters and CSV export
- Report Fraud form with draft saving
- Report detail pages
- API-backed likes, comments, and report engagement
- My Reports, Watchlist, Notifications, Profile
- Local demo login/register
- Local MVP settings, backup, restore and reset controls
- Roadmap/status page

## Run Locally

```bash
npm install
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Production Deployment

- Set `NEXT_PUBLIC_API_URL` to the deployed Render server URL, such as
  `https://fraudshield-api.onrender.com`.
- Build with `npm run build` and start with `npm run start`.
- Configure the server `CLIENT_URL` with the exact deployed frontend origin.
- Keep all MongoDB, JWT, Resend, and Cloudinary credentials in the server
  environment only.
- Rebuild the client whenever `NEXT_PUBLIC_API_URL` changes because public
  environment variables are embedded during the Next.js build.

## MVP Data And Fallbacks

Demo data and report drafts are stored in browser localStorage. Authenticated API data is preferred when the server is available. Use `/settings` to export, import, clear activity, or clear all local MVP data.

## Backend

The backend is maintained in a separate repository and is configured through
its own environment file. The client only needs the public API URL.

Current stack:

- JWT authentication in the Express server
- MongoDB Atlas for database
- Cloudinary for evidence file storage
- Express/Node server as a separate backend
- Client: Vercel
- Server: Render

See:

- `docs/backend-readiness.md`
- `.env.example`
