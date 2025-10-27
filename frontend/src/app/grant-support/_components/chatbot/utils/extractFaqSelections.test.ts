// @ts-expect-error
import { describe, expect, test } from 'bun:test';
import { extractFaqFieldInfo } from './extractFaqFieldInfo';
import { extractFaqSelections } from './extractFaqSelections';

describe('extractFaqSelections', () => {
  test('should only extract selectedOptionLabel values', () => {
    const faq = {
      id: 1,
      form_id: 1,
      name: 'Test FAQ',
      answer: 'Answer',
      selections: [
        {
          children: [
            {
              id: 'field1',
              items: [
                { id: '1', value: 'ARC-D', label: 'ARC-D', selected: true },
                { id: '2', value: 'NHMRC', label: 'NHMRC', selected: false },
              ],
              labelName: 'Grant Team',
              selectedOptionLabel: 'ARC-D',
            },
          ],
          container: {
            id: 'section1',
            heading: 'Grants Team',
            selectedControlOption: 'Complex',
          },
        },
      ],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    const result = extractFaqSelections(faq);

    // Should only contain selectedOptionLabel
    expect(result).toEqual(['ARC-D']);
    // Should NOT contain field names or container headings
    expect(result).not.toContain('Grant Team');
    expect(result).not.toContain('Grants Team');
    expect(result).not.toContain('Complex');
  });

  test('should extract multiple selectedOptionLabels', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              labelName: 'Grant Team',
              selectedOptionLabel: 'ARC-D',
              items: [],
            },
            {
              labelName: 'Is UOM the lead?',
              selectedOptionLabel: 'Yes',
              items: [],
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toEqual(['ARC-D', 'Yes']);
    expect(result).not.toContain('Grant Team');
    expect(result).not.toContain('Is UOM the lead?');
  });

  test('should handle real database FAQ structure', () => {
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
              items: [
                { id: '1', value: 'Health And Medical', label: 'Health and Medical', selected: false },
                { id: '2', value: 'ARC-D', label: 'ARC-D', selected: true },
              ],
              labelName: 'Grant Team',
              selectedOptionLabel: 'ARC-D',
            },
          ],
          container: {
            id: '2cmllrqm3sozh3aacie7',
            heading: 'Grants Team',
            selectedControlOption: '',
          },
        },
        {
          children: [
            {
              id: 'bib4qd4wmdoz6mjufw2bj',
              items: [
                { id: '1', value: 'Yes', label: 'Yes', selected: true },
                { id: '2', value: 'No', label: 'No', selected: false },
              ],
              labelName: 'Is UOM the lead?',
              selectedOptionLabel: 'Yes',
            },
          ],
          container: {
            id: 'mp8lgms6fy9w5f4vvm5z1',
            heading: 'Project Details',
            selectedControlOption: 'Complex',
          },
        },
      ],
      created_at: '2025-10-25T04:54:57.895992+00:00',
      updated_at: '2025-10-25T04:54:57.895992+00:00',
    };

    const result = extractFaqSelections(faq);

    // Should only extract selectedOptionLabels
    expect(result).toEqual(['ARC-D', 'Yes']);
    
    // Should NOT extract field names or container data
    expect(result).not.toContain('Grant Team');
    expect(result).not.toContain('Grants Team');
    expect(result).not.toContain('Is UOM the lead?');
    expect(result).not.toContain('Project Details');
    expect(result).not.toContain('Complex');
  });

  test('should handle null and undefined selectedOptionLabel', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              labelName: 'Field 1',
              selectedOptionLabel: null,
            },
            {
              labelName: 'Field 2',
              selectedOptionLabel: undefined,
            },
            {
              labelName: 'Field 3',
              selectedOptionLabel: 'Valid',
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toEqual(['Valid']);
  });

  test('should filter out empty strings', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              selectedOptionLabel: '',
            },
            {
              selectedOptionLabel: '  ',
            },
            {
              selectedOptionLabel: 'Valid',
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toEqual(['Valid']);
  });

  test('should remove duplicate selections', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              selectedOptionLabel: 'Duplicate',
            },
            {
              selectedOptionLabel: 'Duplicate',
            },
            {
              selectedOptionLabel: 'Unique',
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toEqual(['Duplicate', 'Unique']);
    expect(result.filter(s => s === 'Duplicate').length).toBe(1);
  });

  test('should return empty array for FAQ with no selections', () => {
    const faq = {
      selections: [],
    };

    const result = extractFaqSelections(faq);

    expect(result).toEqual([]);
  });

  test('should return empty array for FAQ with null selections', () => {
    const faq = {
      selections: null,
    };

    const result = extractFaqSelections(faq);

    expect(result).toEqual([]);
  });

  test('should handle sections without children', () => {
    const faq = {
      selections: [
        {
          container: {
            heading: 'Section Heading',
          },
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toEqual([]);
  });
});

describe('extractFaqFieldInfo', () => {
  test('should extract question and answer pairs', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              labelName: 'Grant Team',
              selectedOptionLabel: 'ARC-D',
            },
            {
              labelName: 'Is UOM the lead?',
              selectedOptionLabel: 'Yes',
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqFieldInfo(faq);

    expect(result).toEqual([
      { question: 'Grant Team', answer: 'ARC-D' },
      { question: 'Is UOM the lead?', answer: 'Yes' },
    ]);
  });

  test('should handle real database FAQ structure', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              labelName: 'Grant Team',
              selectedOptionLabel: 'ARC-D',
            },
          ],
          container: {},
        },
        {
          children: [
            {
              labelName: 'Is UOM the lead?',
              selectedOptionLabel: 'Yes',
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqFieldInfo(faq);

    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ question: 'Grant Team', answer: 'ARC-D' });
    expect(result[1]).toEqual({ question: 'Is UOM the lead?', answer: 'Yes' });
  });

  test('should skip children without labelName or selectedOptionLabel', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              labelName: 'Valid Field',
              selectedOptionLabel: 'Valid Answer',
            },
            {
              labelName: null,
              selectedOptionLabel: 'Answer',
            },
            {
              labelName: 'Question',
              selectedOptionLabel: null,
            },
            {
              labelName: 'Another Valid',
              selectedOptionLabel: 'Another Answer',
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqFieldInfo(faq);

    expect(result).toEqual([
      { question: 'Valid Field', answer: 'Valid Answer' },
      { question: 'Another Valid', answer: 'Another Answer' },
    ]);
  });

  test('should return empty array when no valid field info', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              labelName: null,
              selectedOptionLabel: null,
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqFieldInfo(faq);

    expect(result).toEqual([]);
  });
});