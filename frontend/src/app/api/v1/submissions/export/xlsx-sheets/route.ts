// app/api/v1/submissions/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { listSubmissions } from "@/lib/db/submissions";

// XLSX needs Node (Buffer). Ensure server runtime.
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const sp = new URL(req.url).searchParams;

    // Reuse the same query parameters as /api/v1/submissions
    const expand = sp.get("expand") === "1";
    const page = Number(sp.get("page") ?? "1");
    const pageSize = Number(sp.get("pageSize") ?? "20");
    const orderBy = sp.get("orderBy") ?? "created_at";
    const asc = (sp.get("asc") ?? "false") === "true";
    const status = sp.get("status") as any;
    const formId = sp.get("formId") ? Number(sp.get("formId")) : undefined;
    const dateFrom = sp.get("dateFrom") ?? undefined;
    const dateTo = sp.get("dateTo") ?? undefined;

    // Optional: customize filename prefix via ?name=
    const name = sp.get("name") ?? "submissions";

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

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Submissions (always included)
    {
      const header = [
        "Submission ID",
        "Form ID",
        "Form Title",
        "User ID",
        "User Email",
        "Status",
        "Created At",
        "Updated At",
      ];

      const rows = (data as any[]).map((s) => [
        s.id ?? "",
        s.form_id ?? s.form?.id ?? "",
        s.form?.title ?? "",
        s.user_id ?? s.user?.id ?? "",
        s.user?.email ?? "",
        s.status ?? "",
        s.created_at ?? "",
        s.updated_at ?? "",
      ]);

      const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "Submissions");
    }

    // If expand=1, add detail sheets (Answers, Attachments, etc.)
    if (expand) {
      // Sheet 2: Answers (one row per answer)
      {
        const header = [
          "Submission ID",
          "Answer ID",
          "Question ID",
          "Value",
          "Multi Values (JSON)", // corresponds to answers.multi
          "Created At",
        ];

        const rows: any[] = [];
        (data as any[]).forEach((s) => {
          (s.answers ?? []).forEach((a: any) => {
            rows.push([
              s.id ?? "",
              a.id ?? "",
              a.question_id ?? "",
              a.value ?? "",
              JSON.stringify(a.multi ?? []),
              a.created_at ?? "",
            ]);
          });
        });

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, "Answers");
      }

      // Sheet 3: Attachments
      {
        const header = [
          "Submission ID",
          "Attachment ID",
          "File Key",
          "File Name",
          "File Size",
          "Created At",
        ];

        const rows: any[] = [];
        (data as any[]).forEach((s) => {
          (s.attachments ?? []).forEach((f: any) => {
            rows.push([
              s.id ?? "",
              f.id ?? "",
              f.file_key ?? "",
              f.file_name ?? "",
              f.file_size ?? "",
              f.created_at ?? "",
            ]);
          });
        });

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        XLSX.utils.book_append_sheet(wb, ws, "Attachments");
      }
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
