import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { listSubmissions } from "@/lib/db/submissions";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { sheets_v4 } from "googleapis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

async function ensureSheets(sheets: sheets_v4.Sheets, spreadsheetId: string, expand: boolean) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const titles = new Set((meta.data.sheets ?? []).map((s) => s.properties?.title));
  const wanted = ["Submissions", ...(expand ? ["Answers", "Attachments"] : [])];

  const requests: any[] = [];
  // If there is a default sheet, rename it; otherwise create new sheets
  if (!titles.has("Submissions")) {
    if (
      meta.data.sheets?.[0]?.properties?.sheetId != null &&
      (meta.data.sheets?.length ?? 0) === 1
    ) {
      requests.push({
        updateSheetProperties: {
          properties: { sheetId: meta.data.sheets![0].properties!.sheetId!, title: "Submissions" },
          fields: "title",
        },
      });
      titles.add("Submissions");
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

// Helper: safely get a value from object by trying multiple candidate keys
function getField(obj: any, keys: string[], defaultVal: any = "") {
  if (!obj) return defaultVal;
  for (const k of keys) {
    if (!k) continue;
    if (k.includes(".")) {
      const parts = k.split(".");
      let v: any = obj;
      for (const p of parts) {
        if (v == null) break;
        v = v[p];
      }
      if (v != null) return v;
    } else {
      if (obj[k] != null) return obj[k];
    }
  }
  return defaultVal;
}

// Normalize the new table shape to the shape expected by the exporter
function normalizeSubmission(s: any) {
  // Parse form_data (may be JSON string or object)
  let fd: any = {};
  try {
    if (s?.form_data) fd = typeof s.form_data === "string" ? JSON.parse(s.form_data) : s.form_data;
  } catch (e) {
    fd = {};
  }

  const formTitleFromFormData = getField(fd, ["Form Title", "form_title", "title", "Query Type", "Form Name", "Your Name"], "");

  return {
    id: getField(s, ["submission_uid", "submissionUid", "submission_uid", "id"]),
    form_id: getField(s, ["id"]),
    form_title: formTitleFromFormData || "",
    user_id: getField(s, ["user_name", "user_name"]) || getField(s, ["user_email", "email"]),
    user_email: getField(s, ["user_email", "email"]),
    status: getField(s, ["status", "state"]),
    created_at: getField(s, ["created_at", "createdAt", "timestamp"]),
    updated_at: getField(s, ["updated_at", "updatedAt"]),
    answers: [],
    attachments: [],
    _form_data: fd,
  };
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

    const expand = sp.get("expand") === "1";
    const page = Number(sp.get("page") ?? "1");
    const pageSize = Number(sp.get("pageSize") ?? "1000");
    const orderBy = sp.get("orderBy") ?? "created_at";
    const asc = (sp.get("asc") ?? "false") === "true";
    const status = sp.get("status") as any;
    const formId = sp.get("formId") ? Number(sp.get("formId")) : undefined;
    const dateFrom = sp.get("dateFrom") ?? undefined;
    const dateTo = sp.get("dateTo") ?? undefined;

    const { data } = await listSubmissions({
      page,
      pageSize,
      orderBy,
      asc,
      status,
      formId,
      dateFrom,
      dateTo,
      expand,
    });
    const rows = (data as any[]) ?? [];

    // Use this admin's OAuth client
    const auth = await getUserOAuthClient(userId);
    const drive = google.drive({ version: "v3", auth });
    const sheets = google.sheets({ version: "v4", auth });

    // If a spreadsheetId is provided (pre-selected sheet), reuse it; otherwise create a new one
    const spreadsheetIdParam = sp.get("spreadsheetId") ?? undefined;
    const titlePrefix = sp.get("name") ?? "Submissions";

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

    await ensureSheets(sheets, spreadsheetId!, expand);

    // Submissions
    const subHeader = [
      "Submission ID",
      "Form ID",
      "Form Title",
      "User ID",
      "User Email",
      "Status",
      "Created At",
      "Updated At",
    ];
    const subValues = rows.map((s) => {
      const n = normalizeSubmission(s);
      return [
        n.id ?? "",
        n.form_id ?? "",
        n.form_title ?? "",
        n.user_id ?? "",
        n.user_email ?? "",
        n.status ?? "",
        n.created_at ?? "",
        n.updated_at ?? "",
      ];
    });
    await writeSheet(sheets, spreadsheetId!, "Submissions", subHeader, subValues);

    if (expand) {
      const ansHeader = [
        "Submission ID",
        "Answer ID",
        "Question ID",
        "Value",
        "Multi Values (JSON)",
        "Created At",
      ];
      const ansValues: any[] = [];
      // new schema stores answers inside form_data; we don't have structured answers so keep empty
      rows.forEach((s) => {
        const n = normalizeSubmission(s);
        (n.answers ?? []).forEach((a: any) => {
          ansValues.push([
            n.id ?? "",
            a.id ?? "",
            a.question_id ?? "",
            a.value ?? "",
            JSON.stringify(a.multi ?? []),
            a.created_at ?? "",
          ]);
        });
      });
      await writeSheet(sheets, spreadsheetId!, "Answers", ansHeader, ansValues);

      const attHeader = [
        "Submission ID",
        "Attachment ID",
        "File Key",
        "File Name",
        "File Size",
        "Created At",
      ];
      const attValues: any[] = [];
      rows.forEach((s) => {
        const n = normalizeSubmission(s);
        (n.attachments ?? []).forEach((f: any) => {
          attValues.push([
            n.id ?? "",
            f.id ?? "",
            f.file_key ?? "",
            f.file_name ?? "",
            f.file_size ?? "",
            f.created_at ?? "",
          ]);
        });
      });
      await writeSheet(sheets, spreadsheetId!, "Attachments", attHeader, attValues);
    }

    return NextResponse.json({
      ok: true,
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      sheetNames: expand ? ["Submissions", "Answers", "Attachments"] : ["Submissions"],
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
