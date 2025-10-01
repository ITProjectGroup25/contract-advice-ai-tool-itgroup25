"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { formFaqs } from "../../../drizzle/schema";
import { revalidatePath } from "next/cache";

type EditFAQData = {
  faqId: number;
  question: string;
  answer: string;
};

type Args = EditFAQData;

export async function editFAQ({ faqId, question, answer }: Args) {
  // Validate input data
  const schema = z.object({
    faqId: z.number().positive(),
    question: z.string().min(1, "Question cannot be empty"),
    answer: z.string().min(1, "Answer cannot be empty"),
  });

  const parse = schema.safeParse({
    faqId,
    question,
    answer,
  });

  if (!parse.success) {
    console.log(parse.error);
    return {
      message: "Failed to validate FAQ data",
      error: parse.error.errors,
    };
  }

  const data = parse.data;

  try {
    const [updatedFAQ] = await db
      .update(formFaqs)
      .set({
        question: data.question,
        answer: data.answer,
      })
      .where(eq(formFaqs.id, data.faqId))
      .returning();

    if (!updatedFAQ) {
      return {
        message: "FAQ not found",
      };
    }

    // Revalidate any pages that might display this FAQ
    revalidatePath("/forms/[formId]");

    return {
      message: "success",
      data: { faqId: updatedFAQ.id },
    };
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return {
      message: "Failed to update FAQ",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
