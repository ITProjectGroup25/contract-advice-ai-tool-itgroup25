/**
 * Extracts field information (question and answer pairs) from FAQ structure
 * Returns an array of objects with field names and their selected values
 * 
 * @param faq - The FAQ object to extract field information from
 * @returns Array of { question, answer } objects
 * 
 * @example
 * const faq = {
 *   selections: [{
 *     children: [{
 *       labelName: "Grant Team",
 *       selectedOptionLabel: "ARC-D"
 *     }]
 *   }]
 * };
 * extractFaqFieldInfo(faq); // [{ question: "Grant Team", answer: "ARC-D" }]
 */
export function extractFaqFieldInfo(faq: any): Array<{ question: string; answer: string }> {
  const fieldInfo: Array<{ question: string; answer: string }> = [];
  
  if (faq.selections && Array.isArray(faq.selections)) {
    faq.selections.forEach((section: any) => {
      if (section.children && Array.isArray(section.children)) {
        section.children.forEach((child: any) => {
          const question = child.labelName;
          const answer = child.selectedOptionLabel;
          
          if (question && answer) {
            fieldInfo.push({
              question: String(question),
              answer: String(answer),
            });
          }
        });
      }
    });
  }
  
  return fieldInfo;
}