import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { sqlClient } from "@backend";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { sheets_v4 } from "googleapis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GrantSubmissionRow = {
  id: number;
  submission_uid: string;
  query_type: "simple" | "complex";
  status: "submitted" | "processed" | "escalated";
  user_email: string | null;
  user_name: string | null;
  form_data: Record<string, any>;
  user_satisfied: boolean | null;
  needs_human_review: boolean | null;
  created_at: string;
  updated_at: string;
};

async function getUserOAuthClient(userId: string) {
  const { google } = await import("googleapis");
  // 1) Fetch this user's Google tokens from Supabase
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("user_google_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Google is not connected for this user.");
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  oauth2.setCredentials({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: new Date(data.expiry_date).getTime(),
    token_type: data.token_type,
    scope: data.scope,
  });

  // 2) If expired, refresh and write back to Supabase
  const needRefresh =
    !data.access_token || Date.now() > new Date(data.expiry_date).getTime() - 60_000;
  if (needRefresh) {
    const { credentials } = await oauth2.refreshAccessToken();

    await supabaseAdmin
      .from("user_google_tokens")
      .update({
        access_token: credentials.access_token ?? data.access_token,
        expiry_date: new Date(credentials.expiry_date ?? Date.now() + 3600_000).toISOString(),
        scope: credentials.scope ?? data.scope,
        token_type: credentials.token_type ?? data.token_type,
      })
      .eq("user_id", userId);
    oauth2.setCredentials(credentials);
  }

  return oauth2;
}

async function ensureSheets(sheets: sheets_v4.Sheets, spreadsheetId: string) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const titles = new Set((meta.data.sheets ?? []).map((s) => s.properties?.title));
  const wanted = ["Grant Support Submissions"];

  const requests: any[] = [];
  // If there is a default sheet, rename it; otherwise create new sheets
  if (!titles.has("Grant Support Submissions")) {
    if (
      meta.data.sheets?.[0]?.properties?.sheetId != null &&
      (meta.data.sheets?.length ?? 0) === 1
    ) {
      requests.push({
        updateSheetProperties: {
          properties: { sheetId: meta.data.sheets![0].properties!.sheetId!, title: "Grant Support Submissions" },
          fields: "title",
        },
      });
      titles.add("Grant Support Submissions");
    }
  }
  for (const w of wanted) {
    if (!titles.has(w)) requests.push({ addSheet: { properties: { title: w } } });
  }
  if (requests.length) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  }

  // Clear data ranges (A:Z; increase the range if you need more columns)
  for (const w of wanted) {
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${w}!A:Z` });
  }
}

async function writeSheet(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string,
  header: any[],
  rows: any[][]
) {
  // Write header row
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [header] },
  });
  if (!rows.length) return;

  // Append in chunks for large datasets
  const CHUNK = 5000;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const part = rows.slice(i, i + CHUNK);
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: part },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { google } = await import("googleapis");

    const sp = new URL(req.url).searchParams;

    // userId is required; you can also default to a test user via env
    const userId = sp.get("userId") || process.env.GOOGLE_TEST_UID;
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    // Query parameters for filtering grant_support_submissions
    const limit = Number(sp.get("limit") ?? "1000");
    const status = sp.get("status") as "submitted" | "processed" | "escalated" | undefined;
    const queryType = sp.get("queryType") as "simple" | "complex" | undefined;

    // Fetch data from grant_support_submissions table
    let query = `SELECT * FROM grant_support_submissions WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (queryType) {
      query += ` AND query_type = $${paramIndex}`;
      params.push(queryType);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const rows = (await sqlClient.unsafe(query, params)) as GrantSubmissionRow[];

    // Use this admin's OAuth client
    const auth = await getUserOAuthClient(userId);
    const drive = google.drive({ version: "v3", auth });
    const sheets = google.sheets({ version: "v4", auth });

    // If a spreadsheetId is provided (pre-selected sheet), reuse it; otherwise create a new one
    const spreadsheetIdParam = sp.get("spreadsheetId") ?? undefined;
    const titlePrefix = sp.get("name") ?? "Grant Support Submissions";

    let spreadsheetId = spreadsheetIdParam;
    if (!spreadsheetId) {
      const created = await drive.files.create({
        requestBody: {
          name: `${titlePrefix} ${new Date().toISOString().slice(0, 10)}`,
          mimeType: "application/vnd.google-apps.spreadsheet",
        },
        fields: "id, webViewLink",
      });
      spreadsheetId = created.data.id!;
    }

    await ensureSheets(sheets, spreadsheetId!);

    // Grant Support Submissions
    const header = [
      "ID",
      "Submission UID",
      "Query Type",
      "Status",
      "User Email",
      "User Name",
      "Form Data (JSON)",
      "User Satisfied",
      "Needs Human Review",
      "Created At",
      "Updated At",
    ];
    
    const values = rows.map((s: GrantSubmissionRow) => [
      s.id ?? "",
      s.submission_uid ?? "",
      s.query_type ?? "",
      s.status ?? "",
      s.user_email ?? "",
      s.user_name ?? "",
      JSON.stringify(s.form_data ?? {}),
      s.user_satisfied === null ? "" : s.user_satisfied ? "Yes" : "No",
      s.needs_human_review === null ? "" : s.needs_human_review ? "Yes" : "No",
      s.created_at ?? "",
      s.updated_at ?? "",
    ]);
    
    await writeSheet(sheets, spreadsheetId!, "Grant Support Submissions", header, values);

    return NextResponse.json({
      ok: true,
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      sheetNames: ["Grant Support Submissions"],
      count: rows.length,
    });
  } catch (err: any) {
    const gErr = err?.response?.data?.error;
    return NextResponse.json(
      {
        ok: false,
        error: gErr?.message || err?.message || "Sheets export failed",
        details: gErr || undefined,
      },
      { status: err?.response?.status || 500 }
    );
  }
}
