import { NextResponse } from "next/server";
import { sqlClient } from "@backend";

type GrantSubmissionRow = {
  id: number;
  submission_uid: string;
  query_type: "simple" | "complex";
  status: "submitted" | "processed" | "escalated";
  user_email: string | null;
  user_name: string | null;
  form_data: Record<string, any>;
  user_satisfied: boolean | null;
  needs_human_review: boolean | null;
  created_at: string;
  updated_at: string;
};

let tableInitialised = false;

async function ensureTable() {
  if (tableInitialised) return;
  await sqlClient`
    CREATE TABLE IF NOT EXISTS grant_support_submissions (
      id BIGSERIAL PRIMARY KEY,
      submission_uid VARCHAR(40) NOT NULL UNIQUE,
      query_type VARCHAR(16) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'submitted',
      user_email VARCHAR(320),
      user_name VARCHAR(200),
      form_data JSONB NOT NULL,
      user_satisfied BOOLEAN,
      needs_human_review BOOLEAN,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  tableInitialised = true;
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await sqlClient<GrantSubmissionRow[]>`
      SELECT *
      FROM grant_support_submissions
      ORDER BY created_at ASC
    `;

    const sqlContent = buildSqlExport(rows);
    const filename = `grant_support_submissions_${new Date()
      .toISOString()
      .slice(0, 10)}.sql`;

    return new NextResponse(sqlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "GrantSubmissionExportFailed",
        message: error?.message ?? "Unable to export submissions",
      },
      { status: 500 }
    );
  }
}

function buildSqlExport(rows: GrantSubmissionRow[]) {
  let sql = `-- Grant Support Submissions Export\n`;
  sql += `-- Generated at: ${new Date().toISOString()}\n`;
  sql += `-- Total submissions: ${rows.length}\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS grant_support_submissions (\n`;
  sql += `  id BIGSERIAL PRIMARY KEY,\n`;
  sql += `  submission_uid VARCHAR(40) NOT NULL UNIQUE,\n`;
  sql += `  query_type VARCHAR(16) NOT NULL,\n`;
  sql += `  status VARCHAR(32) NOT NULL DEFAULT 'submitted',\n`;
  sql += `  user_email VARCHAR(320),\n`;
  sql += `  user_name VARCHAR(200),\n`;
  sql += `  form_data JSONB NOT NULL,\n`;
  sql += `  user_satisfied BOOLEAN,\n`;
  sql += `  needs_human_review BOOLEAN,\n`;
  sql += `  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n`;
  sql += `  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n`;
  sql += `);\n\n`;

  rows.forEach((row) => {
    const formData = JSON.stringify(row.form_data ?? {}).replace(/'/g, "''");
    const userEmail = row.user_email ? `'${row.user_email.replace(/'/g, "''")}'` : "NULL";
    const userName = row.user_name ? `'${row.user_name.replace(/'/g, "''")}'` : "NULL";
    const userSatisfied =
      row.user_satisfied === null || row.user_satisfied === undefined
        ? "NULL"
        : row.user_satisfied ? "TRUE" : "FALSE";
    const needsHumanReview =
      row.needs_human_review === null || row.needs_human_review === undefined
        ? "NULL"
        : row.needs_human_review ? "TRUE" : "FALSE";

    sql += `INSERT INTO grant_support_submissions (\n`;
    sql += `  submission_uid, query_type, status, user_email, user_name,\n`;
    sql += `  form_data, user_satisfied, needs_human_review, created_at, updated_at\n`;
    sql += `) VALUES (\n`;
    sql += `  '${row.submission_uid}',\n`;
    sql += `  '${row.query_type}',\n`;
    sql += `  '${row.status}',\n`;
    sql += `  ${userEmail},\n`;
    sql += `  ${userName},\n`;
    sql += `  '${formData}'::jsonb,\n`;
    sql += `  ${userSatisfied},\n`;
    sql += `  ${needsHumanReview},\n`;
    sql += `  '${row.created_at}',\n`;
    sql += `  '${row.updated_at}'\n`;
    sql += `);\n\n`;
  });

  return sql;
}
