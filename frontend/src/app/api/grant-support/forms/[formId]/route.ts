// @ts-ignore
import { sqlClient } from "@backend";
import { NextResponse } from "next/server";
import { z } from "zod";

const getFormParamsSchema = z.object({
  formId: z.coerce.number(),
});

type FormRow = {
  id: number;
  form_key: string | null;
  title: string | null;
  description: string | null;
  status: "draft" | "published" | "archived"; // Adjust based on your actual enum values
  version_no: number;
  email_subject_tpl: string | null;
  email_body_tpl: string | null;
  created_at: string;
  updated_at: string;
  form_sections: Record<string, any> | null;
};

export async function GET(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = getFormParamsSchema.parse({
      formId: params.formId,
    });

    const rows = await sqlClient.unsafe<FormRow[]>(
      `
        SELECT
          id,
          form_key,
          title,
          description,
          status,
          version_no,
          email_subject_tpl,
          email_body_tpl,
          created_at,
          updated_at,
          form_sections
        FROM form
        WHERE id = $1
        LIMIT 1
      `,
      [formId]
    );

    const row = rows[0];
    if (!row) {
      return NextResponse.json(
        { error: "FormNotFound", message: "Form not found" },
        { status: 404 }
      );
    }

    const form = {
      id: row.id,
      formKey: row.form_key ?? undefined,
      title: row.title ?? undefined,
      description: row.description ?? undefined,
      status: row.status,
      versionNo: row.version_no,
      emailSubjectTpl: row.email_subject_tpl ?? undefined,
      emailBodyTpl: row.email_body_tpl ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      formSections: row.form_sections ?? undefined,
    };

    // console.log({ form });

    return NextResponse.json({ form }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "ValidationFailed", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "FormFetchFailed",
        message: error?.message ?? "Unable to fetch form",
      },
      { status: 500 }
    );
  }
}
