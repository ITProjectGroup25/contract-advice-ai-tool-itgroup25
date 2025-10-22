# Contract Advice AI Assistant & Referral Tool

This is a server-based online software.
Its purpose is to answer user questions more efficiently.
When running, the program opens a local webpage and allows the user to select the type of request and the required files. Depending on the complexity, an answer is provided or the question is sent to an administrator's email.
All user requests are stored in an online database and categorized by type, time, and response satisfaction, allowing for future updates and research.
The software also allows administrators to modify each question simultaneously, ensuring long-term use with minimal maintenance and the addition of new features.

# Tools and technologies used

Both frontend and backend of this software is written in **JavaScript** and **TypeScript**.
**EmailJS** is used to implement email notification.
**Supabase** is used for the online database.
**Vercel** is used to deploy the web app.

## Repository layout

- **frontend/** – Next.js client app (App Router, UI components, server actions & routes).
- **backend/** – Database schema, Drizzle connection, NextAuth configuration, Supabase/Drizzle tooling.
- **shared/** – Cross-cutting TypeScript types and any future utilities consumed by both teams.

The root `package.json` wires the three workspaces together and exposes convenience scripts that proxy to the frontend for local development.

# Code Quality

This project uses automated tools to maintain consistent code quality across the team:

### Available Scripts

```bash
# Check everything at once (recommended before push)
npm run check

# Individual checks:
npm run format:check  # Prettier formatting
npm run lint         # ESLint code quality
npm run typecheck    # TypeScript type checking
npm run format       # Auto-fix formatting issues
```

### Team Guidelines

1. **Before Push (Recommended)**: Run `npm run check` locally to catch issues early
2. **CI/CD Enforcement**: All checks run automatically on every push and PR
3. **IDE Integration**: Configure your editor to format on save (see `.editorconfig`)

### Tools Used

- **Prettier**: Code formatting (with Tailwind CSS plugin)
- **ESLint**: Code quality and style rules
- **TypeScript**: Type checking for all workspaces
- **EditorConfig**: Consistent editor settings

---

# Getting started

#### ⚠️ Requirements

- Node.js >= 18.17
- npm (comes with Node.js)
- Supabase account (for database)

#### ⚠️ Environment Files (create first)

You must create the following .env files before running the app.
These files contain sensitive information and should not be committed to GitHub.

- Root level:
  - `.env`

```bash
DATABASE_URL=your-supabase-connection-string
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000

```

- /frontend level:
  - `.env.local`

```bash
DATABASE_URL=your-supabase-connection-string
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

```

### 1. Install dependencies

```bash
npm install

```

### 2. Set up Supabase database

1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings > Database
4. Update your `.env` files with the Supabase credentials

### 3. Run database migrations

```bash
npm run db:push --workspace backend


```

This synchronises the **Drizzle schema** with your local Postgres.

### 4. Start the app

```bash
npm run dev


```

The app will be available at: [http://localhost:3000](http://localhost:3000)

### 😎 Quick startup Code

For Windows PowerShell (first line bypasses execution policy):

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
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
