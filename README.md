# GEText — Lyrics Rehearsal Web App

A mobile-first lyrics rehearsal app built with **Next.js 16**, **Tailwind CSS 4**, and **Sanity 6** (Studio embedded at `/admin`).

## Features
- **Song** (`song`): `title` + `verseLines` (ordered list of lines)
- **Playlist** (`playlist`): `title` (event name) + `songs` (ordered references to songs)
- **Rehearsal mode**: starts on the title. Try to sing the next line, then tap **Next →** to check. **← Prev** goes back one line. In a playlist you can jump straight to the next song.

## Setup
1. Create a Sanity project at [sanity.io/manage](https://www.sanity.io/manage) (dataset `production`), then create `.env.local`:
   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_SANITY_DATASET="production"
   ```
2. In Sanity manage → **API → CORS origins**, add `http://localhost:3000` and your Vercel URL, with **Allow credentials** turned on.
3. `npm run dev`. The app runs at http://localhost:3000 and the Studio at http://localhost:3000/admin.
4. Deploy: import the repo in Vercel and add the same two env vars.

## About `npm audit`
The remaining advisories come from Sanity's CLI/build tooling (`@sanity/cli`, vite, oclif, glob helpers). Those packages run on your machine and at build time; none of them are shipped to the browser. `npm audit fix --force` "fixes" them by **downgrading** `sanity` to an older major version, so don't run it.
