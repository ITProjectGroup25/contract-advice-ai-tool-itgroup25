/**
 * Extracts selected values from FAQ structure (form builder format)
 * Handles nested selections array with children and container objects
 * 
 * @param faq - The FAQ object to extract selections from
 * @returns Array of unique, non-empty string selections
 * 
 * @example
 * const faq = {
 *   selections: [{
 *     children: [{
 *       items: [{ value: "ARC-D", selected: true }],
 *       labelName: "Grant Team"
 *     }],
 *     container: { heading: "Grants Team" }
 *   }]
 * };
 * extractFaqSelections(faq); // ["ARC-D", "Grant Team", "Grants Team"]
 */
export function extractFaqSelections(faq: any): string[] {
  const selections: string[] = [];
  
  // Handle FAQ with selections array (SelectedFormSectionsType)
  if (faq.selections && Array.isArray(faq.selections)) {
    faq.selections.forEach((section: any) => {
      // Extract from children array in each section
      if (section.children && Array.isArray(section.children)) {
        section.children.forEach((child: any) => {
          // Extract selected items
          if (child.items && Array.isArray(child.items)) {
            child.items.forEach((item: any) => {
              if (item.selected === true) {
                if (item.value !== null && item.value !== undefined) {
                  selections.push(String(item.value));
                }
                if (item.label && item.label !== item.value && item.label !== null && item.label !== undefined) {
                  selections.push(String(item.label));
                }
              }
            });
          }
          
          // Extract selectedOptionLabel
          if (child.selectedOptionLabel !== null && child.selectedOptionLabel !== undefined) {
            selections.push(String(child.selectedOptionLabel));
          }
          
          // Extract labelName (field name)
          if (child.labelName !== null && child.labelName !== undefined) {
            selections.push(String(child.labelName));
          }
        });
      }
      
      // Extract from container in each section
      if (section.container) {
        if (section.container.heading !== null && section.container.heading !== undefined) {
          selections.push(String(section.container.heading));
        }
        if (section.container.selectedControlOption !== null && section.container.selectedControlOption !== undefined) {
          selections.push(String(section.container.selectedControlOption));
        }
      }
    });
  }
  
  // Filter out empty strings and remove duplicates
  return [...new Set(selections.filter(s => s && s.trim().length > 0))];
}