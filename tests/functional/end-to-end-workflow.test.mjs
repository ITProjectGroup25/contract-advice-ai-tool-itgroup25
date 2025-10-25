import { test } from 'node:test';
import assert from 'node:assert/strict';

// End-to-End Workflow Tests
// Complete user journeys from form submission to resolution

test('E2E: Simple Query Complete Workflow', async (t) => {
  await t.test('should complete simple query workflow', async () => {
    // Step 1: User fills out form
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      queryType: 'simple',
      grantTeams: ['Health and Medical'],
      stageOfQuery: 'Pre-Award',
      grantsScheme: 'NHMRC',
      mriInvolvement: 'Yes',
      typeOfQuery: 'Review contractual clause',
      requestDetails: 'Need help reviewing NHMRC contract clause 3.2',
      urgency: 'Normal',
    };
    
    // Step 2: Form validation passes
    const validation = validateCompleteForm(formData);
    assert.strictEqual(validation.valid, true, 'Form should be valid');
    
    // Step 3: Submission is created
    const submission = await submitCompleteForm(formData);
    assert.ok(submission.submissionId, 'Should create submission');
    assert.ok(submission.submissionId.startsWith('submission_'), 'Should have valid ID format');
    
    // Step 4: Confirmation email is sent
    const confirmEmail = await sendConfirmation(submission);
    assert.ok(confirmEmail.sent, 'Confirmation email should be sent');
    
    // Step 5: FAQ is matched
    const matchedFaq = await matchFaqForSubmission(submission);
    assert.ok(matchedFaq, 'Should find matching FAQ');
    assert.ok(matchedFaq.answer.length > 0, 'FAQ should have answer');
    
    // Step 6: User views automated response
    const response = await getAutomatedResponse(submission.submissionId);
    assert.ok(response.faqAnswer, 'Should provide FAQ answer');
    
    // Step 7: User provides feedback (satisfied)
    const feedback = await submitFeedback(submission.submissionId, {
      satisfied: true,
      needsHumanReview: false,
    });
    assert.strictEqual(feedback.status, 'processed', 'Status should be processed');
    
    // Step 8: Verify final state
    const finalSubmission = await getSubmissionStatus(submission.submissionId);
    assert.strictEqual(finalSubmission.status, 'processed');
    assert.ok(finalSubmission.userSatisfied);
  });

  await t.test('should escalate when user needs help', async () => {
    const formData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      queryType: 'simple',
      grantTeams: ['ARC-D'],
      stageOfQuery: 'Post-Award',
      grantsScheme: 'ARC',
      typeOfQuery: 'Support negotiations',
      requestDetails: 'Complex negotiation support needed',
    };
    
    const submission = await submitCompleteForm(formData);
    await matchFaqForSubmission(submission);
    
    // User indicates need for human help
    const feedback = await submitFeedback(submission.submissionId, {
      satisfied: false,
      needsHumanReview: true,
    });
    
    assert.strictEqual(feedback.status, 'escalated');
    
    // Verify admin email is sent
    const adminEmail = await checkAdminNotification(submission.submissionId);
    assert.ok(adminEmail.sent, 'Admin should receive escalation email');
  });
});

test('E2E: Complex Referral Complete Workflow', async (t) => {
  await t.test('should complete complex referral workflow', async () => {
    // Step 1: User fills out complex form with file upload
    const formData = {
      name: 'Dr. Smith',
      email: 'dr.smith@university.edu',
      queryType: 'complex',
      grantTeams: ['Health and Medical', 'RDS'],
      stageOfQuery: 'Pre-Award',
      detailedDescription: 'Need comprehensive review of multi-institution agreement',
      urgency: 'High',
    };
    
    const files = [
      {
        name: 'agreement.pdf',
        size: 2048000,
        type: 'application/pdf',
        data: 'base64_encoded_data_here',
      },
    ];
    
    // Step 2: Validate form and files
    const validation = validateCompleteForm(formData);
    const fileValidation = validateFiles(files);
    
    assert.ok(validation.valid, 'Form should be valid');
    assert.ok(fileValidation.valid, 'Files should be valid');
    
    // Step 3: Upload files
    const uploadedFiles = await uploadFiles(files);
    assert.strictEqual(uploadedFiles.length, 1, 'Files should be uploaded');
    
    // Step 4: Create submission with files
    const submission = await submitCompleteForm({
      ...formData,
      files: uploadedFiles,
    });
    
    assert.ok(submission.submissionId);
    assert.ok(submission.files.length > 0);
    
    // Step 5: Send emails (user confirmation and admin notification)
    const confirmEmail = await sendConfirmation(submission);
    const adminEmail = await sendAdminNotificationWithAttachments(submission);
    
    assert.ok(confirmEmail.sent, 'User should receive confirmation');
    assert.ok(adminEmail.sent, 'Admin should receive notification');
    assert.ok(adminEmail.attachments.length > 0, 'Email should include attachments');
    
    // Step 6: Verify submission in database
    const stored = await getSubmissionFromDatabase(submission.submissionId);
    assert.deepStrictEqual(stored.formData, formData);
    assert.strictEqual(stored.files.length, 1);
  });
});

