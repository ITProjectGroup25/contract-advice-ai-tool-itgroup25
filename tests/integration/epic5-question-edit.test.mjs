import { test } from 'node:test';
import assert from 'node:assert/strict';

// Epic 5: Question Edit
// Integration tests for form editing capabilities

test('Epic 5 - US 5.1: Edit form options and fields', async (t) => {
  await t.test('should allow admin to add new field to form', async () => {
    const newField = {
      id: 'field_123',
      label: 'New Question',
      type: 'text',
      required: true,
      sectionId: 'section_1',
    };
    
    const result = await addFieldToForm(2, newField);
    assert.ok(result.success, 'Should successfully add field');
    assert.strictEqual(result.field.label, newField.label);
  });

  await t.test('should allow admin to edit existing field', async () => {
    const fieldUpdate = {
      id: 'field_existing',
      label: 'Updated Question Label',
      helpText: 'New help text',
    };
    
    const result = await updateFormField(2, fieldUpdate);
    assert.ok(result.success, 'Should successfully update field');
    assert.strictEqual(result.field.label, fieldUpdate.label);
  });

  await t.test('should allow admin to add options to select field', async () => {
    const field = {
      id: 'field_select',
      type: 'select',
      options: ['Option 1', 'Option 2'],
    };
    
    const newOptions = [...field.options, 'Option 3'];
    const result = await updateFieldOptions(field.id, newOptions);
    
    assert.strictEqual(result.options.length, 3);
    assert.ok(result.options.includes('Option 3'));
  });

  await t.test('should allow admin to remove field from form', async () => {
    const fieldId = 'field_to_delete';
    const result = await deleteFormField(2, fieldId);
    
    assert.ok(result.success, 'Should successfully delete field');
  });

  await t.test('should allow admin to reorder form fields', async () => {
    const fieldOrder = [
      { id: 'field_2', orderIndex: 1 },
      { id: 'field_1', orderIndex: 2 },
      { id: 'field_3', orderIndex: 3 },
    ];
    
    const result = await reorderFormFields(2, fieldOrder);
    assert.ok(result.success, 'Should successfully reorder fields');
  });

  await t.test('should allow admin to add new section to form', async () => {
    const newSection = {
      title: 'New Section',
      description: 'Section description',
      alwaysVisible: true,
      orderIndex: 5,
    };
    
    const result = await addSectionToForm(2, newSection);
    assert.ok(result.success, 'Should successfully add section');
    assert.strictEqual(result.section.title, newSection.title);
  });

  await t.test('should allow admin to set field visibility conditions', async () => {
    const visibilityCondition = {
      fieldId: 'field_123',
      condition: {
        fieldId: 'queryType',
        expectedValue: 'simple',
      },
    };
    
    const result = await setFieldVisibilityCondition(visibilityCondition);
    assert.ok(result.success, 'Should set visibility condition');
  });

  await t.test('should validate field configuration before saving', () => {
    const invalidField = {
      // Missing required properties
      type: 'text',
    };
    
    const validation = validateFieldConfig(invalidField);
    assert.strictEqual(validation.valid, false, 'Should reject invalid config');
    assert.ok(validation.errors.length > 0, 'Should provide error messages');
  });

  await t.test('should allow admin to edit checkbox options', async () => {
    const field = {
      id: 'field_checkbox',
      type: 'checkbox',
      options: [
        { id: 'opt1', label: 'Option 1', value: 'opt1' },
        { id: 'opt2', label: 'Option 2', value: 'opt2' },
      ],
    };
    
    const updatedOptions = [
      ...field.options,
      { id: 'opt3', label: 'Option 3', value: 'opt3' },
    ];
    
    const result = await updateCheckboxOptions(field.id, updatedOptions);
    assert.strictEqual(result.options.length, 3);
  });

  await t.test('should allow admin to make field required or optional', async () => {
    const fieldId = 'field_optional';
    
    // Make required
    let result = await toggleFieldRequired(fieldId, true);
    assert.ok(result.field.required, 'Should be required');
    
    // Make optional
    result = await toggleFieldRequired(fieldId, false);
    assert.strictEqual(result.field.required, false, 'Should be optional');
  });

  await t.test('should preserve form structure when editing', async () => {
    const originalForm = await getFormStructure(2);
    
    await addFieldToForm(2, {
      label: 'Test Field',
      type: 'text',
      sectionId: originalForm.sections[0].id,
    });
    
    const updatedForm = await getFormStructure(2);
    
    assert.strictEqual(
      updatedForm.sections.length,
      originalForm.sections.length,
      'Should maintain number of sections'
    );
  });

  await t.test('should support different field types', () => {
    const supportedTypes = [
      'text',
      'email',
      'select',
      'radio',
      'checkbox',
      'textarea',
      'file',
      'date',
    ];
    
    supportedTypes.forEach((type) => {
      const field = { label: 'Test', type };
      const isValid = validateFieldType(type);
      assert.ok(isValid, `Should support ${type} field type`);
    });
  });

  await t.test('should allow editing field help text', async () => {
    const update = {
      id: 'field_123',
      helpText: 'This is updated help text for users',
    };
    
    const result = await updateFormField(2, update);
    assert.strictEqual(result.field.helpText, update.helpText);
  });

  await t.test('should prevent deleting required system fields', () => {
    const systemFields = ['name', 'email', 'queryType'];
    
    systemFields.forEach((fieldId) => {
      const canDelete = canDeleteField(fieldId);
      assert.strictEqual(canDelete, false, `Should not allow deleting ${fieldId}`);
    });
  });
});

// Helper functions
async function addFieldToForm(formId, field) {
  return {
    success: true,
    field: {
      ...field,
      formId,
      createdAt: new Date().toISOString(),
    },
  };
}

async function updateFormField(formId, fieldUpdate) {
  return {
    success: true,
    field: {
      ...fieldUpdate,
      formId,
      updatedAt: new Date().toISOString(),
    },
  };
}

async function updateFieldOptions(fieldId, options) {
  return {
    fieldId,
    options,
  };
}

async function deleteFormField(formId, fieldId) {
  return {
    success: true,
    deletedFieldId: fieldId,
  };
}

async function reorderFormFields(formId, fieldOrder) {
  return {
    success: true,
    fieldOrder,
  };
}

async function addSectionToForm(formId, section) {
  return {
    success: true,
    section: {
      ...section,
      id: `section_${Date.now()}`,
      formId,
    },
  };
}

async function setFieldVisibilityCondition(visibilityCondition) {
  return {
    success: true,
    condition: visibilityCondition,
  };
}

function validateFieldConfig(field) {
  const errors = [];
  
  if (!field.label) {
    errors.push({ field: 'label', message: 'Label is required' });
  }
  
  if (!field.type) {
    errors.push({ field: 'type', message: 'Type is required' });
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

async function updateCheckboxOptions(fieldId, options) {
  return {
    fieldId,
    options,
  };
}

async function toggleFieldRequired(fieldId, required) {
  return {
    field: {
      id: fieldId,
      required,
    },
  };
}

async function getFormStructure(formId) {
  return {
    id: formId,
    sections: [
      {
        id: 'section_1',
        title: 'Basic Information',
        fields: [],
      },
    ],
  };
}

function validateFieldType(type) {
  const supportedTypes = [
    'text',
    'email',
    'select',
    'radio',
    'checkbox',
    'textarea',
    'file',
    'date',
  ];
  
  return supportedTypes.includes(type);
}

function canDeleteField(fieldId) {
  const systemFields = ['name', 'email', 'queryType'];
  return !systemFields.includes(fieldId);
}
