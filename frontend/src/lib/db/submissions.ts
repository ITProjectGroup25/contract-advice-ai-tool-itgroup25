import { supabaseAdmin } from "@/lib/supabase/server";

export type ListParams = {
  page?: number;          // 1-based
  pageSize?: number;      // default 20
  orderBy?: string;       // "created_at" | "id" | ...
  asc?: boolean;          // default false
  formId?: number;
  status?: "Stored" | "EmailQueued" | "EmailSent" | "EmailFailed";
  workflowType?: "Simple" | "Complex";
  dateFrom?: string;      // ISO date or datetime
  dateTo?: string;        // ISO date or datetime
};

export async function listSubmissions(p: ListParams = {}) {
  const {
    page = 1, pageSize = 20,
    orderBy = "created_at", asc = false,
    formId, status, workflowType, dateFrom, dateTo,
  } = p;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabaseAdmin
    .from("submission")
    .select("*", { count: "exact" });

  if (formId != null) q = q.eq("form_id", formId);
  if (status) q = q.eq("status", status);
  if (workflowType) q = q.eq("workflow_type", workflowType);
  if (dateFrom) q = q.gte("created_at", dateFrom);
  if (dateTo) q = q.lte("created_at", dateTo);

  q = q.order(orderBy, { ascending: asc }).range(from, to);

  const { data, error, count } = await q;
  if (error) {
    throw Object.assign(new Error("SupabaseQueryError"), { cause: error, status: 500 });
  }

  return { data: data ?? [], page, pageSize, total: count ?? 0 };
}
