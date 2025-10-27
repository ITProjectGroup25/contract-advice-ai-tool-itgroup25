// @ts-ignore
import { describe, expect, test } from 'bun:test';
import { extractFaqSelections } from './extractFaqSelections';

describe('extractFaqSelections', () => {
  test('should extract selected items from selections array', () => {
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
            },
          ],
          container: {
            id: 'section1',
            heading: 'Grants Team',
          },
        },
      ],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('ARC-D');
    expect(result).not.toContain('NHMRC');
    expect(result).toContain('Grant Team');
    expect(result).toContain('Grants Team');
  });

  test('should extract both value and label when they differ', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              items: [
                { value: 'arc-d', label: 'ARC Discovery', selected: true },
              ],
              labelName: 'Grant Type',
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('arc-d');
    expect(result).toContain('ARC Discovery');
    expect(result).toContain('Grant Type');
  });

  test('should not duplicate label when it matches value', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              items: [
                { value: 'ARC-D', label: 'ARC-D', selected: true },
              ],
              labelName: 'Grant Team',
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result.filter(s => s === 'ARC-D').length).toBe(1);
  });

  test('should extract selectedOptionLabel from children', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              id: 'field1',
              items: [],
              labelName: 'Query Type',
              selectedOptionLabel: 'Complex',
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('Complex');
    expect(result).toContain('Query Type');
  });

  test('should extract labelName from all children', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              labelName: 'Grant Team',
              items: [],
            },
            {
              labelName: 'Is UOM the lead?',
              items: [],
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('Grant Team');
    expect(result).toContain('Is UOM the lead?');
  });

  test('should extract container heading', () => {
    const faq = {
      selections: [
        {
          children: [],
          container: {
            heading: 'Project Details',
          },
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('Project Details');
  });

  test('should extract container selectedControlOption', () => {
    const faq = {
      selections: [
        {
          children: [],
          container: {
            heading: 'Query Info',
            selectedControlOption: 'Complex',
          },
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('Query Info');
    expect(result).toContain('Complex');
  });

  test('should handle multiple sections', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              items: [
                { value: 'ARC-D', label: 'ARC-D', selected: true },
              ],
              labelName: 'Grant Team',
            },
          ],
          container: {
            heading: 'Grants Team',
          },
        },
        {
          children: [
            {
              items: [
                { value: 'Yes', label: 'Yes', selected: true },
              ],
              labelName: 'Is UOM the lead?',
            },
          ],
          container: {
            heading: 'Project Details',
          },
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('ARC-D');
    expect(result).toContain('Grant Team');
    expect(result).toContain('Grants Team');
    expect(result).toContain('Yes');
    expect(result).toContain('Is UOM the lead?');
    expect(result).toContain('Project Details');
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
                { id: '3', value: 'RDS', label: 'RDS', selected: false },
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

    expect(result).toContain('ARC-D');
    expect(result).toContain('Grant Team');
    expect(result).toContain('Grants Team');
    expect(result).toContain('Yes');
    expect(result).toContain('Is UOM the lead?');
    expect(result).toContain('Project Details');
    expect(result).toContain('Complex');
    expect(result).not.toContain('Health And Medical');
    expect(result).not.toContain('No');
  });

  test('should handle null and undefined values gracefully', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              items: [
                { value: null, label: 'Valid', selected: true },
                { value: 'Valid', label: undefined, selected: true },
              ],
              labelName: null,
              selectedOptionLabel: undefined,
            },
          ],
          container: {
            heading: null,
            selectedControlOption: undefined,
          },
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('Valid');
    expect(result.length).toBe(1);
  });

  test('should filter out empty strings', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              items: [
                { value: '', label: 'Valid', selected: true },
                { value: '  ', label: 'Also Valid', selected: true },
              ],
              labelName: '',
            },
          ],
          container: {
            heading: '   ',
          },
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('Valid');
    expect(result).toContain('Also Valid');
    expect(result).not.toContain('');
    expect(result).not.toContain('   ');
  });

  test('should remove duplicate selections', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              items: [
                { value: 'Duplicate', label: 'Duplicate', selected: true },
              ],
              labelName: 'Field Name',
              selectedOptionLabel: 'Duplicate',
            },
          ],
          container: {
            heading: 'Duplicate',
          },
        },
      ],
    };

    const result = extractFaqSelections(faq);

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

    expect(result).toContain('Section Heading');
  });

  test('should handle sections without container', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              items: [
                { value: 'Test', label: 'Test', selected: true },
              ],
              labelName: 'Field',
            },
          ],
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('Test');
    expect(result).toContain('Field');
  });

  test('should handle children without items', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              labelName: 'Just a Label',
              selectedOptionLabel: 'Selected Value',
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('Just a Label');
    expect(result).toContain('Selected Value');
  });

  test('should convert non-string values to strings', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              items: [
                { value: 123, label: true, selected: true },
              ],
              labelName: 456,
              selectedOptionLabel: false,
            },
          ],
          container: {
            heading: 789,
          },
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('123');
    expect(result).toContain('true');
    expect(result).toContain('456');
    expect(result).toContain('false');
    expect(result).toContain('789');
  });

  test('should only extract items where selected is true', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              items: [
                { value: 'Selected', label: 'Selected', selected: true },
                { value: 'Not Selected 1', label: 'Not Selected 1', selected: false },
                { value: 'Not Selected 2', label: 'Not Selected 2' }, // missing selected
              ],
              labelName: 'Field',
            },
          ],
          container: {},
        },
      ],
    };

    const result = extractFaqSelections(faq);

    expect(result).toContain('Selected');
    expect(result).not.toContain('Not Selected 1');
    expect(result).not.toContain('Not Selected 2');
  });

  test('should handle complex nested structure with multiple selected items', () => {
    const faq = {
      selections: [
        {
          children: [
            {
              items: [
                { value: 'Item1', label: 'Label1', selected: true },
                { value: 'Item2', label: 'Label2', selected: true },
                { value: 'Item3', label: 'Label3', selected: false },
              ],
              labelName: 'Multi Select Field',
              selectedOptionLabel: 'Option A',
            },
            {
              items: [
                { value: 'ItemX', label: 'LabelX', selected: true },
              ],
              labelName: 'Another Field',
              selectedOptionLabel: 'Option B',
            },
          ],
          container: {
            heading: 'Section 1',
            selectedControlOption: 'Control A',
          },
        },
        {
          children: [
            {
              items: [
                { value: 'ItemY', label: 'LabelY', selected: true },
              ],
              labelName: 'Third Field',
            },
          ],
          container: {
            heading: 'Section 2',
            selectedControlOption: 'Control B',
          },
        },
      ],
    };

    const result = extractFaqSelections(faq);

    // Selected items
    expect(result).toContain('Item1');
    expect(result).toContain('Label1');
    expect(result).toContain('Item2');
    expect(result).toContain('Label2');
    expect(result).toContain('ItemX');
    expect(result).toContain('LabelX');
    expect(result).toContain('ItemY');
    expect(result).toContain('LabelY');

    // Field names
    expect(result).toContain('Multi Select Field');
    expect(result).toContain('Another Field');
    expect(result).toContain('Third Field');

    // Selected option labels
    expect(result).toContain('Option A');
    expect(result).toContain('Option B');

    // Container data
    expect(result).toContain('Section 1');
    expect(result).toContain('Section 2');
    expect(result).toContain('Control A');
    expect(result).toContain('Control B');

    // Not selected
    expect(result).not.toContain('Item3');
    expect(result).not.toContain('Label3');
  });
});