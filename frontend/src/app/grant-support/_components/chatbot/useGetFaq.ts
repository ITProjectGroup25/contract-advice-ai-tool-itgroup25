import { getFaqs } from "@/app/actions/getFaqs";
import { getSubmission } from "@/app/actions/getSubmission";
import { useQuery } from "@tanstack/react-query";
import { extractFaqSelections, matchFaqWithSubmission } from "./utils/faqMatchingUtils";
import { SelectedFormSectionsType } from "../selected-sections.type";

interface FormData {
  [key: string]: any;
}

interface Submission {
  submission_uid: string;
  form_data: FormData;
}

export interface FAQ {
  id: number;
  form_id: number;
  name: string;
  answer: string;
  selections: SelectedFormSectionsType;
  created_at: string;
  updated_at: string;
}

export interface MatchedFAQ extends FAQ {
  matchScore: number;
  matchedSelections: string[];
}

interface UseGetFaqResult {
  matchedFaqs: MatchedFAQ[];
  allFaqs: FAQ[];
  submission: Submission | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseGetFaqParams {
  submissionUid: string | undefined;
  formId: number | undefined;
  enabled?: boolean;
}

/**
 * Custom hook to fetch submission data and matching FAQs using server actions
 * 
 * @param submissionUid - The unique identifier for the submission
 * @param formId - The form ID to fetch FAQs for
 * @param enabled - Whether the query should run (default: true)
 * 
 * @returns Object containing matched FAQs, all FAQs, submission data, loading state, and error
 * 
 * @example
 * const { matchedFaqs, isLoading, error } = useGetFaq({
 *   submissionUid: "abc-123",
 *   formId: 1,
 *   enabled: true
 * });
 */
export function useGetFaq({
  submissionUid,
  formId,
  enabled = true,
}: UseGetFaqParams): UseGetFaqResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ["faq-submission", submissionUid, formId],
    queryFn: async () => {
      if (!submissionUid || !formId) {
        throw new Error("Submission UID and Form ID are required");
      }

      // Fetch submission data using server action
      const submissionResult = await getSubmission({ submissionUid });

      if (submissionResult.message === "error") {
        throw new Error(submissionResult.error || "Failed to fetch submission");
      }

      if (!submissionResult.data) {
        throw new Error("Submission not found");
      }

      const submissionData = submissionResult.data;
      console.log("📋 Submission data:", submissionData);
      console.log("📝 Form data keys:", Object.keys(submissionData.form_data));

      // Fetch FAQs using server action
      const faqsResult = await getFaqs({ formId });

      if (faqsResult.message === "error") {
        throw new Error(faqsResult.error || "Failed to fetch FAQs");
      }

      const faqs = faqsResult.data || [];
      console.log("📚 Total FAQs fetched:", faqs.length);
      if (faqs.length > 0) {
        console.log("📄 First FAQ structure:", faqs[0]);
      }

      // Match FAQs with submission data
      const matchedFaqs = faqs
        .map((faq: FAQ) => {
          const matched = matchFaqWithSubmission(faq, submissionData.form_data);

          console.log({faq})

          console.log({matched})

          const selections = extractFaqSelections(faq);
          console.log(`🔍 FAQ matching result:`, {
            faqId: faq.id,
            faqName: faq.name,
            extractedSelections: selections,
            matchScore: matched.matchScore,
            matchedSelections: matched.matchedSelections
          });
          return matched;
        })
        .filter((faq: MatchedFAQ) => faq.matchScore > 0)
        .sort((a: MatchedFAQ, b: MatchedFAQ) => b.matchScore - a.matchScore);

      console.log("✅ Total matched FAQs:", matchedFaqs.length);

      return {
        submission: submissionData,
        allFaqs: faqs,
        matchedFaqs,
      };
    },
    enabled: enabled && !!submissionUid && !!formId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    matchedFaqs: data?.matchedFaqs || [],
    allFaqs: data?.allFaqs || [],
    submission: data?.submission || null,
    isLoading,
    error: error as Error | null,
  };
}