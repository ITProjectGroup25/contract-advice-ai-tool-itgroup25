"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { FormSectionsType } from "../grant-support/_components/types";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
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

type Args = {
  formId: number;
  formSections: FormSectionsType;
};

export async function updateFormFields({ formId, formSections }: Args): Promise<Return> {
  try {
    if (!formId) {
      return {
        message: "error",
        error: "Form ID is required",
      };
    }

    if (!formSections || !Array.isArray(formSections)) {
      return {
        message: "error",
        error: "Form sections must be a valid array",
      };
    }

    // Update the form_sections column in the form table
    const { data, error } = await supabaseAdmin
      .from("form")
      .update({
        form_sections: formSections,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return {
        message: "error",
        error: error.message,
      };
    }

    // Revalidate the path to update the cache
    revalidatePath("/grant-support");

    return {
      message: "success",
      data,
    };
  } catch (error) {
    console.error("Update form fields error:", error);
    return {
      message: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
