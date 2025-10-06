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

# Deployment Guide

## Prerequisite

#### ⚠️ Requirements

Local setup
- Node.js >= 18.17.0
- npm >= 8.0.0
- Git >= 2.30.0
- Docker Desktop (for local dev)

Service Accounts
- Vercel
- Supabase
- Google Cloud Console (for Gemini API)
- GitHub

#### ⚠️  Environment Variables

|Variable|Scope|Description|Example|
|-----|-----|-----|-----|
| `DATABASE_URL` | All | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | All | Secret for NextAuth | `your-32-char-secret` |
| `NEXTAUTH_URL` | All | App base URL | `https://yourdomain.vercel.app` |
| `GOOGLE_CLIENT_ID` | All | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | All | Google OAuth client secret | `GOCSPX-xxxxx` |
| `GEMINI_API_KEY` | All | Google Gemini API key | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `NEXT_PUBLIC_BASE_URL` | Frontend | Public base URL | `https://yourdomain.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32


```

or

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"


```
## Local Development Setup

#### 1. Clone Repository

go to the location you want to store the clone first

```bash
git clone https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25.git
cd contract-advice-ai-tool-itgroup25


```

#### 2. Install Dependencies

```bash
npm install


```

#### 3. Start Local Database

```bash
cd docker
# edit docker/.env if needed (default credentials provided)
docker compose up -d
cd ..


```

#### 4. Configure Environment Variables

under Root create `.env` file with content

```bash
DATABASE_URL=postgres://contract_user:contract_password@localhost:5432/contract_db
NEXTAUTH_SECRET=local-secret-key
NEXTAUTH_URL=http://localhost:3000


```

under `FrontEnd` create `.env.local` file with Environment Variables under __Environment Variables__ section

```bash
DATABASE_URL=postgres://contract_user:contract_password@localhost:5432/contract_db
NEXTAUTH_SECRET=local-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key


```

#### 5. Run Database Migration

```bash
npm run db:push --workspace backend


```

#### 6. Start Dev Server

```bash
npm run dev


```
App runs at: http://localhost:3000

## Production Deployment

#### 1. Supabase Setup

1. Log in to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project, set project name & password
3. Choose a region close to your users

Retrieve connection info:

- DATABASE_URL: Settings → Database → Connection string
- SUPABASE_URL: Project Settings → API URL
- SUPABASE_ANON_KEY: Project Settings → anon public key

#### 2. Vercel Deployment (Monorepo)

Automatic Deployment (Recommended)

1. Link GitHub repository to Vercel
2. Add all required environment variables (see table above)
3. Configure project settings (choose one of the following):
   - Option A (recommended for simplicity)
      - Root Directory: Repository root
      - Install Command: `npm install`
      - Build Command: `npm run build --workspace frontend`
      - Output Directory: leave default
   - Option B (root points to `frontend`)
      - Root Directory: frontend
      - Install Command: cd .. && npm install (to install all workspaces)
      - Build Command: npm run build
      - Output Directory: default (Next.js handles automatically)

Manual Deployment

```bash
npm i -g vercel
vercel login
vercel --prod


```

#### 3. GitHub Actions – CI/CD

Required GitHub Secrets
Add the following to [**GitHub** → **Repo** → **Settings** → **Secrets and variables** → **Actions**](https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25/settings/secrets/actions)

```bash
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Supabase
SUPABASE_ACCESS_TOKEN=your-supabase-token
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_DB_PASSWORD=your-db-password
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key


```

CI/CD Flow

```bash
Push to main branch → 
  Frontend CI (lint, typecheck, build) → 
  Supabase CI (validate, migrate) → 
  Deploy to Vercel


```

## Service Configurations

**Google OAuth**

1. Open Google Cloud Console
2. Create a new project or select existing
3. Configure OAuth consent screen
4. Create new OAuth 2.0 client ID (type: Web application)
5. Add redirect URIs:

```bash
http://localhost:3000/api/auth/callback/google  (dev)
https://yourdomain.vercel.app/api/auth/callback/google (prod)


```

**Google Gemini API (Optional)**

1. Enable Generative AI API
2. Generate API key
3. Configure quotas and limits

**EmailJS (Optional)**

1. Register at [EmailJS](https://www.emailjs.com/)
2. Create email service & template
3. Obtain Public Key & Service ID

## Monitoring & Maintenance

**Performance Monitoring**
- **Vercel Analytics**: built-in page performance monitoring
- **Supabase Dashboard**: DB performance & usage
- **GitHub Actions**: build & deploy status

**Log Access**

```bash
# Vercel logs
vercel logs [deployment-url]

# Supabase logs
Dashboard → Logs

# Local development
npm run dev        # app logs
docker compose logs -f postgres  # DB logs


```

**Regular Maintenance**

- Monthly dependency updates
- Quarterly DB backups
- Monitor API quota usage
- Review security scan reports


## Troubleshooting

**Common Issues**

1. Build Failure

```bash
npm run typecheck --workspace frontend
npm run lint --workspace frontend
rm -rf frontend/.next
npm run build --workspace frontend


```

2. Database Connection Issues

```bash
# Verify connection string
DATABASE_URL=postgresql://username:password@host:port/database

# Test local DB
docker compose exec postgres psql -U contract_user -d contract_db


```

3. Environment Variable Issues

```bash
# Debug in code
console.log(process.env.DATABASE_URL)

# Vercel env check
vercel env ls

# Local env check
cat .env
cat frontend/.env.local


```

4. Deployment Failure

```bash
vercel logs
# Check GitHub Actions logs in the "Actions" tab


```

**Rollback Strategy**

```bash
# Vercel rollback
vercel rollback [deployment-url]

# Git rollback
git revert HEAD
git push origin main

# Database rollback
# Prefer using Supabase backups or custom SQL down scripts


```

# Helpful links
Private [Development workflow](https://itgroup25.atlassian.net/wiki/spaces/ITgroup25/folder/25919489)
Private [Design Artefacts](https://itgroup25.atlassian.net/wiki/spaces/ITgroup25/folder/11862053)

## Additional tooling

- Backend database tooling lives under `backend/` – use `npm run db:generate`, `npm run db:migrate`, or `npm run db:push` from the repository root.
- Shared types exposed via `@shared` can be authored in `shared/src/` and consumed from both the Next.js app (`@shared/...`) and backend (`@shared/...`).

With this layout the frontend and backend teams can iterate without stepping on each other, while shared contracts stay in one place.


# release note
### 0.1.1 Alpha release
release date:2025.10.2
ChatBot logic included (not implemented)
CICD pipelind basic
Further Database development
Online preview page inside the github "About" section

Edit:settup guide is changed due to bringing the site online, check above __Deployment Guide__ section

### 0.1.0 Alpha release
release date:2025.9.28
A basic website framework and most of the features described
Include most importantly the form and question editing feature

