# Local Postgres via Docker

This folder contains a minimal Docker setup so every teammate can spin up the Postgres instance the app expects.

## Prerequisites

- Docker Desktop (or any Docker Engine) installed and running
- Node.js tooling for the project already set up (
pm install in repo root)

## Usage

1. Copy the example env file and adjust if needed:

   `ash
   cd docker
   cp .env.example .env
   # Optionally edit .env to change credentials/port
   `

2. Start the database container:

   `ash
   docker compose up -d
   `

   The container exposes localhost:5432 by default. Data is persisted in the named volume postgres-data.

3. Point the app to this database by setting DATABASE_URL in your project .env (at repo root):

   `nv
   DATABASE_URL=postgres://contract_user:contract_password@localhost:5432/contract_db
   `

4. Run migrations (from repo root) once the container is healthy:

   `ash
   npm run db:push --workspace backend
   `

5. Start the app as usual:

   `ash
   npm run dev
   `

## Maintenance

- Stop the container: docker compose down
- Stop and remove data volume: docker compose down --volumes
- View logs: docker compose logs -f postgres

If you later switch to Supabase or another managed Postgres, simply update your DATABASE_URL and you can skip this Docker setup.
