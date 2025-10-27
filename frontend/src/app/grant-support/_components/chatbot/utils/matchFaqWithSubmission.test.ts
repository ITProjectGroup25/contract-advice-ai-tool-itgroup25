// @ts-ignore
import { test, expect } from 'bun:test';
import { matchFaqWithSubmission } from './faqMatchingUtils';

test('matchFaqWithSubmission - should match FAQ with real database structure', () => {
  const faq = {
    id: 7,
    form_id: 2,
    name: 'Grant + UOM',
    answer: 'The answer is ABC',
    selections: [
      {
        children: [
          {
            id: 'cdcqdn768wfagov5jnqzfp',
            icon: 'fas fa-tasks',
            items: [
              {
                id: 'gd9b7vok51gpb1k7ipgnb',
                label: 'Health and Medical',
                value: 'Health And Medical',
                selected: false,
              },
              {
                id: 'fcp0laey4uvcpd341yeba',
                label: 'ARC-D',
                value: 'ARC-D',
                selected: true,
              },
            ],
            category: 'other-elements',
            itemType: 'control',
            required: true,
            labelName: 'Grant Team',
            containerId: '2cmllrqm3sozh3aacie7',
            controlName: 'checklist',
            description: '',
            displayText: 'Checklist',
            selectedOptionId: 'fcp0laey4uvcpd341yeba',
            selectedOptionLabel: 'ARC-D',
          },
        ],
        container: {
          id: '2cmllrqm3sozh3aacie7',
          icon: 'fa fa-building',
          heading: 'Grants Team',
          itemType: 'container',
          subHeading: 'Select the relevant grants team(s) for your query',
          controlName: 'step-container',
          displayText: 'Workflow Step',
          alwaysVisible: true,
          selectedControlOption: '',
          selectedControlHeading: '',
        },
      },
      {
        children: [
          {
            id: 'bib4qd4wmdoz6mjufw2bj',
            icon: 'far fa-dot-circle',
            items: [
              {
                id: 'cch13gaevym1mvpup2krd',
                label: 'Yes',
                value: 'Yes',
                selected: true,
              },
              {
                id: '20riikh1v730ayqxvu7t834',
                label: 'No',
                value: 'No',
                selected: false,
              },
            ],
            category: 'other-elements',
            itemType: 'control',
            required: true,
            labelName: 'Is UOM the lead?',
            containerId: 'mp8lgms6fy9w5f4vvm5z1',
            controlName: 'radio-group',
            description: '',
            displayText: 'Radio',
            selectedOptionId: 'cch13gaevym1mvpup2krd',
            selectedOptionLabel: 'Yes',
          },
        ],
        container: {
          id: 'mp8lgms6fy9w5f4vvm5z1',
          icon: 'fa fa-building',
          heading: 'Project Details',
          itemType: 'container',
          subHeading: 'Information about your project',
          controlName: 'step-container',
          displayText: 'Workflow Step',
          alwaysVisible: false,
          selectedControlOption: 'Complex',
          selectedControlHeading: 'Query Type',
        },
      },
    ],
    created_at: '2025-10-25T04:54:57.895992+00:00',
    updated_at: '2025-10-25T04:54:57.895992+00:00',
  };

  const formData = {
    'Your Name': 'Brady',
    'Grant Team': ['ARC-D'],
    'Query Type': 'Complex',
    'Your Email': 'bradysuryasie@gmail.com',
    'Is UOM the lead?': 'Yes',
  };

  const result = matchFaqWithSubmission(faq, formData);

  // Should match: ARC-D, Grant Team, Grants Team, Yes, Is UOM the lead?, Project Details, Complex
  expect(result.matchScore).toBeGreaterThan(0);
    expect(result.matchedSelections).toContain('ARC-D');
    expect(result.matchedSelections).toContain('Grant Team');
    expect(result.matchedSelections).toContain('Yes');
    expect(result.matchedSelections).toContain('Complex');
  
  console.log('✅ Match Score:', result.matchScore);
  console.log('✅ Matched Selections:', result.matchedSelections);
});