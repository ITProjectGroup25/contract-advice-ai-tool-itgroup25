# AI Form Builder

This repository now uses an npm workspace monorepo so the frontend, backend, and shared assets can evolve independently while still sharing types and utilities.

## Repository layout

- **frontend/** – Next.js client app (App Router, UI components, server actions & routes).
- **backend/** – Database schema, Drizzle connection, NextAuth configuration, Supabase/Drizzle tooling.
- **shared/** – Cross-cutting TypeScript types and any future utilities consumed by both teams.

The root `package.json` wires the three workspaces together and exposes convenience scripts that proxy to the frontend for local development.

## Getting started

```bash
npm install          # installs all workspaces
npm run dev          # starts the Next.js dev server from ./frontend
npm run lint         # runs next lint in the frontend workspace
npm run typecheck    # tsc --noEmit for shared, backend, then frontend
```

> ℹ️  `npm run typecheck` currently surfaces several historical typing gaps inside the frontend codebase (e.g. form builder helpers). These pre-existing issues were not addressed in this restructuring pass.

## Additional tooling

- Backend database tooling lives under `backend/` – use `npm run db:generate`, `npm run db:migrate`, or `npm run db:push` from the repository root.
- Shared types exposed via `@shared` can be authored in `shared/src/` and consumed from both the Next.js app (`@shared/...`) and backend (`@shared/...`).

With this layout the frontend and backend teams can iterate without stepping on each other, while shared contracts stay in one place.
