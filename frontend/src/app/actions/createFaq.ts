"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { SelectedFormSectionsType } from "../grant-support/_components/selected-sections.type";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL environment variable is not set");
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

type Return = {
  message: string;
  data?: any;
  error?: string;
};

type CreateFaqArgs = {
  formId: number;
  answer: string;
  selections: SelectedFormSectionsType;
  faqName: string;
};

/**
 * Create a new FAQ for a form
 */
export async function createFaq({
  formId,
  answer,
  selections,
  faqName,
}: CreateFaqArgs): Promise<Return> {
  console.log("=== createFaq SERVER ACTION called ===");
  console.log("formId:", formId);
  console.log("answer:", answer);
  console.log("selections:", JSON.stringify(selections, null, 2));
  console.log("name:", faqName);

  try {
    if (!formId) {
      console.error("Validation failed: Form ID is required");
      return {
        message: "error",
        error: "Form ID is required",
      };
    }

    if (!answer || answer.trim().length === 0) {
      console.error("Validation failed: Answer is required");
      return {
        message: "error",
        error: "Answer is required",
      };
    }

    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      console.error(
        "Validation failed: Sections must be a valid non-empty array"
      );
      return {
        message: "error",
        error: "Sections must be a valid non-empty array",
      };
    }

    // Verify at least one field has a selection
    const hasSelections = selections.some((section) =>
      section.children.some((field) => field.selectedOptionId !== undefined)
    );

    if (!hasSelections) {
      console.error(
        "Validation failed: At least one field selection is required"
      );
      return {
        message: "error",
        error: "At least one field selection is required",
      };
    }

    console.log(
      "All validations passed, attempting to insert into database..."
    );

    // Insert the new FAQ
    const insertData = {
      form_id: formId,
      answer: answer.trim(),
      selections: selections,
      name: faqName,
    };

    console.log("Insert data:", JSON.stringify(insertData, null, 2));

    const { data, error } = await supabaseAdmin
      .from("grant_support_faqs")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return {
        message: "error",
        error: error.message,
      };
    }

    console.log("Successfully inserted FAQ, returned data:", data);

    // Revalidate the path to update the cache
    revalidatePath("/grant-support");

    return {
      message: "success",
      data,
    };
  } catch (error) {
    console.error("Create FAQ error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return {
      message: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
