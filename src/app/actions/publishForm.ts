"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { formDetails } from "../../../drizzle/schema";
import { TemplateSchema } from "../forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";
import { formDataToObject } from "./fromDataToObject";

export async function publishForm(
  prevState: {
    message: string;
  },
  formData: FormData
) {
  console.log({ formData });

  const asObject = formDataToObject<FormData>(formData);

  console.log({ asObject });

  const parse = TemplateSchema.safeParse(asObject);

  if (!parse.success) {
    console.log(parse.error);
    return {
      message: "Failed to parse data",
    };
  }

  const data = parse.data;
  console.log(data);

  await db
    .update(formDetails)
    .set({
      formFields: JSON.stringify(data.formLayoutComponents),
    })
    .where(eq(formDetails.formId, data.id));

  return {
    message: "success",
  };
}
