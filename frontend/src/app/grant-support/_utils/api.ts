export type QueryType = "simple" | "complex";
export type SubmissionStatus = "submitted" | "processed" | "escalated";

export interface GrantSupportSubmissionCreate {
  formData: Record<string, any>;
  queryType: QueryType;
  userEmail?: string;
  userName?: string;
  status?: SubmissionStatus;
  userSatisfied?: boolean;
  needsHumanReview?: boolean;
}

export interface GrantSupportSubmission {
  id: number;
  submissionUid: string;
  timestamp: string;
  queryType: QueryType;
  status: SubmissionStatus;
  userEmail?: string;
  userName?: string;
  formData: Record<string, any>;
  userSatisfied?: boolean;
  needsHumanReview?: boolean;
}

export interface GrantSupportStats {
  total: number;
  simple: number;
  complex: number;
  processed: number;
  escalated: number;
  satisfied: number;
}

export interface GrantSupportSubmissionResponse {
  id: number;
  submissionUid: string;
  queryType: QueryType;
  status: SubmissionStatus;
  createdAt: string;
}

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  grantTeamEmail: string;
  grantTeamTemplateId: string;
}

async function handleJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail: any = null;
    try {
      detail = await res.json();
    } catch {
      /* noop */
    }

    const message =
      detail?.message ||
      detail?.error ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function createGrantSupportSubmission(
  payload: GrantSupportSubmissionCreate
): Promise<GrantSupportSubmissionResponse> {
  const res = await fetch("/api/grant-support/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log({ res });

  return handleJsonResponse<GrantSupportSubmissionResponse>(res);
}

export async function fetchGrantSupportSubmissions(
  params: {
    status?: SubmissionStatus;
    queryType?: QueryType;
    limit?: number;
  } = {}
): Promise<{
  submissions: GrantSupportSubmission[];
  stats: GrantSupportStats;
}> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.queryType) query.set("queryType", params.queryType);
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(
    `/api/grant-support/submissions${
      query.toString() ? `?${query.toString()}` : ""
    }`
  );
  return handleJsonResponse<{
    submissions: GrantSupportSubmission[];
    stats: GrantSupportStats;
  }>(res);
}

export async function updateGrantSupportSubmission(
  submissionId: number,
  updates: Partial<{
    status: SubmissionStatus;
    userSatisfied: boolean;
    needsHumanReview: boolean;
  }>
): Promise<void> {
  const res = await fetch(`/api/grant-support/submissions/${submissionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  await handleJsonResponse(res);
}

export async function deleteGrantSupportSubmission(
  submissionId: number
): Promise<void> {
  const res = await fetch(`/api/grant-support/submissions/${submissionId}`, {
    method: "DELETE",
  });
  await handleJsonResponse(res);
}

export async function clearGrantSupportSubmissions(): Promise<void> {
  const res = await fetch("/api/grant-support/submissions", {
    method: "DELETE",
  });
  await handleJsonResponse(res);
}

export async function exportGrantSupportSubmissions(): Promise<string> {
  const res = await fetch("/api/grant-support/submissions/export");
  if (!res.ok) {
    throw new Error("Failed to export submissions");
  }
  return await res.text();
}

export async function fetchEmailConfig(): Promise<{
  configured: boolean;
  config: EmailConfig | null;
}> {
  const res = await fetch("/api/v1/email-config");
  return handleJsonResponse<{
    configured: boolean;
    config: EmailConfig | null;
  }>(res);
}

export async function saveEmailConfig(
  config: EmailConfig
): Promise<EmailConfig> {
  const res = await fetch("/api/v1/email-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  const data = await handleJsonResponse<{ config: EmailConfig }>(res);
  return data.config;
}