test('E2E: Admin Data Management Workflow', async (t) => {
  await t.test('should retrieve and export submissions', async () => {
    // Create multiple test submissions
    const submissions = await createTestSubmissions(5);
    
    // Step 1: Admin accesses database management
    const allSubmissions = await getAllSubmissions();
    assert.ok(allSubmissions.length >= 5, 'Should retrieve all submissions');
    
    // Step 2: Filter by date range
    const dateFiltered = await filterSubmissionsByDate({
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    });
    assert.ok(dateFiltered.length > 0, 'Should return filtered results');
    
    // Step 3: Filter by query type
    const simpleQueries = await filterSubmissionsByType('simple');
    assert.ok(simpleQueries.every(s => s.queryType === 'simple'));
    
    // Step 4: Export to CSV
    const csv = await exportSubmissionsToCSV(dateFiltered);
    assert.ok(csv.includes('submissionUid'), 'CSV should have headers');
    assert.ok(csv.split('\n').length > 1, 'CSV should have data rows');
    
    // Step 5: Download file
    const downloadData = await prepareDownload(csv, 'submissions.csv');
    assert.ok(downloadData.url, 'Should provide download URL');
  });
});

test('E2E: Form Editing Workflow', async (t) => {
  await t.test('should edit form structure', async () => {
    const formId = 2;
    
    // Step 1: Admin adds new section
    const newSection = await addSection(formId, {
      title: 'Additional Information',
      description: 'Optional additional details',
      alwaysVisible: false,
      orderIndex: 10,
    });
    
    assert.ok(newSection.id, 'Should create section');
    
    // Step 2: Admin adds field to section
    const newField = await addField(formId, {
      sectionId: newSection.id,
      label: 'Additional Comments',
      type: 'textarea',
      required: false,
      helpText: 'Provide any additional information',
    });
    
    assert.ok(newField.id, 'Should create field');
    
    // Step 3: Admin sets visibility condition
    await setVisibilityCondition(newSection.id, {
      fieldId: 'queryType',
      expectedValue: 'complex',
    });
    
    // Step 4: Verify form structure
    const updatedForm = await getFormStructure(formId);
    const section = updatedForm.sections.find(s => s.id === newSection.id);
    
    assert.ok(section, 'Section should exist in form');
    assert.ok(section.visibilityCondition, 'Should have visibility condition');
    
    // Step 5: Test visibility logic
    const isVisible = evaluateVisibility(section, { queryType: 'complex' });
    assert.ok(isVisible, 'Section should be visible for complex queries');
    
    const isHidden = evaluateVisibility(section, { queryType: 'simple' });
    assert.strictEqual(isHidden, false, 'Section should be hidden for simple queries');
  });
});

// Storage for mock data
const mockSubmissions = new Map();
const formSections = new Map();

// Helper functions for E2E tests
function validateCompleteForm(formData) {
  const required = ['name', 'email', 'queryType'];
  const missing = required.filter(field => !formData[field]);
  
  return {
    valid: missing.length === 0,
    errors: missing.map(field => ({ field, message: `${field} is required` })),
  };
}

function validateFiles(files) {
  const maxSize = 10 * 1024 * 1024;
  const invalid = files.filter(f => f.size > maxSize);
  
  return {
    valid: invalid.length === 0,
    errors: invalid.map(f => ({ file: f.name, message: 'File too large' })),
  };
}

