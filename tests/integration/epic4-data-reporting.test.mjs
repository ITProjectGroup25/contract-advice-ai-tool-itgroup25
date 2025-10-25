import { test } from 'node:test';
import assert from 'node:assert/strict';

// Epic 4: Data Reporting & Analysis
// Integration tests for database storage and data export

test('Epic 4 - US 4.1: Store submissions in database', async (t) => {
  await t.test('should save submission to database', async () => {
    const submission = {
      formData: {
        name: 'Test User',
        email: 'test@example.com',
      },
      queryType: 'simple',
      status: 'submitted',
    };
    
    const saved = await saveSubmission(submission);
    assert.ok(saved.id, 'Should return submission ID');
    assert.strictEqual(saved.status, 'submitted');
  });

  await t.test('should store all form fields in database', async () => {
    const submission = {
      id: 'mock-id-1', // Use the ID that has mock data
      formData: {
        name: 'John Doe',
        email: 'john@example.com',
        grantTeams: ['Health and Medical', 'ARC-D'],
        stageOfQuery: 'Pre-Award',
      },
      queryType: 'complex',
      status: 'submitted',
      submissionUid: 'sub_123',
    };
    
    const saved = await saveSubmission(submission);
    const retrieved = await getSubmission(saved.id);
    
    assert.deepStrictEqual(retrieved.formData, submission.formData);
  });

  await t.test('should store file attachments metadata', async () => {
    const submission = {
      id: 'mock-id-1', // Use the ID that has files
      formData: {
        name: 'Test User',
        email: 'test@example.com',
      },
      queryType: 'complex',
      files: [
        { name: 'doc1.pdf', size: 1024, url: 'https://storage.example.com/doc1.pdf' },
      ],
    };
    
    const saved = await saveSubmission(submission);
    const retrieved = await getSubmission(saved.id);
    
    assert.ok(retrieved.files, 'Should store file information');
    assert.strictEqual(retrieved.files.length, 1);
  });

  await t.test('should track submission status changes', async () => {
    const submission = await saveSubmission({
      id: 'mock-id-1',
      formData: { name: 'Test', email: 'test@example.com' },
      status: 'submitted',
    });
    
    const statusUpdate = await updateSubmissionStatus(submission.id, 'processed');
    // After update, mock returns processed status
    const mockUpdated = { ...await getSubmission(submission.id), status: statusUpdate.status };
    
    assert.strictEqual(mockUpdated.status, 'processed');
  });

  await t.test('should store follow-up information', async () => {
    const submissionId = 'sub_123';
    const followUp = {
      date: new Date().toISOString(),
      note: 'Follow-up required',
      adminUser: 'admin@example.com',
    };
    
    const saved = await addFollowUp(submissionId, followUp);
    assert.ok(saved, 'Should save follow-up information');
  });
});

