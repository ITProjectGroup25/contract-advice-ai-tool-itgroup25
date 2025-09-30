"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { formResults } from "../../../drizzle/schema";

export async function deleteSubmission(formSubmissionId: number) {
  if (!formSubmissionId || formSubmissionId === null) {
    throw new Error("Invalid submission ID");
  }

  try {
    // Delete the row from form_results table
    const deletedRows = await db
      .delete(formResults)
      .where(eq(formResults.id, formSubmissionId))
      .returning();

    if (deletedRows.length === 0) {
      throw new Error("Submission not found");
    }

    // Revalidate the results page to reflect the deletion
    revalidatePath("/forms/[formId]/results");

    return {
      success: true,
      message: "Submission deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting submission:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete submission"
    );
  }
}
