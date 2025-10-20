import { NextResponse } from "next/server";
import { z } from "zod";
import { db, referralSubmissions } from "@backend";

const submissionPayload = z.object({
  submissionId: z.string().min(1, "submissionId is required"),
  formId: z.number().int().optional(),
  queryType: z.enum(["simple", "complex"]),
  status: z.string().min(1).optional(),
  formData: z.record(z.any()),
  attachments: z.array(z.any()).optional(),
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = submissionPayload.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      submissionId,
      formId,
      queryType,
      status = "submitted",
      formData,
      attachments,
      userEmail,
      userName,
      metadata,
    } = parsed.data;

    const userAgent = request.headers.get("user-agent") ?? undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      request.headers.get("cf-connecting-ip") ??
      undefined;

    const now = new Date().toISOString();

    const [inserted] = await db
      .insert(referralSubmissions)
      .values({
        submissionUid: submissionId,
        formId: formId ?? null,
        queryType,
        status,
        userEmail,
        userName,
        formData,
        attachments: attachments ?? [],
        metadata: {
          ...(metadata ?? {}),
          userAgent,
          ipAddress,
        },
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: referralSubmissions.id,
        submissionUid: referralSubmissions.submissionUid,
      });

    return NextResponse.json(
      {
        id: inserted.id,
        submissionUid: inserted.submissionUid,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to store referral submission", error);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }
}