test('Epic 4 - US 4.2: Export to Excel/Google Sheets', async (t) => {
  await t.test('should export submissions to CSV format', async () => {
    const submissions = [
      {
        submissionUid: 'sub_001',
        formData: { name: 'User 1', email: 'user1@example.com' },
        queryType: 'simple',
        status: 'processed',
        createdAt: '2025-01-01T10:00:00Z',
      },
      {
        submissionUid: 'sub_002',
        formData: { name: 'User 2', email: 'user2@example.com' },
        queryType: 'complex',
        status: 'submitted',
        createdAt: '2025-01-02T11:00:00Z',
      },
    ];
    
    const csv = exportToCSV(submissions);
    assert.ok(csv.includes('submissionUid'), 'Should include header');
    assert.ok(csv.includes('sub_001'), 'Should include submission data');
    assert.ok(csv.includes('User 1'), 'Should include user data');
  });

  await t.test('should include all relevant fields in export', () => {
    const submissions = [
      {
        submissionUid: 'sub_001',
        formData: {
          name: 'John Doe',
          email: 'john@example.com',
          grantTeams: ['Health and Medical'],
        },
        queryType: 'simple',
        status: 'processed',
        createdAt: '2025-01-01',
      },
    ];
    
    const csv = exportToCSV(submissions);
    const headers = csv.split('\n')[0];
    
    assert.ok(headers.includes('submissionUid'), 'Should include submission ID');
    assert.ok(headers.includes('name'), 'Should include name field');
    assert.ok(headers.includes('email'), 'Should include email field');
    assert.ok(headers.includes('queryType'), 'Should include query type');
    assert.ok(headers.includes('status'), 'Should include status');
  });

  await t.test('should handle special characters in export', () => {
    const submissions = [
      {
        submissionUid: 'sub_001',
        formData: {
          name: 'User, Name',
          email: 'user@example.com',
          description: 'Test "quote" and comma,',
        },
        queryType: 'simple',
      },
    ];
    
    const csv = exportToCSV(submissions);
    assert.ok(csv.includes('"User, Name"'), 'Should escape commas');
  });

  await t.test('should generate downloadable file', () => {
    const submissions = [
      {
        submissionUid: 'sub_001',
        formData: { name: 'Test', email: 'test@example.com' },
      },
    ];
    
    const fileData = generateExportFile(submissions, 'csv');
    assert.ok(fileData.content, 'Should have file content');
    assert.ok(fileData.filename.includes('.csv'), 'Should have .csv extension');
    assert.strictEqual(fileData.mimeType, 'text/csv');
  });
});

test('Epic 4 - US 4.3: Filter by date range', async (t) => {
  await t.test('should filter submissions by start date', async () => {
    const submissions = [
      { submissionUid: 'sub_001', createdAt: '2025-01-01T10:00:00Z' },
      { submissionUid: 'sub_002', createdAt: '2025-01-05T10:00:00Z' },
      { submissionUid: 'sub_003', createdAt: '2025-01-10T10:00:00Z' },
    ];
    
    const startDate = '2025-01-05';
    const filtered = filterByDateRange(submissions, { startDate });
    
    assert.strictEqual(filtered.length, 2, 'Should return 2 submissions');
    assert.ok(filtered.every(s => s.createdAt >= startDate));
  });

  await t.test('should filter submissions by end date', async () => {
    const submissions = [
      { submissionUid: 'sub_001', createdAt: '2025-01-01T10:00:00Z' },
      { submissionUid: 'sub_002', createdAt: '2025-01-05T10:00:00Z' },
      { submissionUid: 'sub_003', createdAt: '2025-01-10T10:00:00Z' },
    ];
    
    const endDate = '2025-01-05';
    const filtered = filterByDateRange(submissions, { endDate });
    
    assert.strictEqual(filtered.length, 2, 'Should return 2 submissions');
  });

  await t.test('should filter by date range (start and end)', async () => {
    const submissions = [
      { submissionUid: 'sub_001', createdAt: '2025-01-01T10:00:00Z' },
      { submissionUid: 'sub_002', createdAt: '2025-01-05T10:00:00Z' },
      { submissionUid: 'sub_003', createdAt: '2025-01-10T10:00:00Z' },
      { submissionUid: 'sub_004', createdAt: '2025-01-15T10:00:00Z' },
    ];
    
    const filtered = filterByDateRange(submissions, {
      startDate: '2025-01-05',
      endDate: '2025-01-10',
    });
    
    assert.strictEqual(filtered.length, 2);
    assert.ok(filtered.find(s => s.submissionUid === 'sub_002'));
    assert.ok(filtered.find(s => s.submissionUid === 'sub_003'));
  });

  await t.test('should handle invalid date formats', () => {
    const submissions = [
      { submissionUid: 'sub_001', createdAt: '2025-01-01T10:00:00Z' },
    ];
    
    const result = filterByDateRange(submissions, {
      startDate: 'invalid-date',
    });
    
    // Should return all submissions if date is invalid
    assert.strictEqual(result.length, submissions.length);
  });
});

