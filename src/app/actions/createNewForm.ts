"use server";

import { db } from "@/db";
import { z } from "zod";
import { form, formDetails } from "../../../drizzle/schema";

export async function createNewForm(
  prevState: {
    message: string;
  },
  formData: FormData
) {
  console.log({ formData });

  const schema = z.object({
    formName: z.string(),
  });

  const parse = schema.safeParse({
    formName: formData.get("formName"),
  });

  if (!parse.success) {
    console.log(parse.error);
    return {
      message: "Failed to parse data",
    };
  }

  const data = parse.data;
  console.log(data);

  const [newForm] = await db
    .insert(form)
    .values({ name: data.formName })
    .returning();

  await db.insert(formDetails).values({
    formId: newForm.id,
    formFields: "[]", // empty JSON object
  });

  return {
    message: "success",
    data: { formId: newForm.id },
  };
}
