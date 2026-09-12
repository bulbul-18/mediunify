# MediUnify

Phase 1 MVP scaffold: Next.js + Tailwind + Prisma, with the dashboard/timeline
screen built out as the first real page.

## What's in here

- `prisma/schema.prisma` — the core data model: `Patient`, `Document`,
  `ExtractedField`, `Session`. Matches the MVP scope (auth, upload +
  validation, timeline, symptom checker).
- `src/app/dashboard/page.tsx` — the dashboard/timeline screen, using mock
  data for now.
- `src/components/Timeline.tsx`, `src/components/ConfidenceBadge.tsx` —
  reusable pieces. Purple is reserved everywhere for AI-generated content —
  keep that convention as you build more screens.
- `src/app/globals.css` — design tokens (colors, fonts) matching the
  project report/diagrams, so everything reads as one brand.

## Running it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — it redirects straight to `/dashboard`.

## Before this is real (not just mock data)

1. **Database**: create a free Postgres database at neon.tech, copy the
   connection string into `.env` as `DATABASE_URL`, then run:
   ```bash
   npx prisma migrate dev --name init
   ```
2. **Auth**: you're handling this separately — once it's wired in, use the
   logged-in user's id as `Patient.authId` when creating/looking up a
   patient record.
3. **Fonts**: this sandbox couldn't reach Google Fonts to build, so
   `globals.css` uses system font fallbacks. On your machine or on Vercel,
   swap in `next/font/google` for Fraunces (display) and IBM Plex Sans
   (body) in `src/app/layout.tsx` for the real look — see the comment
   already left there.
4. **File storage**: for real document uploads, add Vercel Blob or Supabase
   Storage rather than storing files in the database.

## Deploying

1. Push this to a GitHub repo.
2. Import it on vercel.com — it auto-detects Next.js.
3. Add `DATABASE_URL` (and any auth env vars) in Vercel's project settings.
4. Every push to `main` auto-deploys from here on.

## What's next (in order)

1. Upload page + OCR integration (`/upload` route referenced in the
   dashboard already, not yet built)
2. Wire the validation layer (start with a hardcoded reference list of
   common drugs/dosages, upgrade to the real RxNorm API later)
3. Symptom checker page (`/symptom-checker`, also already linked)
4. Swap all mock data for real Prisma queries once auth + DB are live
