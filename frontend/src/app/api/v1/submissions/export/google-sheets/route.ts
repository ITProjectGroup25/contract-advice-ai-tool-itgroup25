// app/api/v1/submissions/export/google-sheets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { listSubmissions } from "@/lib/db/submissions";

export const runtime = "nodejs";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "").replace(/\\n/g, "\n");
  return new google.auth.JWT({
    email,
    key,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

async function ensureSheets(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  expand: boolean
) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const titles = new Set((meta.data.sheets ?? []).map(s => s.properties?.title));

  const wanted = ["Submissions", ...(expand ? ["Answers", "Attachments"] : [])];

  const requests: any[] = [];
  // If there is a default sheet, rename it; otherwise create new sheets
  if (!titles.has("Submissions")) {
    if (meta.data.sheets?.[0]?.properties?.sheetId != null && (meta.data.sheets?.length ?? 0) === 1) {
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
  sheets: ReturnType<typeof google.sheets>,
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
    const sp = new URL(req.url).searchParams;

    const expand   = sp.get("expand") === "1";
    const page     = Number(sp.get("page") ?? "1");
    const pageSize = Number(sp.get("pageSize") ?? "1000");
    const orderBy  = sp.get("orderBy") ?? "created_at";
    const asc      = (sp.get("asc") ?? "false") === "true";
    const status   = sp.get("status") as any;
    const formId   = sp.get("formId") ? Number(sp.get("formId")) : undefined;
    const dateFrom = sp.get("dateFrom") ?? undefined;
    const dateTo   = sp.get("dateTo") ?? undefined;

    const spreadsheetIdParam = sp.get("spreadsheetId") ?? undefined;
    const titlePrefix = sp.get("name") ?? "Submissions";
    const shareTo = sp.get("shareTo") ?? process.env.GDRIVE_SHARE_TO_EMAIL ?? "";

    const { data } = await listSubmissions({
      page, pageSize, orderBy, asc, status, formId, dateFrom, dateTo, expand,
    });
    const rows = (data as any[]) ?? [];

    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });
    const sheets = google.sheets({ version: "v4", auth });

    let spreadsheetId = spreadsheetIdParam;
    let createdNew = false;

    if (!spreadsheetId) {
      // No spreadsheetId provided: try creating a new file (may hit storage quota)
      try {
        const created = await drive.files.create({
          requestBody: {
            name: `${titlePrefix} ${new Date().toISOString().slice(0, 10)}`,
            mimeType: "application/vnd.google-apps.spreadsheet",
          },
          fields: "id, webViewLink",
        });
        spreadsheetId = created.data.id!;
        createdNew = true;
      } catch (e: any) {
        const msg = e?.response?.data?.error?.message || e?.message || "";
        if (msg.includes("storage quota") || msg.includes("storageQuotaExceeded")) {
          return NextResponse.json({
            ok: false,
            error: "Drive storage quota exceeded for the service account.",
            hint: "Create a blank Sheet in YOUR Drive, share it with the service account as Editor, then call this API with ?spreadsheetId=<that id>.",
            needSpreadsheetId: true,
          }, { status: 403 });
        }
        throw e;
      }
    }

    // Prepare sheets (ensure Submissions/Answers/Attachments exist, then clear data)
    await ensureSheets(sheets, spreadsheetId!, expand);

    // Main sheet
    const subHeader = [
      "Submission ID","Form ID","Form Title",
      "User ID","User Email","Status","Created At","Updated At"
    ];
    const subValues = rows.map((s) => ([
      s.id ?? "",
      s.form_id ?? s.form?.id ?? "",
      s.form?.title ?? "",
      s.user_id ?? s.user?.id ?? "",
      s.user?.email ?? "",
      s.status ?? "",
      s.created_at ?? "",
      s.updated_at ?? "",
    ]));
    await writeSheet(sheets, spreadsheetId!, "Submissions", subHeader, subValues);

    if (expand) {
      const ansHeader = ["Submission ID","Answer ID","Question ID","Value","Multi Values (JSON)","Created At"];
      const ansValues: any[] = [];
      rows.forEach((s) => {
        (s.answers ?? []).forEach((a: any) => {
          ansValues.push([
            s.id ?? "",
            a.id ?? "",
            a.question_id ?? "",
            a.value ?? "",
            JSON.stringify(a.multi ?? []),
            a.created_at ?? "",
          ]);
        });
      });
      await writeSheet(sheets, spreadsheetId!, "Answers", ansHeader, ansValues);

      const attHeader = ["Submission ID","Attachment ID","File Key","File Name","File Size","Created At"];
      const attValues: any[] = [];
      rows.forEach((s) => {
        (s.attachments ?? []).forEach((f: any) => {
          attValues.push([
            s.id ?? "",
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

    if (createdNew && shareTo) {
      try {
        await drive.permissions.create({
          fileId: spreadsheetId!,
          requestBody: { type: "user", role: "writer", emailAddress: shareTo },
          fields: "id",
        });
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      sheetNames: expand ? ["Submissions", "Answers", "Attachments"] : ["Submissions"],
      count: rows.length,
      createdNew,
    });
  } catch (err: any) {
    const gErr = err?.response?.data?.error;
    return NextResponse.json(
      { ok: false, error: gErr?.message || err?.message || "Sheets export failed", details: gErr || undefined },
      { status: err?.response?.status || 500 }
    );
  }
}
