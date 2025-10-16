# Vercel Environment Variables Setup

This document lists all environment variables that must be configured in the Vercel project dashboard for successful cloud builds.

## Required Environment Variables

### Supabase Configuration

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Type: Public (exposed to client)
   - Description: Supabase project URL
   - Example: `https://xxxxxxxxxxxxx.supabase.co`
   - Source: Supabase Dashboard > Settings > API

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Type: Public (exposed to client)
   - Description: Supabase anonymous/public API key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Source: Supabase Dashboard > Settings > API > anon/public key

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Type: Secret (server-side only)
   - Description: Supabase service role key for admin operations
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Source: Supabase Dashboard > Settings > API > service_role key
   - **WARNING**: Never expose this key to the client

### Google OAuth (for Sheets Export)

4. **GOOGLE_CLIENT_ID**
   - Type: Secret
   - Description: Google OAuth 2.0 client ID
   - Source: Google Cloud Console > APIs & Services > Credentials

5. **GOOGLE_CLIENT_SECRET**
   - Type: Secret
   - Description: Google OAuth 2.0 client secret
   - Source: Google Cloud Console > APIs & Services > Credentials

6. **GOOGLE_REDIRECT_URI**
   - Type: Secret
   - Description: OAuth callback URL
   - Example: `https://your-domain.vercel.app/api/google/oauth/callback`

### EmailJS Configuration (if used)

7. **NEXT_PUBLIC_EMAILJS_PUBLIC_KEY**
   - Type: Public
   - Description: EmailJS public key
   - Source: EmailJS Dashboard

8. **NEXT_PUBLIC_EMAILJS_SERVICE_ID**
   - Type: Public
   - Description: EmailJS service ID
   - Source: EmailJS Dashboard

9. **NEXT_PUBLIC_EMAILJS_TEMPLATE_ID**
   - Type: Public
   - Description: EmailJS template ID for user confirmation
   - Source: EmailJS Dashboard

10. **NEXT_PUBLIC_EMAILJS_GRANT_TEAM_TEMPLATE_ID**
    - Type: Public
    - Description: EmailJS template ID for grant team notifications
    - Source: EmailJS Dashboard

## How to Configure in Vercel

### Via Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `SUPABASE_SERVICE_ROLE_KEY`)
   - **Value**: The actual value
   - **Environment**: Select `Production`, `Preview`, and `Development` as needed
4. Click **Save**

### Via Vercel CLI

```bash
# Set a single variable
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Pull environment variables to local
vercel env pull .env.local
```

## CI/CD Behavior

With the updated CI/CD configuration:

1. **Local Build Removed**: The GitHub Actions workflow no longer builds the project locally
2. **Cloud Build**: Vercel performs the build in its cloud environment
3. **Environment Variables**: Vercel automatically injects the configured environment variables during the cloud build
4. **No Secrets in GitHub**: Environment variables are not passed from GitHub Actions secrets (except `VERCEL_TOKEN`)

## Verification

After configuring all variables:

1. Trigger a deployment (push to `main` branch)
2. Check Vercel deployment logs for any missing environment variable errors
3. Test the deployed application to ensure all features work:
   - Form submission
   - Database operations
   - Google Sheets export (if applicable)
   - Email notifications

## Security Notes

- Never commit `.env` files with real values to Git
- Use `.env.local` for local development (gitignored by default)
- Rotate keys regularly, especially `SUPABASE_SERVICE_ROLE_KEY`
- Use different keys for production and development/staging environments

## Troubleshooting

If deployment fails:

1. Check Vercel deployment logs for "Missing environment variable" errors
2. Verify all variables are set in Vercel dashboard
3. Ensure variable names match exactly (case-sensitive)
4. Rebuild the deployment after adding missing variables
