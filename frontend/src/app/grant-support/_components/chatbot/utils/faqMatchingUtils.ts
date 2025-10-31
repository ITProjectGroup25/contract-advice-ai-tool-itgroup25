import { FAQ, MatchedFAQ, SubmissionFormData } from "../useGetFaq";
import { extractFaqSelections } from "./extractFaqSelections";

/**
 * Normalizes form_data values for matching
 * Handles arrays and nested values, converting them to lowercase strings
 * 
 * @param value - The value to normalize (can be string, number, array, etc.)
 * @returns Array of normalized lowercase string values
 * 
 * @example
 * normalizeFormDataValue("Hello"); // ["hello"]
 * normalizeFormDataValue(["A", "B"]); // ["a", "b"]
 * normalizeFormDataValue(null); // []
 */
export function normalizeFormDataValue(value: any): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  
  if (Array.isArray(value)) {
    return value
      .filter(v => v !== null && v !== undefined)
      .map(v => String(v).toLowerCase().trim())
      .filter(v => v.length > 0);
  }
  
  const stringValue = String(value).toLowerCase().trim();
  return stringValue.length > 0 ? [stringValue] : [];
}

/**
 * Normalizes form data into key-value pairs for matching
 * 
 * @param formData - The form data object to normalize
 * @returns Array of objects containing normalized keys and values
 * 
 * @example
 * normalizeFormData({ "Grant Team": ["ARC-D"], "Name": "John" });
 * // [
 * //   { key: "grant team", values: ["arc-d"] },
 * //   { key: "name", values: ["john"] }
 * // ]
 */
export function normalizeFormData(formData: SubmissionFormData): Array<{ key: string; values: string[] }> {
  const formDataEntries: Array<{ key: string; values: string[] }> = [];
  
  Object.entries(formData).forEach(([key, value]) => {
    if (key !== null && key !== undefined) {
      formDataEntries.push({
        key: String(key).toLowerCase().trim(),
        values: normalizeFormDataValue(value)
      });
    }
  });
  
  return formDataEntries;
}

/**
 * Checks if a selection matches any form data entry
 * Uses partial string matching (includes) for both keys and values
 * 
 * @param selection - The selection string to match
 * @param formDataEntries - Normalized form data entries
 * @returns true if selection matches any key or value
 * 
 * @example
 * const entries = [{ key: "grant team", values: ["arc-d"] }];
 * isSelectionMatched("arc-d", entries); // true
 * isSelectionMatched("grant", entries); // true (matches key)
 * isSelectionMatched("other", entries); // false
 */
export function isSelectionMatched(
  selection: string,
  formDataEntries: Array<{ key: string; values: string[] }>
): boolean {
  const selectionLower = selection.toLowerCase().trim();
  
  // Skip empty selections
  if (!selectionLower) {
    return false;
  }
  
  for (const entry of formDataEntries) {
    // Check if selection matches the field name (key)
    if (entry.key.includes(selectionLower) || selectionLower.includes(entry.key)) {
      return true;
    }
    
    // Check if selection matches any of the values
    for (const value of entry.values) {
      if (value.includes(selectionLower) || selectionLower.includes(value)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Compares form_data from submission with selections from FAQs
 * Returns a match score based on how many selections match form_data values
 * 
 * @param faq - The FAQ object to match
 * @param formData - The form submission data
 * @returns MatchedFAQ object with match score and matched selections
 * 
 * @example
 * const faq = {
 *   id: 1,
 *   name: "Test FAQ",
 *   selections: ["ARC-D", "Complex"],
 *   // ... other fields
 * };
 * const formData = { "Grant Team": ["ARC-D"], "Query Type": "Complex" };
 * const result = matchFaqWithSubmission(faq, formData);
 * // result.matchScore = 100 (2/2 matched)
 * // result.matchedSelections = ["ARC-D", "Complex"]
 */
export function matchFaqWithSubmission(faq: FAQ, formData: SubmissionFormData): MatchedFAQ {
  // Extract selections from FAQ (handles both flat and nested structures)
  const selections = extractFaqSelections(faq);

  console.log({selections})
  
  if (!selections || selections.length === 0) {
    return {
      ...faq,
      matchScore: 0,
      matchedSelections: [],
    };
  }

  const matchedSelections: string[] = [];
  
  // Normalize all form data values (including arrays)
  const formDataEntries = normalizeFormData(formData);

  // Check each selection against form data
  selections.forEach((selection) => {
    // Ensure selection is a string (extra safety check)
    if (!selection || typeof selection !== 'string') {
      return;
    }
    
    if (isSelectionMatched(selection, formDataEntries)) {
      matchedSelections.push(selection);
    }
  });

  // Calculate match score as percentage of selections matched
  const matchScore = selections.length > 0 
    ? (matchedSelections.length / selections.length) * 100 
    : 0;

  return {
    ...faq,
    matchScore,
    matchedSelections,
  };
}

/**
 * Filters and sorts FAQs by match score
 * 
 * @param faqs - Array of FAQs to match
 * @param formData - The form submission data
 * @param minScore - Minimum match score to include (default: 0)
 * @returns Array of matched FAQs sorted by score (highest first)
 * 
 * @example
 * const faqs = [faq1, faq2, faq3];
 * const formData = { "Grant Team": ["ARC-D"] };
 * const matched = matchAndSortFaqs(faqs, formData, 50);
 * // Returns only FAQs with 50%+ match, sorted by score
 */
export function matchAndSortFaqs(
  faqs: FAQ[],
  formData: SubmissionFormData,
  minScore: number = 0
): MatchedFAQ[] {
  return faqs
    .map(faq => matchFaqWithSubmission(faq, formData))
    .filter(faq => faq.matchScore > minScore)
    .sort((a, b) => b.matchScore - a.matchScore);
}
