"use server";

import { db } from "@backend";

export async function getUserForms() {
  const forms = await db.query.form.findMany({});

  console.log({ forms });

  return forms;
}

