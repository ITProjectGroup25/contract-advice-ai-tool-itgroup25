# Contract Advice AI Assistant & Referral Tool

This is a server-based online software.
Its purpose is to answer user questions more efficiently.
When running, the program opens a local webpage and allows the user to select the type of request and the required files. Depending on the complexity, an answer is provided or the question is sent to an administrator's email.
All user requests are stored in an online database and categorized by type, time, and response satisfaction, allowing for future updates and research.
The software also allows administrators to modify each question simultaneously, ensuring long-term use with minimal maintenance and the addition of new features.

# Tools and technologies used

Both frontend and backend of this software is written in __JavaScript__ and __TypeScript__.
__EmailJS__ is used to implement email notification.
__Supabase__ is used for the online database.
__Vercel__ is used to deploy the web app.


## Repository layout

- **frontend/** – Next.js client app (App Router, UI components, server actions & routes).
- **backend/** – Database schema, Drizzle connection, NextAuth configuration, Supabase/Drizzle tooling.
- **shared/** – Cross-cutting TypeScript types and any future utilities consumed by both teams.

The root `package.json` wires the three workspaces together and exposes convenience scripts that proxy to the frontend for local development.

# Getting started

#### ⚠️ Requirements

- Node.js >= 18.17
- npm (comes with Node.js)
- Docker Desktop (or Docker Engine)

#### ⚠️ Environment Files (create first)

You must create the following .env files before running the app.
These files contain sensitive information and should not be committed to GitHub.

- Root level:
  - `.env`
```bash
DATABASE_URL=postgres://contract_user:contract_password@localhost:5432/contract_db
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000

```

- /frontend level:
  - `.env.local`
```bash
DATABASE_URL=postgres://contract_user:contract_password@localhost:5432/contract_db
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000

```

- /docker level:
  - `.env`
```bash
POSTGRES_USER=contract_user
POSTGRES_PASSWORD=contract_password
POSTGRES_DB=contract_db

```

### 1. Install dependencies

```bash
POSTGRES_USER=contract_user
POSTGRES_PASSWORD=contract_password
POSTGRES_DB=contract_db


```

### 2. Start the Postgres container

```bash
cd docker
docker compose up -d
cd ..


```
The container exposes Postgres at __localhost:5432__ (keep this port free if possible).

### 3. Run database migrations

```bash
npm run db:push --workspace backend


```
This synchronises the __Drizzle schema__ with your local Postgres.

### 4. Start the app

```bash
npm run dev


```

The app will be available at: [http://localhost:3000](http://localhost:3000)

### 6. Stop the database

```bash
cd docker
docker compose down


```
To remove data as well:
```bash
docker compose down --volumes


```
### 😎Additional: Han's quick startup Code
first line for terminal limit bypass
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
cd docker
docker compose up -d
cd ..
npm run db:push --workspace backend
npm run dev


```
# Helpful links
Private [Development workflow](https://itgroup25.atlassian.net/wiki/spaces/ITgroup25/folder/25919489)
Private [Design Artefacts](https://itgroup25.atlassian.net/wiki/spaces/ITgroup25/folder/11862053)

## Additional tooling

- Backend database tooling lives under `backend/` – use `npm run db:generate`, `npm run db:migrate`, or `npm run db:push` from the repository root.
- Shared types exposed via `@shared` can be authored in `shared/src/` and consumed from both the Next.js app (`@shared/...`) and backend (`@shared/...`).

With this layout the frontend and backend teams can iterate without stepping on each other, while shared contracts stay in one place.


# release note
### 0.1.0 Alpha release
release date:2025.9.28
A basic website framework and most of the features described

