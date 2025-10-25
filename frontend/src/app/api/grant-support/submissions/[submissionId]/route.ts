// @ts-nocheck - Temporarily disabled due to type compatibility issues
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sqlClient } from "@backend";

type RouteContext = {
  params: {
    submissionId: string;
  };
};

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

const updateSchema = z.object({
  status: z.enum(["submitted", "processed", "escalated"]).optional(),
  userSatisfied: z.boolean().optional(),
  needsHumanReview: z.boolean().optional(),
});

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

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await ensureTable();
    const submissionId = Number(context.params.submissionId);
    if (!Number.isFinite(submissionId)) {
      return NextResponse.json(
        { error: "InvalidSubmissionId", message: "submissionId must be a number" },
        { status: 400 }
      );
    }

    const payload = updateSchema.parse(await req.json());
    if (
      payload.status === undefined &&
      payload.userSatisfied === undefined &&
      payload.needsHumanReview === undefined
    ) {
      return NextResponse.json(
        { error: "NoUpdatesProvided", message: "Provide at least one field to update" },
        { status: 400 }
      );
    }

    const setClauses: string[] = [];
    const params: any[] = [];

    if (payload.status !== undefined) {
      setClauses.push(`status = $${setClauses.length + 1}`);
      params.push(payload.status);
    }
    if (payload.userSatisfied !== undefined) {
      setClauses.push(`user_satisfied = $${setClauses.length + 1}`);
      params.push(payload.userSatisfied);
    }
    if (payload.needsHumanReview !== undefined) {
      setClauses.push(`needs_human_review = $${setClauses.length + 1}`);
      params.push(payload.needsHumanReview);
    }

    const setClause = setClauses.length
      ? `${setClauses.join(", ")}, updated_at = now()`
      : "updated_at = now()";

    const sqlText = `
      UPDATE grant_support_submissions
      SET ${setClause}
      WHERE id = $${setClauses.length + 1}
      RETURNING *
    `;
    params.push(submissionId);

    const rows = await sqlClient.unsafe<GrantSubmissionRow[]>(sqlText, params);
    if (!rows.length) {
      return NextResponse.json(
        { error: "SubmissionNotFound", message: `Submission ${submissionId} not found` },
        { status: 404 }
      );
    }

    const row = rows[0];
    return NextResponse.json(
      {
        id: row.id,
        submissionUid: row.submission_uid,
        status: row.status,
        queryType: row.query_type,
        userSatisfied: row.user_satisfied ?? undefined,
        needsHumanReview: row.needs_human_review ?? undefined,
        updatedAt: row.updated_at,
      },
      { status: 200 }
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
        error: "GrantSubmissionUpdateFailed",
        message: error?.message ?? "Unable to update submission",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    await ensureTable();
    const submissionId = Number(context.params.submissionId);
    if (!Number.isFinite(submissionId)) {
      return NextResponse.json(
        { error: "InvalidSubmissionId", message: "submissionId must be a number" },
        { status: 400 }
      );
    }

    const rows = await sqlClient<{ id: number }[]>`
      DELETE FROM grant_support_submissions
      WHERE id = ${submissionId}
      RETURNING id
    `;

    if (!rows.length) {
      return NextResponse.json(
        { error: "SubmissionNotFound", message: `Submission ${submissionId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: rows[0].id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "GrantSubmissionDeleteFailed",
        message: error?.message ?? "Unable to delete submission",
      },
      { status: 500 }
    );
  }
}
