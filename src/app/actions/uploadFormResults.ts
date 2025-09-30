"use server";
import { db } from "@/db";

import { z } from "zod";
import { formResults } from "../../../drizzle/schema";

// Schema for individual field responses within a container
const ContainerResponseItemSchema = z.record(
  z.string(), // Field label name
  z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
);

// Schema for responses grouped by container
const ResponsesByContainerSchema = z.record(
  z.string(), // Container name
  z.array(ContainerResponseItemSchema)
);

// Main form submission schema
export const FormSubmissionSchema = z.object({
  formId: z.number(),
  formName: z.string(),
  submittedAt: z.string().datetime(), // ISO 8601 datetime string
  responses: ResponsesByContainerSchema,
});

export type FormSubmissionType = z.infer<typeof FormSubmissionSchema>;

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
