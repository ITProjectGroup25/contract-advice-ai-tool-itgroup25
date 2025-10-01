"use server";

import { db } from "@/db";
import { z } from "zod";
import { formFaqs } from "../../../drizzle/schema";

type FAQData = {
  formId: number;
  question: string;
  answer: string;
};

type Args = FAQData;

export async function createFAQ({ formId, question, answer }: Args) {
  // Validate input data
  const schema = z.object({
    formId: z.number().positive(),
    question: z.string().min(1, "Question cannot be empty"),
    answer: z.string().min(1, "Answer cannot be empty"),
  });

  console.log({ formId, question, answer });

  const parse = schema.safeParse({
    formId,
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
    const [newFAQ] = await db
      .insert(formFaqs)
      .values({
        formId: data.formId,
        question: data.question,
        answer: data.answer,
      })
      .returning();

    return {
      message: "success",
      data: { faqId: newFAQ.id },
    };
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return {
      message: "Failed to create FAQ",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
