# Local Setup Guide

Follow these steps to get the project running locally.

## 1. Requirements

- Node.js >= 18.17
- npm (comes with Node.js)
- Supabase account (free tier available)

## 2. Install dependencies

```bash
npm install
```

## 3. Set up Supabase database

1. Go to [Supabase](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be provisioned (usually takes 1-2 minutes)
4. Go to Settings > Database and copy your connection string
5. Note down your Project URL and anon/public key from Settings > API

## 4. Configure environment variables

Create the following files (or copy from the provided examples) and fill in the values as needed.

### Root `.env`

```
DATABASE_URL=your-supabase-connection-string
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000
```

### Frontend `.env.local`

```
DATABASE_URL=your-supabase-connection-string
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GEMINI_API_KEY=
```

**Important Notes:**

- Replace `your-supabase-connection-string` with the actual connection string from Supabase
- Replace `your-supabase-project-url` with your Project URL (e.g., https://xxxxx.supabase.co)
- Replace `your-supabase-anon-key` with your anon/public key
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- If you enable Google login, provide `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Otherwise you can leave them empty during local development.

## 5. Run database migrations

```bash
npm run db:push --workspace backend
```

This synchronises the Drizzle schema with your Supabase Postgres database.

## 6. Start the app

```bash
npm run dev
```

The app will be available at http://localhost:3000.

---

## Managing Your Database

You can manage your Supabase database through:

- **Supabase Dashboard**: Visual interface at https://app.supabase.com
- **Table Editor**: View and edit data directly
- **SQL Editor**: Run custom SQL queries
- **Database Backups**: Available in Supabase project settings
