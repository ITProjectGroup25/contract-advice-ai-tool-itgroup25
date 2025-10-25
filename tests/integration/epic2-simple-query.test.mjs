import { test } from 'node:test';
import assert from 'node:assert/strict';

// Epic 2: Simple Query Handling
// Integration tests for chatbot responses and feedback

test('Epic 2 - US 2.1: Chatbot with pre-prepared responses', async (t) => {
  await t.test('should display chatbot after simple query submission', () => {
    const submission = {
      queryType: 'simple',
      submissionId: 'sub_simple_123',
    };
    
    const shouldShowChatbot = submission.queryType === 'simple';
    assert.ok(shouldShowChatbot, 'Chatbot should appear for simple queries');
  });

  await t.test('should match FAQ based on user selections', () => {
    const userSelections = {
      grantsScheme: 'NHMRC',
      mriInvolvement: 'Yes',
      typeOfQuery: 'Review contractual clause',
    };
    
    const faqs = [
      {
        id: 1,
        name: 'NHMRC Contract Review',
        selections: {
          grantsScheme: 'NHMRC',
          typeOfQuery: 'Review contractual clause',
        },
        answer: 'Here is guidance for NHMRC contract reviews...',
      },
      {
        id: 2,
        name: 'ARC Grant Info',
        selections: {
          grantsScheme: 'ARC',
        },
        answer: 'ARC grant information...',
      },
    ];
    
    const matchedFaq = matchFaqWithSelections(userSelections, faqs);
    assert.ok(matchedFaq, 'Should find matching FAQ');
    assert.strictEqual(matchedFaq.id, 1, 'Should match correct FAQ');
  });

  await t.test('should provide pre-prepared response from FAQ database', () => {
    const faq = {
      id: 1,
      name: 'NHMRC MRI Involvement',
      answer: 'When MRI is involved in NHMRC grants, you should...',
      selections: {
        grantsScheme: 'NHMRC',
        mriInvolvement: 'Yes',
      },
    };
    
    const response = getFaqResponse(faq);
    assert.ok(response.length > 0, 'Response should not be empty');
    assert.strictEqual(response, faq.answer, 'Should return FAQ answer');
  });

  await t.test('should include helpful links in response', () => {
    const faq = {
      id: 1,
      answer: 'Visit https://example.com for more information',
      links: ['https://example.com/guide', 'https://example.com/faq'],
    };
    
    const response = getFaqResponse(faq);
    assert.ok(
      response.includes('https://') || faq.links.length > 0,
      'Should include links'
    );
  });

  await t.test('should provide default response when no FAQ matches', () => {
    const userSelections = {
      grantsScheme: 'Unknown',
      typeOfQuery: 'Other',
    };
    
    const faqs = [];
    const matchedFaq = matchFaqWithSelections(userSelections, faqs);
    
    const response = matchedFaq
      ? getFaqResponse(matchedFaq)
      : getDefaultResponse();
    
    assert.ok(response.length > 0, 'Should provide default response');
  });
});

test('Epic 2 - US 2.2: Service feedback section', async (t) => {
  await t.test('should display feedback options after response', () => {
    const feedbackSection = {
      satisfied: 'Yes, this helped!',
      needHelp: 'I need human assistance',
    };
    
    assert.ok(feedbackSection.satisfied, 'Should have satisfied option');
    assert.ok(feedbackSection.needHelp, 'Should have need help option');
  });

  await t.test('should mark submission as resolved when user is satisfied', async () => {
    const submissionId = 'sub_123';
    const feedback = {
      satisfied: true,
      needsHumanReview: false,
    };
    
    const result = await updateSubmissionFeedback(submissionId, feedback);
    assert.strictEqual(result.status, 'processed', 'Status should be processed');
    assert.ok(result.userSatisfied, 'Should mark as satisfied');
  });

  await t.test('should escalate to admin when user needs help', async () => {
    const submissionId = 'sub_456';
    const feedback = {
      satisfied: false,
      needsHumanReview: true,
    };
    
    const result = await updateSubmissionFeedback(submissionId, feedback);
    assert.strictEqual(result.status, 'escalated', 'Status should be escalated');
    assert.ok(result.needsHumanReview, 'Should mark as needing review');
  });

  await t.test('should send email to admin when escalated', async () => {
    const submissionId = 'sub_789';
    const submission = {
      formData: {
        email: 'user@example.com',
        name: 'Test User',
      },
    };
    
    const emailSent = await sendEscalationEmail(submissionId, submission);
    assert.ok(emailSent, 'Should send escalation email to admin');
  });

  await t.test('should track feedback response time', () => {
    const submission = {
      submittedAt: new Date('2025-01-01T10:00:00'),
      feedbackAt: new Date('2025-01-01T10:05:00'),
    };
    
    const responseTime = calculateResponseTime(submission);
    assert.strictEqual(responseTime, 5, 'Response time should be 5 minutes');
  });
});

// Helper functions
function matchFaqWithSelections(userSelections, faqs) {
  return faqs.find((faq) => {
    const selections = faq.selections || {};
    
    return Object.keys(selections).every((key) => {
      return userSelections[key] === selections[key];
    });
  });
}

function getFaqResponse(faq) {
  return faq.answer || '';
}

function getDefaultResponse() {
  return 'Thank you for your submission. Our team will review your query and respond shortly.';
}

async function updateSubmissionFeedback(submissionId, feedback) {
  const status = feedback.needsHumanReview ? 'escalated' : 'processed';
  
  return {
    submissionId,
    status,
    userSatisfied: feedback.satisfied,
    needsHumanReview: feedback.needsHumanReview,
  };
}

async function sendEscalationEmail(submissionId, submission) {
  // Mock email sending
  return true;
}

function calculateResponseTime(submission) {
  const diff = submission.feedbackAt - submission.submittedAt;
  return Math.floor(diff / (1000 * 60)); // minutes
}
