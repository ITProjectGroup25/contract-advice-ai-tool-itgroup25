import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { listSubmissions } from "@/lib/db/submissions";
import { db, schema } from "@backend";

const {
  form,
  submission,
  answer: answerTable,
  answerMultiValue,
  attachment: attachmentTable,
  consentLog,
  submissionStatusHistory,
} = schema;

const WORKFLOW_TYPES = ["Simple", "Complex"] as const;
const SUBMISSION_STATUS = ["Stored", "EmailQueued", "EmailSent", "EmailFailed"] as const;

const submissionPayloadSchema = z
  .object({
    formKey: z.string().min(1, "formKey is required").optional(),
    formId: z.union([z.number().int().positive(), z.string().min(1)]).optional(),
    workflowType: z.string().optional(),
    status: z.string().optional(),
    createdBy: z.string().optional(),
    answers: z
      .array(
        z.object({
          questionId: z.union([z.number(), z.string().min(1)]),
          value: z.union([z.string(), z.number(), z.boolean()]).optional(),
          values: z.array(z.string()).optional(),
        })
      )
      .default([]),
    attachments: z
      .array(
        z.object({
          questionId: z.union([z.number(), z.string().min(1)]).optional(),
          fileKey: z.string().min(1),
          originalFilename: z.string().min(1),
          mimeType: z.string().min(1),
          sizeBytes: z.number().int().nonnegative(),
          checksumSha256: z
            .string()
            .regex(/^[a-f0-9]{64}$/i, "checksum must be 64 hex characters")
            .optional(),
        })
      )
      .optional(),
    consent: z
      .union([
        z.boolean(),
        z.object({
          accepted: z.boolean(),
          policyVersion: z.string().optional(),
          ipAddress: z.string().optional(),
          userAgent: z.string().optional(),
        }),
      ])
      .optional(),
  })
  .refine(
    (data) => data.formKey || data.formId,
    "Either formKey or formId must be provided"
  );

type SubmissionPayload = z.infer<typeof submissionPayloadSchema>;

export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const expand = sp.get("expand") === "1";
    const result = await listSubmissions({
      page: Number(sp.get("page") ?? "1"),
      pageSize: Number(sp.get("pageSize") ?? "20"),
      orderBy: sp.get("orderBy") ?? "created_at",
      asc: (sp.get("asc") ?? "false") === "true",
      status: sp.get("status") as any,
      formId: sp.get("formId") ? Number(sp.get("formId")) : undefined,
      dateFrom: sp.get("dateFrom") ?? undefined,
      dateTo: sp.get("dateTo") ?? undefined,
      expand,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "InternalError", message: err?.cause?.message ?? err?.message },
      { status: err?.status ?? 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = submissionPayloadSchema.parse(await req.json());

    const workflowType = normalizeWorkflowType(payload.workflowType);
    const status = normalizeStatus(payload.status);

    const formId = await resolveFormId(payload);
    if (formId === null) {
      return NextResponse.json(
        {
          error: "FormNotFound",
          message: payload.formKey
            ? `Form with key '${payload.formKey}' was not found`
            : `Form '${payload.formId}' was not found`,
        },
        { status: 404 }
      );
    }

    const submissionResult = await createSubmissionRecord({
      payload,
      formId,
      workflowType,
      status,
    });

    return NextResponse.json(submissionResult, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "ValidationFailed", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "SubmissionCreateFailed",
        message: error?.message ?? "Unable to create submission",
      },
      { status: 500 }
    );
  }
}

function normalizeWorkflowType(
  workflowType: SubmissionPayload["workflowType"]
): (typeof WORKFLOW_TYPES)[number] {
  if (!workflowType) return "Simple";
  const normalized = workflowType.toLowerCase();
  return normalized === "complex" ? "Complex" : "Simple";
}

function normalizeStatus(
  status: SubmissionPayload["status"]
): (typeof SUBMISSION_STATUS)[number] {
  if (!status) return "Stored";
  const trimmed = status.trim();
  if (!trimmed) return "Stored";
  const normalized = trimmed.toLowerCase().replace(/[_\s-]+/g, "");
  switch (normalized) {
    case "emailqueued":
      return "EmailQueued";
    case "emailsent":
      return "EmailSent";
    case "emailfailed":
      return "EmailFailed";
    case "stored":
      return "Stored";
    default:
      return "Stored";
  }
}

