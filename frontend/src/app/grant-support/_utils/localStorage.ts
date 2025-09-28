export interface FormSubmission {
  id: string;
  timestamp: string;
  queryType: "simple" | "complex";
  formData: Record<string, any>;
  status: "submitted" | "in-progress" | "resolved";
}

export class LocalDatabase {
  private static readonly STORAGE_KEY = "grants_form_submissions";

  private static get storage(): Storage | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return window.localStorage;
    } catch (error) {
      console.warn("LocalStorage is not available:", error);
      return null;
    }
  }

  static saveSubmission(
    submission: Omit<FormSubmission, "id" | "timestamp">
  ): FormSubmission {
    const submissions = this.getAllSubmissions();
    const newSubmission: FormSubmission = {
      ...submission,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    submissions.push(newSubmission);

    const storage = this.storage;
    if (storage) {
      storage.setItem(this.STORAGE_KEY, JSON.stringify(submissions));
    }

    return newSubmission;
  }

  static getAllSubmissions(): FormSubmission[] {
    const storage = this.storage;
    if (!storage) {
      return [];
    }

    try {
      const stored = storage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  }

  static getSubmissionById(id: string): FormSubmission | null {
    const submissions = this.getAllSubmissions();
    return submissions.find((s) => s.id === id) || null;
  }

  static updateSubmission(
    id: string,
    updates: Partial<FormSubmission>
  ): FormSubmission | null {
    const submissions = this.getAllSubmissions();
    const index = submissions.findIndex((s) => s.id === id);

    if (index === -1) return null;

    submissions[index] = { ...submissions[index], ...updates };
    const storage = this.storage;
    if (storage) {
      storage.setItem(this.STORAGE_KEY, JSON.stringify(submissions));
    }

    return submissions[index];
  }

  static deleteSubmission(id: string): boolean {
    const submissions = this.getAllSubmissions();
    const filteredSubmissions = submissions.filter((s) => s.id !== id);

    if (filteredSubmissions.length === submissions.length) return false;

    const storage = this.storage;
    if (storage) {
      storage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSubmissions));
    }

    return true;
  }

  static exportToSQL(): string {
    const submissions = this.getAllSubmissions();

    let sql = `-- Grants Form Submissions Export\n-- Generated on: ${new Date().toISOString()}\n\nCREATE TABLE IF NOT EXISTS form_submissions (\n  id VARCHAR(36) PRIMARY KEY,\n  timestamp DATETIME NOT NULL,\n  query_type VARCHAR(10) NOT NULL,\n  form_data JSON NOT NULL,\n  status VARCHAR(20) NOT NULL DEFAULT 'submitted'\n);\n\n`;

    submissions.forEach((submission) => {
      const formDataJson = JSON.stringify(submission.formData).replace(/'/g, "''");
      sql += `INSERT INTO form_submissions (id, timestamp, query_type, form_data, status) VALUES (\n  '${submission.id}',\n  '${submission.timestamp}',\n  '${submission.queryType}',\n  '${formDataJson}',\n  '${submission.status}'\n);\n\n`;
    });

    return sql;
  }

  static exportToCSV(): string {
    const submissions = this.getAllSubmissions();

    if (submissions.length === 0) return "No submissions to export";

    const headers = ["ID", "Timestamp", "Query Type", "Status", "Form Data"];
    const csvRows = [headers.join(",")];

    submissions.forEach((submission) => {
      const row = [
        submission.id,
        submission.timestamp,
        submission.queryType,
        submission.status,
        `"${JSON.stringify(submission.formData).replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  static clearAllData(): void {
    const storage = this.storage;
    if (storage) {
      storage.removeItem(this.STORAGE_KEY);
    }
  }

  private static generateId(): string {
    return "sub_" + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
