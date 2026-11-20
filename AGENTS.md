# AGENTS.md

Persistent instructions and project conventions for AI coding agents working in **GEText**.

## Project Overview
- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Sanity 6 (embedded Studio at `/admin`).
- **Purpose**: Mobile-first lyrics rehearsal web app for choir practice.

## Next.js Version Notice
- This project uses **Next.js 16**, which may be newer than your training data. Do not rely on memory for Next.js APIs, routing, caching, or configuration—check the official Next.js docs (or `node_modules/next/dist/docs/` if present) for current best practices and breaking changes before making framework-level changes.

## Code & UI Conventions
- Keep functions and React components small, single-purpose, and easy to read. Extract hooks or subcomponents when a file grows.
- **Theme**: Slightly warm grey (`stone`) with muted warm `amber` accents, supporting both light and dark modes (`dark:` classes via `ThemeToggle`). Avoid harsh pure black/white or blue-tinted greys.
- **Routes**: Use real App Router URLs with Sanity `slug`s (`/songs/[slug]`, `/playlists/[slug]`, `/playlists/[slug]/[songSlug]`) rather than single-page state, so mobile browser Back navigation works naturally.
- **Sanity**:
  - Schemas live in `src/sanity/schemaTypes/`.
  - `Choir` (`CHOIR_VOICE_TYPE_ID = 'voiceType-choir'`) is ensured automatically in `/admin` via `ensureChoirPlugin`.
  - Voice type inheritance: line-level `voiceTypes` override verse-level `voiceTypes`; if neither is set, the line defaults to `Choir`.

## Verification
- Run `npx tsc --noEmit` after edits to verify TypeScript.
- Note: On Windows, `npx next build --webpack` can be used if Turbopack hits local CSS worker issues.

## Custom Instructions
<!-- Add your own persistent rules below -->
