# FraudShield BD Client

FraudShield BD is a community safety MVP for reporting scams, checking suspicious identifiers, browsing approved reports, and tracking personal report/watchlist activity.

## Current Status

This repo is currently the Next.js client MVP. Most data is still stored in browser localStorage so the product flow can be tested before the backend is connected.

Completed client flows:

- Home community newsfeed
- Check Before You Pay
- Browse Reports with filters and CSV export
- Report Fraud form with draft saving
- Report detail pages
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

## MVP Data

The frontend MVP stores demo data in browser localStorage. Use `/settings` to export, import, clear activity, or clear all local MVP data.

## Backend Plan

Backend work will be separate from this client and should start only after confirming credentials and hosting decisions.

Planned stack:

- Better Auth for authentication
- MongoDB Atlas for database
- Cloudinary for evidence file storage
- Express/Node server as a separate backend
- Client/server deployed separately

See:

- `docs/backend-readiness.md`
- `.env.example`
