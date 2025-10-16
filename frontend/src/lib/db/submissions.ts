// Stub implementation - this function is not currently used in production
// To properly implement, ensure @backend workspace is accessible during build

export interface ListSubmissionsParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  asc?: boolean;
  status?: string;
  formId?: number;
  dateFrom?: string;
  dateTo?: string;
  expand?: boolean;
}

export interface SubmissionRecord {
  id: number;
  submissionUid: string;
  formId: number | null;
  workflowType: string;
  status: string;
  createdAt: string;
  createdBy: string | null;
  // Optional expanded fields
  answers?: any[];
  attachments?: any[];
  formTitle?: string;
}

export interface ListSubmissionsResult {
  submissions: SubmissionRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function listSubmissions(
  params: ListSubmissionsParams = {}
): Promise<ListSubmissionsResult> {
  // Stub implementation
  // TODO: Implement proper database query when @backend is accessible
  return {
    submissions: [],
    pagination: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      total: 0,
      totalPages: 0,
    },
  };
}
