import {
  createGrantSupportSubmission,
  deleteGrantSupportSubmission,
  exportGrantSupportSubmissions,
  clearGrantSupportSubmissions,
  fetchGrantSupportSubmissions,
  updateGrantSupportSubmission,
  GrantSupportSubmission,
  GrantSupportStats,
} from "./api";

export interface FormSubmission {
  id: string;
  submissionUid?: string;
  dbId?: number;
  timestamp: string;
  queryType: "simple" | "complex";
  formData: Record<string, any>;
  sqlStatement: string;
  status: "submitted" | "processed" | "escalated";
  userSatisfied?: boolean;
  needsHumanReview?: boolean;
}

class LocalDatabase {
  private cache: FormSubmission[] = [];
  private stats: GrantSupportStats | null = null;
  private idMap: Map<string, number> = new Map();

  private mapSubmissions(submissions: GrantSupportSubmission[]): FormSubmission[] {
    this.idMap.clear();

    return submissions.map((submission) => {
      const mapped: FormSubmission = {
        id: submission.submissionUid,
        submissionUid: submission.submissionUid,
        dbId: submission.id,
        timestamp: submission.timestamp,
        queryType: submission.queryType,
        formData: submission.formData ?? {},
        sqlStatement: "-- Stored in Supabase. Use Export All to download SQL representation. --",
        status: submission.status,
        userSatisfied: submission.userSatisfied,
        needsHumanReview: submission.needsHumanReview,
      };
      this.idMap.set(mapped.id, submission.id);
      this.idMap.set(String(submission.id), submission.id);
      return mapped;
    });
  }

  private async refreshCache() {
    const { submissions, stats } = await fetchGrantSupportSubmissions();
    this.cache = this.mapSubmissions(submissions);
    this.stats = stats;
  }

  private resolveDbId(id: string): number {
    if (this.idMap.size === 0) {
      throw new Error("Submission cache is empty. Load submissions first.");
    }
    const dbId = this.idMap.get(id) ?? this.idMap.get(String(id));
    if (dbId === undefined) {
      throw new Error(`Submission ${id} not found in cache`);
    }
    return dbId;
  }

  async saveSubmission(submission: FormSubmission): Promise<void> {
    await createGrantSupportSubmission({
      formData: submission.formData,
      queryType: submission.queryType,
      userEmail: submission.formData.email ?? undefined,
      userName: submission.formData.name ?? undefined,
      status: submission.status,
      userSatisfied: submission.userSatisfied,
      needsHumanReview: submission.needsHumanReview,
    });
    await this.refreshCache();
  }

  async updateSubmission(id: string, updates: Partial<FormSubmission>): Promise<void> {
    if (this.cache.length === 0) {
      await this.refreshCache();
    }
    const dbId = this.resolveDbId(id);
    await updateGrantSupportSubmission(dbId, {
      status: updates.status,
      userSatisfied: updates.userSatisfied,
      needsHumanReview: updates.needsHumanReview,
    });
    await this.refreshCache();
  }

  async getAllSubmissions(): Promise<FormSubmission[]> {
    await this.refreshCache();
    return [...this.cache];
  }

  async getSubmissionsByType(queryType: "simple" | "complex"): Promise<FormSubmission[]> {
    await this.refreshCache();
    return this.cache.filter((submission) => submission.queryType === queryType);
  }

  async getSubmissionsByStatus(status: FormSubmission["status"]): Promise<FormSubmission[]> {
    await this.refreshCache();
    return this.cache.filter((submission) => submission.status === status);
  }

  async getSubmission(id: string): Promise<FormSubmission | null> {
    await this.refreshCache();
    return this.cache.find((submission) => submission.id === id) ?? null;
  }

  async deleteSubmission(id: string): Promise<void> {
    if (this.cache.length === 0) {
      await this.refreshCache();
    }
    const dbId = this.resolveDbId(id);
    await deleteGrantSupportSubmission(dbId);
    await this.refreshCache();
  }

  async clearAllSubmissions(): Promise<void> {
    await clearGrantSupportSubmissions();
    this.cache = [];
    this.stats = {
      total: 0,
      simple: 0,
      complex: 0,
      processed: 0,
      escalated: 0,
      satisfied: 0,
    };
    this.idMap.clear();
  }

  async getSubmissionStats(): Promise<{
    total: number;
    simple: number;
    complex: number;
    processed: number;
    escalated: number;
    satisfied: number;
  }> {
    if (!this.stats) {
      await this.refreshCache();
    }
    return this.stats ?? {
      total: 0,
      simple: 0,
      complex: 0,
      processed: 0,
      escalated: 0,
      satisfied: 0,
    };
  }

  async exportAllToSQL(): Promise<string> {
    return exportGrantSupportSubmissions();
  }
}

export const localDB = new LocalDatabase();
