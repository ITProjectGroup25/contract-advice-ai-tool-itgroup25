// @ts-nocheck - Temporarily disabled due to Drizzle ORM type compatibility issues
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@backend";
import { requireAdminToken } from "@/lib/api-auth";

const { submission } = schema;

const updateStatusSchema = z.object({
  status: z.enum(["Stored", "EmailQueued", "EmailSent", "EmailFailed"]),
  changedBy: z.string().optional(),
  note: z.string().max(500).optional(),
});

type RouteContext = {
  params: {
    submissionId: string;
  };
};

export async function PUT(req: Request, context: RouteContext) {
  // Check admin token before allowing status update
  const authError = requireAdminToken(req as NextRequest);
  if (authError) return authError;

  try {
    const submissionId = Number(context.params.submissionId);
    if (!Number.isFinite(submissionId)) {
      return NextResponse.json(
        { error: "InvalidSubmissionId", message: "submissionId must be a number" },
        { status: 400 }
      );
    }

    const payload = updateStatusSchema.parse(await req.json());

    const result = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: submission.id, status: submission.status })
        .from(submission)
        .where(eq(submission.id, submissionId))
        .limit(1);

      if (!existing) {
        return null;
      }

      await tx
        .update(submission)
        .set({ status: payload.status })
        .where(eq(submission.id, submissionId));

      await tx.execute(
        sql`INSERT INTO submission_status_history (submission_id, from_status, to_status, changed_by, note)
            VALUES (${submissionId}, ${existing.status}, ${payload.status}, ${payload.changedBy ?? null}, ${payload.note ?? null})`
      );

      return {
        submissionId,
        previousStatus: existing.status,
        status: payload.status,
      };
    });

    if (!result) {
      return NextResponse.json(
        { error: "SubmissionNotFound", message: `Submission ${submissionId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "ValidationFailed", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "StatusUpdateFailed",
        message: error?.message ?? "Unable to update submission status",
      },
      { status: 500 }
    );
  }
}
