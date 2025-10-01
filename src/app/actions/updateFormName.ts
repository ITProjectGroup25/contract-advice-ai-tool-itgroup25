"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { form } from "../../../drizzle/schema";

type UpdateFormNameData = {
  formId: number;
  name: string;
};

export async function updateFormName({ formId, name }: UpdateFormNameData) {
  // Validate input data
  const schema = z.object({
    formId: z.number().positive(),
    name: z.string().min(1, "Form name cannot be empty"),
  });

  const parse = schema.safeParse({
    formId,
    name,
  });

  if (!parse.success) {
    console.log(parse.error);
    return {
      message: "Failed to validate form data",
      error: parse.error.errors,
    };
  }

  const data = parse.data;

  try {
    const [updatedForm] = await db
      .update(form)
      .set({
        name: data.name,
      })
      .where(eq(form.id, data.formId))
      .returning();

    if (!updatedForm) {
      return {
        message: "Form not found",
      };
    }

    // Revalidate any pages that display this form
    revalidatePath(`/forms/${data.formId}`);

    return {
      message: "success",
      data: { formId: updatedForm.id, name: updatedForm.name },
    };
  } catch (error) {
    console.error("Error updating form:", error);
    return {
      message: "Failed to update form",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
