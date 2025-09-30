"use server";

import { db, form, formDetails } from "@backend";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

export async function createNewForm(
  prevState: {
    message: string;
  },
  formData: FormData
) {
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

  try {
    const inserted = await db
      .insert(form)
      .values({ name: data.formName })
      .returning({ id: form.id });

    let formId = inserted[0]?.id;

    if (!formId) {
      const fallback = await db
        .select({ id: form.id })
        .from(form)
        .where(eq(form.name, data.formName))
        .orderBy(desc(form.id));

      formId = fallback[0]?.id ?? null;
    }

    if (!formId) {
      throw new Error("Insert did not return an id");
    }

    await db.insert(formDetails).values({
      formId,
      formFields: "[]",
    });

    return {
      message: "success",
      data: { formId },
    };
  } catch (error) {
    console.error("createNewForm failed", error);
    return {
      message: "Failed to create form",
    };
  }
}

