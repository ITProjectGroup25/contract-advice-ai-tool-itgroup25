"use server";
import { db } from "@/db";

import { formResults } from "../../../drizzle/schema";
import {
  FormSubmissionType,
  FormSubmissionSchema,
} from "../forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";

export async function uploadFormResults(submissionData: FormSubmissionType) {
  console.log({ submissionData });

  // Validate the submission data
  const parse = FormSubmissionSchema.safeParse(submissionData);

  if (!parse.success) {
    console.log(parse.error);
    return {
      message: "Failed to validate submission data",
      error: parse.error.errors,
    };
  }

  const data = parse.data;

  try {
    const [newResult] = await db
      .insert(formResults)
      .values({
        formId: data.formId,
        submittedAt: data.submittedAt, // Use the ISO string directly, not new Date()
        results: data.responses,
      })
      .returning();

    return {
      message: "success",
      data: { id: newResult.id },
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Failed to save form results",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
