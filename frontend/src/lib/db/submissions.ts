import { getSupabaseAdmin } from "@/lib/supabase/server";
const supabaseAdmin = getSupabaseAdmin();

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
  expand?: boolean;
};

const EXPAND_SELECT = `
  *,
  form:form_id(*),
  answers:answer(
    *,
    multi:answer_multi_value(*)
  ),
  attachments:attachment(*),
  status_history:submission_status_history(*),
  consents:consent_log(*),
  emails:email_message(*)
`;


export async function listSubmissions(p: ListParams = {}) {
  const { page = 1, pageSize = 20, orderBy = "created_at", asc = false,
          status, formId, dateFrom, dateTo, expand = false } = p;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const sel = expand ? EXPAND_SELECT : "*";

  let q = supabaseAdmin.from("submission").select(sel, { count: "exact" });

  if (status)   q = q.eq("status", status);
  if (formId)   q = q.eq("form_id", formId);
  if (dateFrom) q = q.gte("created_at", dateFrom);
  if (dateTo)   q = q.lte("created_at", dateTo);

  q = q.order(orderBy, { ascending: asc }).range(from, to);

  const { data, error, count } = await q;
  if (error) throw Object.assign(new Error("SupabaseQueryError"), { cause: error, status: 500 });

  return { data: data ?? [], page, pageSize, total: count ?? 0 };
}
