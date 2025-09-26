// Local database using IndexedDB for storing form submissions
export interface FormSubmission {
  id: string;
  timestamp: string;
  queryType: 'simple' | 'complex';
  formData: Record<string, any>;
  sqlStatement: string;
  status: 'submitted' | 'processed' | 'escalated';
  userSatisfied?: boolean;
  needsHumanReview?: boolean;
}

class LocalDatabase {
  private dbName = 'FormSubmissionsDB';
  private version = 1;
  private storeName = 'submissions';

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          
          // Create indexes for efficient querying
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('queryType', 'queryType', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  async saveSubmission(submission: FormSubmission): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.add(submission);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateSubmission(id: string, updates: Partial<FormSubmission>): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existingSubmission = getRequest.result;
        if (existingSubmission) {
          const updatedSubmission = { ...existingSubmission, ...updates };
          const putRequest = store.put(updatedSubmission);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Submission not found'));
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getAllSubmissions(): Promise<FormSubmission[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSubmissionsByType(queryType: 'simple' | 'complex'): Promise<FormSubmission[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('queryType');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(queryType);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSubmissionsByStatus(status: FormSubmission['status']): Promise<FormSubmission[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('status');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(status);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSubmission(id: string): Promise<FormSubmission | null> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSubmission(id: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllSubmissions(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSubmissionStats(): Promise<{
    total: number;
    simple: number;
    complex: number;
    processed: number;
    escalated: number;
    satisfied: number;
  }> {
    const submissions = await this.getAllSubmissions();
    
    return {
      total: submissions.length,
      simple: submissions.filter(s => s.queryType === 'simple').length,
      complex: submissions.filter(s => s.queryType === 'complex').length,
      processed: submissions.filter(s => s.status === 'processed').length,
      escalated: submissions.filter(s => s.status === 'escalated').length,
      satisfied: submissions.filter(s => s.userSatisfied === true).length,
    };
  }

  async exportAllToSQL(): Promise<string> {
    const submissions = await this.getAllSubmissions();
    
    let sqlContent = `-- Form Submissions Database Export\n`;
    sqlContent += `-- Generated on: ${new Date().toISOString()}\n`;
    sqlContent += `-- Total submissions: ${submissions.length}\n\n`;
    
    sqlContent += `CREATE TABLE IF NOT EXISTS form_submissions (\n`;
    sqlContent += `  id VARCHAR(255) PRIMARY KEY,\n`;
    sqlContent += `  timestamp DATETIME,\n`;
    sqlContent += `  query_type VARCHAR(50),\n`;
    sqlContent += `  form_data TEXT,\n`;
    sqlContent += `  sql_statement TEXT,\n`;
    sqlContent += `  status VARCHAR(50),\n`;
    sqlContent += `  user_satisfied BOOLEAN,\n`;
    sqlContent += `  needs_human_review BOOLEAN\n`;
    sqlContent += `);\n\n`;
    
    submissions.forEach(submission => {
      sqlContent += `INSERT INTO form_submissions VALUES (\n`;
      sqlContent += `  '${submission.id}',\n`;
      sqlContent += `  '${submission.timestamp}',\n`;
      sqlContent += `  '${submission.queryType}',\n`;
      sqlContent += `  '${JSON.stringify(submission.formData).replace(/'/g, "''")}',\n`;
      sqlContent += `  '${submission.sqlStatement.replace(/'/g, "''")}',\n`;
      sqlContent += `  '${submission.status}',\n`;
      sqlContent += `  ${submission.userSatisfied ?? 'NULL'},\n`;
      sqlContent += `  ${submission.needsHumanReview ?? 'NULL'}\n`;
      sqlContent += `);\n\n`;
    });
    
    return sqlContent;
  }
}

export const localDB = new LocalDatabase();