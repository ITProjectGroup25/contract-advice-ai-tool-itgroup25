"use server";

import postgres from "postgres";

export async function getUserForms() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not configured");
    return [];
  }

  const sql = postgres(connectionString);
  
  try {
    // Use direct SQL query to fetch all forms
    const rows = await sql`
      SELECT id, name, created_at as "createdAt"
      FROM form
      ORDER BY created_at DESC
    `;
    
    console.log("Fetched forms:", rows);
    return rows;
  } catch (error) {
    console.error("Failed to fetch forms:", error);
    return [];
  } finally {
    await sql.end({ timeout: 1 });
  }
}
