"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { form, formDetails } from "../../../drizzle/schema";

type Args = {
  id: number;
};

export async function deleteForm({ id }: Args) {
  try {
    // Delete child details first (if foreign key constraint exists)
    await db.delete(formDetails).where(eq(formDetails.formId, id));

    // Delete the form itself
    await db.delete(form).where(eq(form.id, id));

    return { message: "success" };
  } catch (error) {
    console.error("Error deleting form:", error);
    return { message: "Failed to delete form" };
  }
}
