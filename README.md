## 📑 Catalog
- [Contract Advice AI Assistant & Referral Tool](#Contract-Advice-AI-Assistant--Referral-Tool)
- [System Architecture Overview](#System-Architecture-Overview)
- [Tools and technologies used](#Tools-and-technologies-used)
- [Deployment Guide](#Deployment-Guide)
- [Release Note](#Release-Note)

# Contract Advice AI Assistant & Referral Tool

This is a server-based online software — the RIC form builder application — built using Next.js, Next-auth, Shadcn UI, Drizzle, PostgreSQL, and TypeScript. 

Its purpose is to answer user questions more efficiently. When running, the program operates a webpage and allows the user to select the type of request and the required files, or to easily create customized forms by providing prompts, and the forms can be published for others to fill out. Depending on the complexity, an answer is provided or the question is sent to an administrator's email. 

All user requests and form responses are stored in an online database and categorized by type, time, and response satisfaction, allowing for future updates and research. The admin of the form can access and view all responses submitted, and the software also allows administrators to modify each question simultaneously, ensuring long-term use with minimal maintenance and the addition of new features.

## Features

- **AI-Powered Form Creation**: Users can create forms by simply providing prompts, and the AI generates the necessary form fields based on the prompts.
- **Authentication**: Next-auth is integrated for secure authentication, allowing users to sign up, sign in, and manage their accounts.
- **Responsive Design**: Shadcn UI ensures that the application is responsive and looks great across various devices and screen sizes.
- **Admin Dashboard**: Admin users have access to a dashboard where they can view all responses submitted to their forms.
- **Persistent Data Storage**: PostgreSQL is used as the database to store form configurations, user information, and form responses securely.
- **Theme Customization**: The app offers six different themes for users to choose from, allowing them to customize the appearance of their app interface.
- **Type Safety**: TypeScript is employed throughout the project to provide type safety and enhance code maintainability.

# System Architecture Overview

```bash
┌─────────────────┐     ┌──────────────────┐   ┌─────────────────┐
│     Vercel      │     │  GitHub Actions  │   │     Supabase    │
│  (Frontend)     │◄────┤      (CI/CD)     ├──►│    (Database)   │
│   Next.js App   │     │                  │   │    PostgreSQL   │
└─────────────────┘     └──────────────────┘   └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Production Environment                      │
└─────────────────────────────────────────────────────────────────┘
```

# Tools and technologies used

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Next.js API Routes + Drizzle ORM (co-located with frontend)
- **Database**: PostgreSQL (local via Docker / hosted on Supabase)
- **Authentication**: NextAuth.js (Google OAuth)
- **Deployment**: Vercel (app) + Supabase (database)
- **CI/CD**: GitHub Actions (frontend build & DB migration)

## Repository layout

- **frontend/** – Next.js client app (App Router, UI components, server actions & routes).
- **backend/** – Database schema, Drizzle connection, NextAuth configuration, Supabase/Drizzle tooling.
- **shared/** – Cross-cutting TypeScript types and any future utilities consumed by both teams.

The root `package.json` wires the three workspaces together and exposes convenience scripts that proxy to the frontend for local development.

# Deployment Guide

## Prerequisite

#### Requirements

Local setup
- Node.js >= 18.17.0
- npm >= 8.0.0
- Git >= 2.30.0
- Docker Desktop (for local dev)

Service Accounts
- Vercel
- Supabase
- GitHub

####  Environment Variables

|Variable|Scope|Description|Example|
|-----|-----|-----|-----|
| `DATABASE_URL` | All | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | All | Secret for NextAuth | `your-32-char-secret` |
| `NEXTAUTH_URL` | All | App base URL | `https://yourdomain.vercel.app` |

| `NEXT_PUBLIC_BASE_URL` | Frontend | Public base URL | `https://yourdomain.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `ADMIN_API_TOKEN` | Backend | Admin API authentication token | `64-char-random-string` |

**Google OAuth**:

|Variable|Scope|Description|Example|
|-----|-----|-----|-----|
| `GOOGLE_CLIENT_ID` | All | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | All | Google OAuth client secret | `GOCSPX-xxxxx` |
| `GOOGLE_REDIRECT_URI` | All | OAuth callback URL | `https://yourdomain.vercel.app/api/google/oauth/callback` |

**EmailJS **:

|Variable|Scope|Description|Example|
|-----|-----|-----|-----|
| `NEXT_PUBLIC_EMAILJS_ENABLED` | Frontend | Enable email notifications | `true` or `false` |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Frontend | EmailJS public key | `your-public-key` |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Frontend | EmailJS service ID | `service_xxxxx` |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Frontend | User confirmation template ID | `template_xxxxx` |
| `NEXT_PUBLIC_EMAILJS_GRANT_TEAM_TEMPLATE_ID` | Frontend | Grant team notification template ID | `template_xxxxx` |

**Generate Secrets**:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ADMIN_API_TOKEN (64 characters)
openssl rand -hex 32

# Or using Node.js
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

Create `.env` file in the **root directory**:

```bash
# Database
DATABASE_URL=postgres://contract_user:contract_password@localhost:5432/contract_db

# Authentication
NEXTAUTH_SECRET=local-secret-key
NEXTAUTH_URL=http://localhost:3000

# Supabase (use remote for quick start)
NEXT_PUBLIC_SUPABASE_URL=https://lfedmwfgftpkknllchxr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZWRtd2ZnZnRwa2tubGxjaHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzNjcwNDcsImV4cCI6MjA0NTk0MzA0N30.U_EqFTx9cNKemKjIzG05nU7pPAqb-rznz9t8fSxMrGg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZWRtd2ZnZnRwa2tubGxjaHhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDM2NzA0NywiZXhwIjoyMDQ1OTQzMDQ3fQ.DKL4kCtMFqVNLsxLMb2EY9KCjvbr_6BxeUV7j_uR74g

# Admin Token
ADMIN_API_TOKEN=dev-admin-token-12345

# Google OAuth (optional for local dev)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/oauth/callback

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

> 💡 **Tip**: For quick local development, you can use the remote Supabase credentials provided above.

#### 5. Run Database Migration

**⚠️ Important**: If using Supabase, it's recommended to execute SQL migration files directly in Supabase SQL Editor.

**Two Migration Methods**:

**Method A: Using Drizzle Kit** (for local database)

```bash
npm run db:push --workspace backend
```

**Method B: Manual SQL Execution** (recommended for Supabase)

Execute the following SQL files in order via Supabase SQL Editor:

1. `backend/drizzle/0001_gorgeous_thor.sql` - Update foreign key constraints
2. `backend/drizzle/0002_lean_fabian_cortez.sql` - Create core business tables (30+ tables)
3. `backend/drizzle/0003_hot_piledriver.sql` - Create referral_submissions table
4. `backend/drizzle/0004_add_admin_password.sql` - Create admin_password table and function
5. `backend/drizzle/0005_add_missing_tables.sql` - Create missing core tables (grant_support_submissions, user_google_tokens, email_config, etc.)

**Verification**: After migration, verify all core tables exist:

```sql
-- Run in Supabase SQL Editor to verify
SELECT table_name, '✅' as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'grant_support_submissions',
        'user_google_tokens',
        'admin_password',
        'email_config',
        'grant_support_faqs',
        'form',
        'form_details',
        'form_results'
    )
ORDER BY table_name;
```

Expected result: 8 rows showing ✅ status

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
2. Add all required environment variables (see table above):
   - ✅ All variables from the **Environment Variables** section
   - ✅ Generate `ADMIN_API_TOKEN` using: `openssl rand -hex 32`
   - ✅ Set `NODE_ENV=production`
   - ⚠️ **Important**: Never use default/demo credentials in production!
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
Add the following to [GitHub → Repo → Settings → Secrets and variables → Actions or **click this for link**](https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25/settings/secrets/actions)

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

## After deployment setup and future updates


#### 1. Website End Email Config

1. Open website, click Access **Referral Assistant** button

<div align="center">
         <img src="readMePictures/afterDeploymentSetupPicture/Form-Builder.png" width="600">
</div>

2. Go into form page, on the upper right, there is the admin Panel, enter password.

   - **Default Password**: `12345`


<div align="center">
         <img src="readMePictures/afterDeploymentSetupPicture/Form-Builder3.png" width="600">
</div>

3. Click **Email Configuration**

<div align="center">
         <img src="readMePictures/afterDeploymentSetupPicture/Form-Builder4.png" width="600">
</div>


4. Under **Email Configuration**, there are 5 areas need to be filled.

<div align="center">

|Name|Use|
|-----|-----|
|Service ID|This decide which Email address the notifications will be sent from |
|Public Key|This links you between this website and EmailJS account |
|User Confirmation Template ID|This decide what the email to User will look like |
|Grant Team Email|This is the email address that will receive the query notification |
|Grant Team Template ID|This decide what the email to Grant Team will look like  |

</div>

#### 2. Email JS


1. Signup an [EmailJS account](https://www.emailjs.com/)
<div align="center">
         <img src="readMePictures/afterDeploymentSetupPicture/EmailJS.png" width="600">
</div>
3. Go to [Account→General→API Key→Public Key](https://dashboard.emailjs.com/admin/account), get **Public Key**
<div align="center">
         <img src="readMePictures/afterDeploymentSetupPicture/EmailJS1.png" width="600">
</div>
4. Go to [Email Service, add a New Service](https://dashboard.emailjs.com/admin)
<div align="center">
         <img src="readMePictures/afterDeploymentSetupPicture/EmailJS2.png" width="600">
</div>
5. Choose which Email service account you want to sent the email with and finish authorising, get **Service ID**
<div align="center">
         <img src="readMePictures/afterDeploymentSetupPicture/EmailJS5.png" width="600">
</div>
6. Go to Email Templates, you will need **2** template, one for **you, the grant team** and one for **users of the website**
<div align="center">
         <img src="readMePictures/afterDeploymentSetupPicture/EmailJS10.png" width="600">
</div>
7. Go to the Setting of template, copy the **Template ID**, the one for User as **User Confirmation Template ID** and one for Grant Team as **Grant Team Template ID**
<div align="center">
         <img src="readMePictures/afterDeploymentSetupPicture/EmailJS9.png" width="600">
</div>
8. Edit the template, you can adjust as you need and include further information, here are the two standard template to start with
<div align="center">
         <img src="readMePictures/afterDeploymentSetupPicture/EmailJS8.png" width="600">
</div>

To User

```bash
Dear {{to_name}},
Thank you for submitting your {{query_type}} query to our referral system.  
Below are the details of your submission:
--------------------------------------------------
Submission ID : {{submission_id}}
Query Type    : {{query_type}}
Date Submitted: {{submission_date}} at {{submission_time}}
--------------------------------------------------
Your request is now being processed.  
We will contact you if we need any additional information.
For future reference, please keep your Submission ID: {{submission_id}}.
Best regards,  
Referral Team
 
---This is an automated message. Please do not reply to this email.

```

To Grant team

```bash
Dear {{to_name}},
A new query submission requires your attention:
📋 **Submission Details**
• Submission ID: {{submission_id}}
• Submission Time: {{submission_date}} {{submission_time}}
• Query Type: {{query_type}}
👤 **User Information**
• User Name: {{user_name}}
• User Email: {{user_email}}
📝 **Form Data**
{{form_data}}
Please process this inquiry as soon as possible. If you have any questions, please contact the system administrator.
---
This email was automatically sent by the form submission system
Submission ID: {{submission_id}}

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

## Testing

For testing, try following command

```bash
npm run test


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

## Helpful links
Private [Development workflow](https://itgroup25.atlassian.net/wiki/spaces/ITgroup25/folder/25919489)

Private [Design Artefacts](https://itgroup25.atlassian.net/wiki/spaces/ITgroup25/folder/11862053)

# Release Note
### 0.1.1 Edit
- release date:2025.10.2
- ChatBot logic included (not implemented)
- CICD pipelind basic
- Further Database development
- Online preview page inside the github "About" section
- Edit:settup guide is changed due to bringing the site online, check above __Deployment Guide__ section

### 0.1.0 Alpha release
- release date:2025.9.28
- A basic website framework and most of the features described
- Include most importantly the form and question editing feature

