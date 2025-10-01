"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { formFaqs } from "../../../drizzle/schema";

type DeleteFAQData = {
  faqId: number;
};

type Args = DeleteFAQData;

export async function deleteFAQ({ faqId }: Args) {
  // Validate input data
  const schema = z.object({
    faqId: z.number().positive(),
  });

  const parse = schema.safeParse({ faqId });

  if (!parse.success) {
    console.log(parse.error);
    return {
      message: "Failed to validate FAQ ID",
      error: parse.error.errors,
    };
  }

  const data = parse.data;

  try {
    const [deletedFAQ] = await db
      .delete(formFaqs)
      .where(eq(formFaqs.id, data.faqId))
      .returning();

    if (!deletedFAQ) {
      return {
        message: "FAQ not found",
      };
    }

    // Revalidate any pages that might display FAQs
    revalidatePath("/forms/[formId]");

    return {
      message: "success",
      data: { faqId: deletedFAQ.id },
    };
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return {
      message: "Failed to delete FAQ",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
