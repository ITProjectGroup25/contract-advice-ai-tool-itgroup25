import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const userId = sp.get("userId")!;
  if (!userId) return NextResponse.json({ error: "missing userId" }, { status: 400 });

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets"
  ];

  const url = oauth2.generateAuthUrl({
    access_type: "offline",    // Request a refresh token
    prompt: "consent",         // Force consent to obtain refresh_token (first time or when scopes change)
    scope: scopes,
    state: userId,             // Echoed back on callback to identify which in-app user this is
  });
  return NextResponse.redirect(url);
}
