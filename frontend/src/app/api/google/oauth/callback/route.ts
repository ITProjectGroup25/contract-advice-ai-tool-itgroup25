import 'server-only';

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";


export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

/**
 * Environment variables:
 * GOOGLE_CLIENT_ID
 * GOOGLE_CLIENT_SECRET
 * GOOGLE_REDIRECT_URI = https://<your-domain>/api/google/oauth/callback
 *
 * On callback we use the URL `state` to carry the in-app userId
 * e.g. /api/google/oauth/start?userId=<uuid>
 */
export async function GET(req: NextRequest) {
  try {

    const { google } = await import('googleapis');

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const userId = searchParams.get("state");


    if (!code || !userId) {
      return NextResponse.json({ error: "Missing code or state(userId)" }, { status: 400 });
    }

    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );

    // Exchange the authorization code for tokens
    const { tokens } = await oauth2.getToken(code);

    // A first-time consent should include a refresh_token; if it's missing,
    // it's usually because prompt=consent wasn't used or the user had already granted access.
    if (!tokens.refresh_token) {
      return NextResponse.json(
        {
          error: "No refresh_token returned",
          hint: "Ensure your start URL uses access_type=offline & prompt=consent, or revoke previous grant and try again.",
        },
        { status: 400 }
      );
    }

    const expiryIso = tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : new Date(Date.now() + 3600_000).toISOString();

    // Persist with supabaseAdmin
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("user_google_tokens")
      .upsert(
        {
          user_id: userId,
          access_token: tokens.access_token ?? "",
          refresh_token: tokens.refresh_token ?? "",
          expiry_date: expiryIso,
          scope: tokens.scope ?? "",
          token_type: tokens.token_type ?? "Bearer",
        },
        { onConflict: "user_id" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // redirect back to frontend page 
    const back = new URL(`/settings/integrations?google=connected`, req.url);
    return NextResponse.redirect(back);
  } catch (e: any) {
    const g = e?.response?.data?.error;
    return NextResponse.json(
      { error: g?.message || e?.message || "OAuth callback failed", details: g || undefined },
      { status: e?.response?.status || 500 }
    );
  }
}
