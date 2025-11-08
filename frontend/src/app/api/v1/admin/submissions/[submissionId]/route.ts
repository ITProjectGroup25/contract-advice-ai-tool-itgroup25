import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@backend";
import { requireAdminToken } from "@/lib/api-auth";

const { submission } = schema;

type RouteContext = {
  params: {
    submissionId: string;
  };
};

export async function DELETE(_req: Request, context: RouteContext) {
  // Check admin token before allowing delete
  const authError = requireAdminToken(_req as NextRequest);
  if (authError) return authError;

  try {
    const submissionId = Number(context.params.submissionId);
    if (!Number.isFinite(submissionId)) {
      return NextResponse.json(
        { error: "InvalidSubmissionId", message: "submissionId must be a number" },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(submission)
      .where(eq(submission.id, submissionId))
      .returning({ id: submission.id });

    if (!deleted.length) {
      return NextResponse.json(
        { error: "SubmissionNotFound", message: `Submission ${submissionId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ submissionId }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "SubmissionDeleteFailed",
        message: error?.message ?? "Unable to delete submission",
      },
      { status: 500 }
    );
  }
}
