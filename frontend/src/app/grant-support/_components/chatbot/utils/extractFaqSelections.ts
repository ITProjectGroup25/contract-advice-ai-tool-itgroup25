/**
 * Extracts selected values from FAQ structure (form builder format)
 * Handles nested selections array with children and container objects
 * Only extracts the actual selected option values/labels, not field names or container headings
 * 
 * @param faq - The FAQ object to extract selections from
 * @returns Array of unique, non-empty string selections
 * 
 * @example
 * const faq = {
 *   selections: [{
 *     children: [{
 *       items: [{ value: "ARC-D", selected: true }],
 *       selectedOptionLabel: "ARC-D"
 *     }],
 *     container: { heading: "Grants Team" }
 *   }]
 * };
 * extractFaqSelections(faq); // ["ARC-D"]
 */
export function extractFaqSelections(faq: any): string[] {
  const selections: string[] = [];
  
  // Handle FAQ with selections array (SelectedFormSectionsType)
  if (faq.selections && Array.isArray(faq.selections)) {
    faq.selections.forEach((section: any) => {
      // Extract from children array in each section
      if (section.children && Array.isArray(section.children)) {
        section.children.forEach((child: any) => {
          // Only extract selectedOptionLabel - this is the user's actual selection
          if (child.selectedOptionLabel !== null && child.selectedOptionLabel !== undefined) {
            selections.push(String(child.selectedOptionLabel));
          }
        });
      }
    });
  }
  
  // Filter out empty strings and remove duplicates
  const filtered = selections.filter(s => s && s.trim().length > 0);
  return Array.from(new Set(filtered));
}