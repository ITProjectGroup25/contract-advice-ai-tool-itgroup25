"use server";
// @ts-ignore
import { db, form, formDetails } from "@backend";
import { eq } from "drizzle-orm";

type Args = {
  id: number;
};

export async function deleteForm({ id }: Args) {
  try {
    await db.delete(formDetails).where(eq(formDetails.formId, id));
    await db.delete(form).where(eq(form.id, id));

    return { message: "success" };
  } catch (error) {
    console.error("Error deleting form:", error);
    return { message: "Failed to delete form" };
  }
}

