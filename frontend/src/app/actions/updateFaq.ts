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

type UpdateFaqArgs = {
  faqId: number;
  name?: string;
  answer?: string;
  selections?: SelectedFormSectionsType;
};

/**
 * Update an existing FAQ
 */
export async function updateFaq({
  faqId,
  name,
  answer,
  selections,
}: UpdateFaqArgs): Promise<Return> {
  try {
    if (!faqId) {
      return {
        message: "error",
        error: "FAQ ID is required",
      };
    }

    // Build the update object dynamically
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (name.trim().length === 0) {
        return {
          message: "error",
          error: "Name cannot be empty",
        };
      }
      updateData.name = name.trim();
    }

    if (answer !== undefined) {
      if (answer.trim().length === 0) {
        return {
          message: "error",
          error: "Answer cannot be empty",
        };
      }
      updateData.answer = answer.trim();
    }

    if (selections !== undefined) {
      if (!Array.isArray(selections) || selections.length === 0) {
        return {
          message: "error",
          error: "Selections must be a valid non-empty array",
        };
      }

      // Verify at least one field has a selection
      const hasSelections = selections.some((section) =>
        section.children.some((field) => field.selectedOptionId !== undefined)
      );

      if (!hasSelections) {
        return {
          message: "error",
          error: "At least one field selection is required",
        };
      }

      updateData.selections = selections;
    }

    // Update the FAQ
    const { data, error } = await supabaseAdmin
      .from("grant_support_faqs")
      .update(updateData)
      .eq("id", faqId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return {
        message: "error",
        error: error.message,
      };
    }

    if (!data) {
      return {
        message: "error",
        error: "FAQ not found",
      };
    }

    // Revalidate the path to update the cache
    revalidatePath("/grant-support");

    return {
      message: "success",
      data,
    };
  } catch (error) {
    console.error("Update FAQ error:", error);
    return {
      message: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
