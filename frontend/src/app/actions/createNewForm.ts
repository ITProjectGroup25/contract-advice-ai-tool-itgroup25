"use server";

import { db, form, formDetails } from "@backend";
import { z } from "zod";

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
    formFields: "[]",
  });

  return {
    message: "success",
    data: { formId: newForm.id },
  };
}

