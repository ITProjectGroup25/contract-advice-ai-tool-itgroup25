"use server";

import postgres from "postgres";
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
    console.log("Creating form with name:", data.formName);

    // Try direct SQL query as a workaround
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL not configured");
    }

    console.log("Using direct SQL connection...");
    const sql = postgres(connectionString);

    try {
      // Insert using raw SQL
      const insertResult = await sql`
        INSERT INTO form (name) 
        VALUES (${data.formName}) 
        RETURNING *
      `;

      console.log("SQL Insert result:", insertResult);
      console.log("Insert result length:", insertResult.length);
      console.log("First item:", insertResult[0]);

      if (!insertResult || insertResult.length === 0) {
        console.error("Insert returned empty array");
        throw new Error("Database insert failed - no data returned");
      }

      const formRecord = insertResult[0];
      const formId = formRecord?.id;

      console.log("Form record:", formRecord);
      console.log("Form ID:", formId);

      if (!formId) {
        console.error("No ID in returned record. Full result:", JSON.stringify(formRecord));
        throw new Error("Insert did not return an id. Record: " + JSON.stringify(formRecord));
      }

      // Insert form details
      console.log("Creating form details for formId:", formId);
      await sql`
        INSERT INTO form_details (form_id, form_fields)
        VALUES (${formId}, ${JSON.stringify([])})
      `;

      console.log("Form created successfully with ID:", formId);

      await sql.end();

      return {
        message: "success",
        data: { formId },
      };
    } finally {
      // Make sure to close the connection
      await sql.end({ timeout: 1 });
    }
  } catch (error) {
    console.error("createNewForm failed", error);

    // Provide more specific error messages
    let errorMessage = "Failed to create form";

    if (error instanceof Error) {
      // Check for common database errors
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        errorMessage = "Database tables not found. Please run: npm run db:push --workspace backend";
      } else if (error.message.includes("connect") || error.message.includes("ECONNREFUSED")) {
        errorMessage = "Cannot connect to database. Please check your DATABASE_URL in .env file";
      } else if (error.message.includes("authentication") || error.message.includes("password")) {
        errorMessage = "Database authentication failed. Please check your credentials";
      } else {
        errorMessage = `Failed to create form: ${error.message}`;
      }
    }

    return {
      message: errorMessage,
    };
  }
}
