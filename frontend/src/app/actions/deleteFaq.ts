"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

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

type DeleteFaqArgs = {
  faqId: number;
};

/**
 * Delete an FAQ
 */
export async function deleteFaq({ faqId }: DeleteFaqArgs): Promise<Return> {
  try {
    if (!faqId) {
      return {
        message: "error",
        error: "FAQ ID is required",
      };
    }

    // Delete the FAQ
    const { data, error } = await supabaseAdmin
      .from("grant_support_faqs")
      .delete()
      .eq("id", faqId)
      .select()
      .single();

    if (error) {
      console.error("Supabase delete error:", error);
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
    console.error("Delete FAQ error:", error);
    return {
      message: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all FAQs for a specific form
 */

/**
 * Get a single FAQ by ID
 */
export async function getFaqById(faqId: number): Promise<Return> {
  try {
    if (!faqId) {
      return {
        message: "error",
        error: "FAQ ID is required",
      };
    }

    const { data, error } = await supabaseAdmin
      .from("grant_support_faqs")
      .select("*")
      .eq("id", faqId)
      .single();

    if (error) {
      console.error("Supabase select error:", error);
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

    return {
      message: "success",
      data,
    };
  } catch (error) {
    console.error("Get FAQ error:", error);
    return {
      message: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