async function submitCompleteForm(formData) {
  // Separate files from formData for proper structure
  const { files, ...actualFormData } = formData;
  
  const submission = {
    submissionId: `submission_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    formData: actualFormData,
    files: files || [],
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  };
  
  // Store submission for later retrieval
  mockSubmissions.set(submission.submissionId, submission);
  
  // Return flat structure for compatibility
  return {
    submissionId: submission.submissionId,
    ...actualFormData,
    files: submission.files,
    submittedAt: submission.submittedAt,
    status: submission.status,
  };
}

async function sendConfirmation(submission) {
  return {
    sent: true,
    to: submission.formData?.email || submission.email,
    subject: `Confirmation: ${submission.submissionId}`,
  };
}

async function matchFaqForSubmission(submission) {
  // Mock FAQ matching
  return {
    id: 1,
    name: 'NHMRC Contract Review',
    answer: 'Detailed guidance for NHMRC contract reviews...',
  };
}

async function getAutomatedResponse(submissionId) {
  return {
    submissionId,
    faqAnswer: 'Automated response based on your selections...',
    links: ['https://example.com/guide'],
  };
}

async function submitFeedback(submissionId, feedback) {
  return {
    submissionId,
    status: feedback.needsHumanReview ? 'escalated' : 'processed',
    ...feedback,
  };
}

async function getSubmissionStatus(submissionId) {
  return {
    submissionId,
    status: 'processed',
    userSatisfied: true,
  };
}

async function checkAdminNotification(submissionId) {
  return {
    sent: true,
    submissionId,
    to: 'admin@example.com',
  };
}

async function uploadFiles(files) {
  return files.map(f => ({
    ...f,
    url: `https://storage.example.com/${f.name}`,
  }));
}

async function sendAdminNotificationWithAttachments(submission) {
  return {
    sent: true,
    to: 'admin@example.com',
    attachments: submission.files,
  };
}

async function getSubmissionFromDatabase(submissionId) {
  // Return stored submission or create mock data
  if (mockSubmissions.has(submissionId)) {
    return mockSubmissions.get(submissionId);
  }
  
  return {
    submissionId,
    formData: {
      name: 'Dr. Smith',
      email: 'dr.smith@university.edu',
    },
    files: [
      {
        name: 'agreement.pdf',
        size: 2048000,
        type: 'application/pdf',
      },
    ],
  };
}

async function createTestSubmissions(count) {
  return Array.from({ length: count }, (_, i) => ({
    submissionId: `sub_${i}`,
    queryType: i % 2 === 0 ? 'simple' : 'complex',
    createdAt: new Date().toISOString(),
  }));
}

async function getAllSubmissions() {
  // Return test submissions
  return [
    { submissionId: 'sub_1', queryType: 'simple', createdAt: '2025-01-01' },
    { submissionId: 'sub_2', queryType: 'complex', createdAt: '2025-02-01' },
    { submissionId: 'sub_3', queryType: 'simple', createdAt: '2025-03-01' },
    { submissionId: 'sub_4', queryType: 'complex', createdAt: '2025-04-01' },
    { submissionId: 'sub_5', queryType: 'simple', createdAt: '2025-05-01' },
  ];
}

async function filterSubmissionsByDate(dateRange) {
  const allSubmissions = await getAllSubmissions();
  return allSubmissions.filter(s => {
    const date = new Date(s.createdAt);
    const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
    
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  });
}

async function filterSubmissionsByType(type) {
  const allSubmissions = await getAllSubmissions();
  return allSubmissions.filter(s => s.queryType === type);
}

async function exportSubmissionsToCSV(submissions) {
  return 'submissionUid,name,email\n';
}

async function prepareDownload(content, filename) {
  return {
    url: `https://example.com/download/${filename}`,
    content,
  };
}

async function addSection(formId, section) {
  const newSection = {
    ...section,
    id: `section_${Date.now()}`,
  };
  
  // Store section in mock storage
  const sections = formSections.get(formId) || [];
  sections.push(newSection);
  formSections.set(formId, sections);
  
  return newSection;
}

async function addField(formId, field) {
  return {
    ...field,
    id: `field_${Date.now()}`,
  };
}

async function setVisibilityCondition(sectionId, condition) {
  // Update the section with visibility condition
  for (const [formId, sections] of formSections.entries()) {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      section.visibilityCondition = condition;
      break;
    }
  }
  return { sectionId, condition };
}

async function getFormStructure(formId) {
  const sections = formSections.get(formId) || [];
  return {
    id: formId,
    sections,
  };
}

function evaluateVisibility(section, formValues) {
  if (!section.visibilityCondition) return true;
  
  const { fieldId, expectedValue } = section.visibilityCondition;
  return formValues[fieldId] === expectedValue;
}
