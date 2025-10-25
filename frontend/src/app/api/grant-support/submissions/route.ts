// @ts-nocheck - Temporarily disabled due to type compatibility issues
import { sqlClient } from "@backend";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSubmissionSchema = z.object({
  formData: z.record(z.any()),
  queryType: z.enum(["simple", "complex"]),
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
  status: z.enum(["submitted", "processed", "escalated"]).optional(),
  userSatisfied: z.boolean().optional(),
  needsHumanReview: z.boolean().optional(),
});

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

export async function POST(req: Request) {
  try {
    console.log("H");

    await ensureTable();

    console.log("Test");

    const payload = createSubmissionSchema.parse(await req.json());

    console.log({ payload });

    const submissionUid = generateSubmissionUid();
    const status = payload.status ?? "submitted";
    const timestamp = new Date().toISOString();

    const formDataJson = JSON.stringify(payload.formData ?? {});

    const rows = await sqlClient.unsafe<GrantSubmissionRow[]>(
      `
        INSERT INTO grant_support_submissions (
          submission_uid,
          query_type,
          status,
          user_email,
          user_name,
          form_data,
          user_satisfied,
          needs_human_review,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $9
        )
        RETURNING id, submission_uid, query_type, status, user_email, user_name, form_data, user_satisfied, needs_human_review, created_at, updated_at
      `,
      [
        submissionUid,
        payload.queryType,
        status,
        payload.userEmail ?? null,
        payload.userName ?? null,
        formDataJson,
        payload.userSatisfied ?? null,
        payload.needsHumanReview ?? null,
        timestamp,
      ]
    );

    const row = rows[0];
    if (!row) {
      throw new Error("Failed to insert submission");
    }

    return NextResponse.json(
      {
        id: row.id,
        submissionUid: row.submission_uid,
        queryType: row.query_type,
        status: row.status,
        createdAt: row.created_at,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "ValidationFailed", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "GrantSubmissionCreateFailed",
        message: error?.message ?? "Unable to save submission",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await ensureTable();
    const sp = new URL(req.url).searchParams;
    const limit = Number(sp.get("limit") ?? "200");
    const statusFilter = sp.get("status");
    const queryTypeFilter = sp.get("queryType");

    const limitValue = Number.isFinite(limit) && limit > 0 ? limit : 200;
    const rows = await sqlClient.unsafe<GrantSubmissionRow[]>(
      `
        SELECT
          id,
          submission_uid,
          query_type,
          status,
          user_email,
          user_name,
          form_data,
          user_satisfied,
          needs_human_review,
          created_at,
          updated_at
        FROM grant_support_submissions
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [limitValue]
    );

    const filtered = rows.filter((row) => {
      const matchStatus = statusFilter ? row.status === statusFilter : true;
      const matchType = queryTypeFilter ? row.query_type === queryTypeFilter : true;
      return matchStatus && matchType;
    });

    const stats = buildStats(rows);
    const submissions = filtered.map(mapRowToPayload);

    return NextResponse.json({ submissions, stats }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "GrantSubmissionListFailed",
        message: error?.message ?? "Unable to load submissions",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await ensureTable();
    await sqlClient`DELETE FROM grant_support_submissions`;
    return NextResponse.json({ cleared: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "GrantSubmissionClearFailed",
        message: error?.message ?? "Unable to clear submissions",
      },
      { status: 500 }
    );
  }
}

function generateSubmissionUid() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GS-${datePart}-${randomPart}`;
}

function mapRowToPayload(row: GrantSubmissionRow) {
  return {
    id: row.id,
    submissionUid: row.submission_uid,
    timestamp: row.created_at,
    queryType: row.query_type,
    status: row.status,
    userEmail: row.user_email ?? undefined,
    userName: row.user_name ?? undefined,
    formData: row.form_data ?? {},
    userSatisfied: row.user_satisfied ?? undefined,
    needsHumanReview: row.needs_human_review ?? undefined,
  };
}

function buildStats(rows: GrantSubmissionRow[]) {
  const total = rows.length;
  const simple = rows.filter((row) => row.query_type === "simple").length;
  const complex = rows.filter((row) => row.query_type === "complex").length;
  const processed = rows.filter((row) => row.status === "processed").length;
  const escalated = rows.filter((row) => row.status === "escalated").length;
  const satisfied = rows.filter((row) => row.user_satisfied === true).length;

  return {
    total,
    simple,
    complex,
    processed,
    escalated,
    satisfied,
  };
}
