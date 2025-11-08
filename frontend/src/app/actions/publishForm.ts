"use server";

import postgres from "postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@backend";
import { TemplateSchema } from "../forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";
import { formDataToObject } from "./fromDataToObject";

export async function publishForm(
  prevState: {
    message: string;
  },
  formData: FormData
) {
  // Check authentication before allowing form publish
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      message: "Unauthorized: You must be signed in to publish forms",
    };
  }

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
  console.log("Publishing form with data:", data);

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return {
      message: "Database configuration error",
    };
  }

  const sql = postgres(connectionString);

  try {
    // Update form_details with the form layout
    const result = await sql`
      UPDATE form_details
      SET form_fields = ${JSON.stringify(data.formLayoutComponents)}
      WHERE form_id = ${data.id}
      RETURNING *
    `;

    console.log("Form published successfully:", result);

    await sql.end();

    return {
      message: "success",
    };
  } catch (error) {
    console.error("Failed to publish form:", error);
    await sql.end({ timeout: 1 });
    return {
      message:
        "Failed to publish form: " + (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}
