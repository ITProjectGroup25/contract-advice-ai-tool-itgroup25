import { getFaqs } from "@/app/actions/getFaqs";
import { getSubmission } from "@/app/actions/getSubmission";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SelectedFormSectionsType } from "../selected-sections.type";
import { extractFaqSelections } from "./utils/extractFaqSelections";
import { matchFaqWithSubmission } from "./utils/faqMatchingUtils";

export interface SubmissionFormData {
  [key: string]: unknown;
}

interface Submission {
  submission_uid: string;
  form_data: SubmissionFormData;
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

const FAQ_STALE_TIME = 30 * 60 * 1000; // 30 minutes
const FAQ_GC_TIME = 45 * 60 * 1000; // 45 minutes
const SUBMISSION_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const SUBMISSION_GC_TIME = 10 * 60 * 1000; // 10 minutes

export const faqQueryKey = (formId: number) => ["faqs", formId] as const;
export const submissionQueryKey = (submissionUid: string) =>
  ["submission", submissionUid] as const;

async function fetchFaqs(formId: number): Promise<FAQ[]> {
  const faqsResult = await getFaqs({ formId });

  if (faqsResult.message === "error") {
    throw new Error(faqsResult.error || "Failed to fetch FAQs");
  }

  return faqsResult.data || [];
}

async function fetchSubmission(submissionUid: string): Promise<Submission> {
  const submissionResult = await getSubmission({ submissionUid });

  if (submissionResult.message === "error") {
    throw new Error(submissionResult.error || "Failed to fetch submission");
  }

  if (!submissionResult.data) {
    throw new Error("Submission not found");
  }

  return submissionResult.data;
}

export async function prefetchFaqs(queryClient: QueryClient, formId: number) {
  if (!formId) {
    return;
  }

  await queryClient.prefetchQuery({
    queryKey: faqQueryKey(formId),
    queryFn: () => fetchFaqs(formId),
    staleTime: FAQ_STALE_TIME,
    gcTime: FAQ_GC_TIME,
  });
}

export async function prefetchSubmission(
  queryClient: QueryClient,
  submissionUid: string | undefined
) {
  if (!submissionUid) {
    return;
  }

  await queryClient.prefetchQuery({
    queryKey: submissionQueryKey(submissionUid),
    queryFn: () => fetchSubmission(submissionUid),
    staleTime: SUBMISSION_STALE_TIME,
    gcTime: SUBMISSION_GC_TIME,
  });
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
  const isFaqQueryEnabled = enabled && typeof formId === "number";
  const isSubmissionQueryEnabled = enabled && !!submissionUid;

  const faqsQuery = useQuery({
    queryKey:
      isFaqQueryEnabled && typeof formId === "number"
        ? faqQueryKey(formId)
        : ["faqs", "disabled"],
    queryFn: () => fetchFaqs(formId as number),
    enabled: isFaqQueryEnabled,
    staleTime: FAQ_STALE_TIME,
    gcTime: FAQ_GC_TIME,
  });

  const submissionQuery = useQuery({
    queryKey:
      isSubmissionQueryEnabled && submissionUid
        ? submissionQueryKey(submissionUid)
        : ["submission", "disabled"],
    queryFn: () => fetchSubmission(submissionUid as string),
    enabled: isSubmissionQueryEnabled,
    staleTime: SUBMISSION_STALE_TIME,
    gcTime: SUBMISSION_GC_TIME,
  });

  const matchedFaqs = useMemo(() => {
    if (!faqsQuery.data || !submissionQuery.data) {
      return [] as MatchedFAQ[];
    }

    return faqsQuery.data
      .map((faq: FAQ) => matchFaqWithSubmission(faq, submissionQuery.data.form_data))
      .filter((faq: MatchedFAQ) => faq.matchScore > 0)
      .sort((a: MatchedFAQ, b: MatchedFAQ) => b.matchScore - a.matchScore);
  }, [faqsQuery.data, submissionQuery.data]);

  const isLoading =
    (isFaqQueryEnabled && faqsQuery.isPending) ||
    (isSubmissionQueryEnabled && submissionQuery.isPending);

  const error =
    (submissionQuery.error as Error | undefined) ??
    (faqsQuery.error as Error | undefined) ??
    null;

  return {
    matchedFaqs,
    allFaqs: faqsQuery.data || [],
    submission: submissionQuery.data || null,
    isLoading,
    error,
  };
}
