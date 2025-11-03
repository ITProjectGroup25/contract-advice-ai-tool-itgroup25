// app/api/v1/submissions/export/xlsx-sheets/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { sqlClient } from "@backend";

// XLSX needs Node (Buffer). Ensure server runtime.
export const runtime = "nodejs";

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

export async function GET(req: NextRequest) {
  try {
    const sp = new URL(req.url).searchParams;

    // Query parameters for filtering grant_support_submissions
    const limit = Number(sp.get("limit") ?? "1000");
    const status = sp.get("status") as "submitted" | "processed" | "escalated" | undefined;
    const queryType = sp.get("queryType") as "simple" | "complex" | undefined;

    // Optional: customize filename prefix via ?name=
    const name = sp.get("name") ?? "grant_support_submissions";

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

    const data = (await sqlClient.unsafe(query, params)) as GrantSubmissionRow[];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Grant Support Submissions
    {
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

      const rows = data.map((s: GrantSubmissionRow) => [
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

      const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "Grant Support Submissions");
    }

    // Serialize workbook and return as downloadable attachment
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const fileName = `${name}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "ExportFailed", message: err?.cause?.message ?? err?.message },
      { status: 500 }
    );
  }
}
