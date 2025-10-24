import { z } from "zod";
import {
  FormSectionChildrenItemsSchema,
  FormSectionChildrenSchema,
  FormSectionContainerSchema,
} from "./types";

// Extended schema for a selected option item
export const SelectedFormSectionChildrenItemsSchema =
  FormSectionChildrenItemsSchema.extend({
    selected: z.boolean().default(false),
  });
export type SelectedFormSectionChildrenItemsType = z.infer<
  typeof SelectedFormSectionChildrenItemsSchema
>;

// Extended schema for form field children with selected option tracking
export const SelectedFormSectionChildrenSchema =
  FormSectionChildrenSchema.extend({
    items: z.array(SelectedFormSectionChildrenItemsSchema).optional(),
    selectedOptionId: z.string().or(z.number()).optional(), // The option that was selected
    selectedOptionLabel: z.string().optional(), // The label of the selected option
  });
export type SelectedFormSectionChildrenType = z.infer<
  typeof SelectedFormSectionChildrenSchema
>;

// Extended schema for form section
export const SelectedFormSectionSchema = z.object({
  container: FormSectionContainerSchema,
  children: z.array(SelectedFormSectionChildrenSchema),
});
export type SelectedFormSectionType = z.infer<typeof SelectedFormSectionSchema>;

// Array of selected sections (this is what goes in the JSONB column)
export const SelectedFormSectionsSchema = z.array(SelectedFormSectionSchema);
export type SelectedFormSectionsType = z.infer<
  typeof SelectedFormSectionsSchema
>;

// Alternative: Simpler selection schema (just the selected fields)
// This is a more compact representation that only stores selected fields
export const CompactFieldSelectionSchema = z.object({
  fieldId: z.string(),
  fieldLabel: z.string(),
  controlName: z.string(),
  optionId: z.string(),
  optionLabel: z.string(),
  containerId: z.string().optional(),
  sectionHeading: z.string().optional(), // Which section this field belongs to
});
export type CompactFieldSelectionType = z.infer<
  typeof CompactFieldSelectionSchema
>;

export const CompactSelectionsSchema = z.array(CompactFieldSelectionSchema);
export type CompactSelectionsType = z.infer<typeof CompactSelectionsSchema>;

// Helper function to convert FormSectionsType to SelectedFormSectionsType
// with specific field selections applied
// Only includes sections that have at least one selected field
export function applySelections(
  sections: any[], // FormSectionsType
  selections: { fieldId: string; optionId: string }[]
): SelectedFormSectionsType {
  const selectedSections = sections
    .map((section) => {
      // Filter children to only include fields with selections
      const selectedChildren = section.children
        .map((field: any) => {
          const selection = selections.find(
            (s) => s.fieldId === field.id.toString()
          );

          if (selection && field.items) {
            const selectedOption = field.items.find(
              (item: any) => item.id.toString() === selection.optionId
            );

            return {
              ...field,
              selectedOptionId: selection.optionId,
              selectedOptionLabel: selectedOption?.label,
              items: field.items.map((item: any) => ({
                ...item,
                selected: item.id.toString() === selection.optionId,
              })),
            };
          }

          return null; // Don't include fields without selections
        })
        .filter((field: any) => field !== null); // Remove null entries

      // Only return section if it has selected children
      if (selectedChildren.length > 0) {
        return {
          container: section.container,
          children: selectedChildren,
        };
      }

      return null; // Don't include sections without selected children
    })
    .filter((section: any) => section !== null); // Remove null entries

  return selectedSections as SelectedFormSectionsType;
}

// Helper function to extract compact selections from SelectedFormSectionsType
export function extractCompactSelections(
  sections: SelectedFormSectionsType
): CompactSelectionsType {
  const selections: CompactFieldSelectionType[] = [];

  sections.forEach((section) => {
    section.children.forEach((field) => {
      if (field.selectedOptionId && field.selectedOptionLabel) {
        selections.push({
          fieldId: field.id.toString(),
          fieldLabel: field.labelName,
          controlName: field.controlName,
          optionId: field.selectedOptionId.toString(),
          optionLabel: field.selectedOptionLabel,
          containerId: field.containerId,
          sectionHeading: section.container.heading,
        });
      }
    });
  });

  return selections;
}

// Helper function to count selections in sections
export function countSelections(sections: SelectedFormSectionsType): number {
  return sections.reduce((count, section) => {
    return (
      count +
      section.children.filter((field) => field.selectedOptionId !== undefined)
        .length
    );
  }, 0);
}

// Helper function to check if sections match a specific pattern
export function matchesPattern(
  sections: SelectedFormSectionsType,
  pattern: { fieldId: string; optionId: string }[]
): boolean {
  const selectedFields = extractCompactSelections(sections);

  // Check if all pattern items are present
  return pattern.every((patternItem) =>
    selectedFields.some(
      (field) =>
        field.fieldId === patternItem.fieldId &&
        field.optionId === patternItem.optionId
    )
  );
}

// Example usage:
/*
// 1. Full sections with selections marked
const selectedSections: SelectedFormSectionsType = [
  {
    container: {
      controlName: "step-container",
      displayText: "Contact Information",
      itemType: "container",
      icon: "fa fa-user",
      heading: "Your Details",
      subHeading: "Please provide your contact information",
      id: "section_1",
      alwaysVisible: true,
    },
    children: [
      {
        controlName: "radio-group",
        displayText: "Query Type",
        description: "Select your query type",
        labelName: "Query Type",
        itemType: "control",
        icon: "fas fa-question",
        required: true,
        category: "selection",
        id: "123",
        containerId: "section_1",
        selectedOptionId: "tech",
        selectedOptionLabel: "Technical Support",
        items: [
          {
            id: "tech",
            value: "technical",
            label: "Technical Support",
            selected: true,
          },
          {
            id: "billing",
            value: "billing",
            label: "Billing Question",
            selected: false,
          },
        ],
      },
    ],
  },
];

// 2. Compact selections (what we store in the database)
const compactSelections: CompactSelectionsType = [
  {
    fieldId: "123",
    fieldLabel: "Query Type",
    controlName: "radio-group",
    optionId: "tech",
    optionLabel: "Technical Support",
    containerId: "section_1",
    sectionHeading: "Your Details",
  },
];
*/
