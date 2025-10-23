import { NextResponse } from "next/server";

import { listSubmissions } from "@/lib/db/submissions";

export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const expand = sp.get("expand") === "1";
    const result = await listSubmissions({
      page: Number(sp.get("page") ?? "1"),
      pageSize: Number(sp.get("pageSize") ?? "20"),
      orderBy: sp.get("orderBy") ?? "created_at",
      asc: (sp.get("asc") ?? "false") === "true",
      status: sp.get("status") as any,
      formId: sp.get("formId") ? Number(sp.get("formId")) : undefined,
      dateFrom: sp.get("dateFrom") ?? undefined,
      dateTo: sp.get("dateTo") ?? undefined,
      expand,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "InternalError", message: err?.cause?.message ?? err?.message },
      { status: err?.status ?? 500 }
    );
  }
}
