# Local Setup Guide

Follow these steps to get the project running locally.

## 1. Requirements

- Node.js >= 18.17
- npm (comes with Node.js)
- Docker Desktop (or Docker Engine)

## 2. Install dependencies

```bash
npm install
```

## 3. Start the Postgres container

```bash
cd docker
cp .env.example .env        # adjust credentials/port if needed
docker compose up -d
cd ..
```

The container exposes Postgres at `localhost:5432` (best to keep this port free).

## 4. Configure environment variables

Create the following files (or copy from the provided examples) and fill in the values as needed.

### Root `.env`
```
DATABASE_URL=postgres://contract_user:contract_password@localhost:5432/contract_db
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000
```

### Frontend `.env.local`
```
DATABASE_URL=postgres://contract_user:contract_password@localhost:5432/contract_db
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GEMINI_API_KEY=
```

If you enable Google login, provide `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Otherwise you can leave them empty during local development.

## 5. Run database migrations

```bash
npm run db:push --workspace backend
```

This synchronises the Drizzle schema with your local Postgres.

## 6. Start the app

```bash
npm run dev
```

The app will be available at http://localhost:3000.

---

To stop the database: `cd docker && docker compose down`. Use `docker compose down --volumes` if you want to remove data.