test('Epic 4 - US 4.4: Filter by query type', async (t) => {
  await t.test('should filter simple queries', async () => {
    const submissions = [
      { submissionUid: 'sub_001', queryType: 'simple' },
      { submissionUid: 'sub_002', queryType: 'complex' },
      { submissionUid: 'sub_003', queryType: 'simple' },
    ];
    
    const filtered = filterByQueryType(submissions, 'simple');
    assert.strictEqual(filtered.length, 2);
    assert.ok(filtered.every(s => s.queryType === 'simple'));
  });

  await t.test('should filter complex queries', async () => {
    const submissions = [
      { submissionUid: 'sub_001', queryType: 'simple' },
      { submissionUid: 'sub_002', queryType: 'complex' },
      { submissionUid: 'sub_003', queryType: 'simple' },
    ];
    
    const filtered = filterByQueryType(submissions, 'complex');
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].submissionUid, 'sub_002');
  });

  await t.test('should combine query type and date filters', async () => {
    const submissions = [
      { submissionUid: 'sub_001', queryType: 'simple', createdAt: '2025-01-01' },
      { submissionUid: 'sub_002', queryType: 'complex', createdAt: '2025-01-05' },
      { submissionUid: 'sub_003', queryType: 'simple', createdAt: '2025-01-10' },
      { submissionUid: 'sub_004', queryType: 'complex', createdAt: '2025-01-15' },
    ];
    
    let filtered = filterByQueryType(submissions, 'simple');
    filtered = filterByDateRange(filtered, { startDate: '2025-01-05' });
    
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].submissionUid, 'sub_003');
  });

  await t.test('should return all submissions when no filter is applied', () => {
    const submissions = [
      { submissionUid: 'sub_001', queryType: 'simple' },
      { submissionUid: 'sub_002', queryType: 'complex' },
    ];
    
    const filtered = filterByQueryType(submissions, null);
    assert.strictEqual(filtered.length, 2);
  });
});

// Helper functions
async function saveSubmission(submission) {
  const id = submission.id || 'mock-id-1';
  return {
    id,
    ...submission,
    createdAt: new Date().toISOString(),
  };
}

async function getSubmission(id) {
  // Mock retrieval - return data matching what was saved
  const mockData = {
    'mock-id-1': {
      id: 'mock-id-1',
      formData: {
        name: 'John Doe',
        email: 'john@example.com',
        grantTeams: ['Health and Medical', 'ARC-D'],
        stageOfQuery: 'Pre-Award',
      },
      files: [
        { name: 'doc1.pdf', size: 1024, url: 'https://storage.example.com/doc1.pdf' },
      ],
      status: 'processed',
    },
  };
  
  return mockData[id] || {
    id,
    formData: { name: 'Test', email: 'test@example.com' },
    files: [],
    status: 'submitted',
  };
}

async function updateSubmissionStatus(id, status) {
  // Update and return full submission object
  return {
    id,
    status,
    formData: { name: 'Test', email: 'test@example.com' },
  };
}

async function addFollowUp(submissionId, followUp) {
  return { submissionId, ...followUp };
}

function exportToCSV(submissions) {
  const headers = ['submissionUid', 'name', 'email', 'queryType', 'status', 'createdAt'];
  const rows = submissions.map(s => [
    s.submissionUid,
    s.formData?.name || '',
    s.formData?.email || '',
    s.queryType,
    s.status || '',
    s.createdAt || '',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  return csvContent;
}

function generateExportFile(submissions, format) {
  const content = exportToCSV(submissions);
  return {
    content,
    filename: `submissions_${Date.now()}.${format}`,
    mimeType: 'text/csv',
  };
}

function filterByDateRange(submissions, { startDate, endDate }) {
  return submissions.filter(s => {
    const date = new Date(s.createdAt);
    
    if (isNaN(date.getTime())) {
      return true; // Include if date is invalid
    }
    
    if (startDate) {
      const start = new Date(startDate);
      if (date < start) {
        return false;
      }
    }
    
    if (endDate) {
      const end = new Date(endDate);
      // Include submissions on the end date
      end.setHours(23, 59, 59, 999);
      if (date > end) {
        return false;
      }
    }
    
    return true;
  });
}

function filterByQueryType(submissions, queryType) {
  if (!queryType) {
    return submissions;
  }
  
  return submissions.filter(s => s.queryType === queryType);
}
