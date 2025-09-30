"use server";

import { db, form } from "@backend";

export async function getUserForms() {
  // Use select/from to avoid relying on db.query in serverless builds
  const rows = await db.select().from(form);
  return rows;
}