async function createSubmissionRecord({
  payload,
  formId,
  workflowType,
  status,
}: {
  payload: SubmissionPayload;
  formId: number;
  workflowType: (typeof WORKFLOW_TYPES)[number];
  status: (typeof SUBMISSION_STATUS)[number];
}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const submissionUid = generateSubmissionUid();
    try {
      const result = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(submission)
          .values({
            submissionUid,
            formId,
            workflowType,
            status,
            createdBy: payload.createdBy ?? null,
          } as typeof submission.$inferInsert)
          .returning({ id: submission.id, createdAt: submission.createdAt });

        const submissionId = Number(created.id);

        for (const answer of payload.answers ?? []) {
          const questionId = normalizeId(answer.questionId);
          if (questionId === null) {
            throw new Error(`Invalid questionId '${answer.questionId}'`);
          }

          const valueText =
            answer.value !== undefined && answer.value !== null
              ? typeof answer.value === "string"
                ? answer.value
                : JSON.stringify(answer.value)
              : answer.values?.length
              ? answer.values.join(", ")
              : null;

          const [createdAnswer] = await tx
            .insert(answerTable)
            .values({
              submissionId,
              questionId,
              valueText,
            } as typeof answerTable.$inferInsert)
            .returning({ id: answerTable.id });

          if (answer.values?.length) {
            const multiRows = answer.values.map((value) => ({
              answerId: Number(createdAnswer.id),
              itemValue: value,
            }));
            await tx
              .insert(answerMultiValue)
              .values(multiRows as typeof answerMultiValue.$inferInsert[]);
          }
        }

        if (payload.attachments?.length) {
          const attachmentRows = payload.attachments.map((file) => {
            const questionId = file.questionId ? normalizeId(file.questionId) : null;
            if (file.questionId && questionId === null) {
              throw new Error(`Invalid attachment.questionId '${file.questionId}'`);
            }
            return {
              submissionId,
              questionId,
              originalFilename: file.originalFilename,
              mimeType: file.mimeType,
              sizeBytes: file.sizeBytes,
              storageUri: file.fileKey,
              checksumSha256: file.checksumSha256 ?? null,
            };
          });
          await tx
            .insert(attachmentTable)
            .values(attachmentRows as typeof attachmentTable.$inferInsert[]);
        }

        const consent = normalizeConsent(payload.consent);
        if (consent?.accepted) {
          await tx.insert(consentLog).values({
            submissionId,
            policyVersion: consent.policyVersion ?? "unknown",
            ipAddress: consent.ipAddress ?? null,
            userAgent: consent.userAgent ?? null,
          } as typeof consentLog.$inferInsert);
        }

        await tx.insert(submissionStatusHistory).values({
          submissionId,
          fromStatus: null,
          toStatus: status,
          changedBy: payload.createdBy ?? null,
          note: consent?.accepted ? "Submission received with consent" : "Submission received",
        } as typeof submissionStatusHistory.$inferInsert);

        return {
          submissionUid,
          formId,
          workflowType,
          status,
          submissionId,
          createdAt: created.createdAt,
        };
      });

      return result;
    } catch (error: any) {
      const pgError = error as { code?: string };
      if (pgError?.code === "23505") {
        // Unique violation on submission_uid, retry with a different uid
        continue;
      }
      throw error;
    }
  }

  throw new Error("Failed to create submission after multiple attempts");
}

function generateSubmissionUid() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SR-${datePart}-${randomPart}`;
}

function normalizeId(value: string | number): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeConsent(consent: SubmissionPayload["consent"]) {
  if (consent === undefined) return null;
  if (typeof consent === "boolean") {
    return consent ? { accepted: true } : null;
  }
  return consent.accepted ? consent : null;
}

async function resolveFormId(payload: SubmissionPayload): Promise<number | null> {
  if (payload.formId !== undefined) {
    const id = normalizeId(payload.formId as any);
    if (id === null) return null;
    const existing = await db
      .select({ id: form.id })
      .from(form)
      .where(eq(form.id, id))
      .limit(1);
    return existing.length ? Number(existing[0].id) : null;
  }

  if (!payload.formKey) return null;
  const targetForm = await db
    .select({ id: form.id })
    .from(form)
    .where(eq(form.formKey, payload.formKey))
    .limit(1);
  return targetForm.length ? Number(targetForm[0].id) : null;
}
