// @ts-nocheck - Temporarily disabled due to type compatibility issues
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
  status: "draft" | "published" | "archived";
  version_no: number;
  email_subject_tpl: string | null;
  email_body_tpl: string | null;
  created_at: string;
  updated_at: string;
  form_sections: Record<string, any> | null;
};

export async function GET(req: Request, { params }: { params: { formId: string } }) {
  console.log("=== API Route: GET /api/grant-support/forms/[formId] ===");
  console.log("📍 Request URL:", req.url);
  console.log("📍 Raw params:", params);

  try {
    console.log("🔍 Step 1: Parsing and validating formId");
    const { formId } = getFormParamsSchema.parse({
      formId: params.formId,
    });
    console.log("✅ Validated formId:", formId);

    console.log("🔍 Step 2: Checking sqlClient availability");
    if (!sqlClient) {
      console.error("❌ sqlClient is undefined or null");
      throw new Error("Database client not initialized");
    }
    console.log("✅ sqlClient is available");

    console.log("🔍 Step 3: Executing database query");
    console.log("📝 Query:", `SELECT * FROM form WHERE id = ${formId}`);

    console.log(`DATABASE_URL is ${process.env.DATABASE_URL}`);

    const queryStartTime = Date.now();
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
    const queryDuration = Date.now() - queryStartTime;
    console.log(`✅ Query executed in ${queryDuration}ms`);
    console.log("📊 Query returned rows:", rows.length);

    if (rows.length > 0) {
      console.log("📄 First row preview:", {
        id: rows[0].id,
        title: rows[0].title,
        status: rows[0].status,
        hasSections: !!rows[0].form_sections,
      });
    }

    const row = rows[0];
    if (!row) {
      console.warn("⚠️ No form found with id:", formId);
      return NextResponse.json(
        { error: "FormNotFound", message: "Form not found" },
        { status: 404 }
      );
    }

    console.log("🔍 Step 4: Transforming row to form object");
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

    console.log("✅ Form object created successfully");
    console.log("📦 Form sections present:", !!form.formSections);
    if (form.formSections) {
      console.log("📦 Form sections type:", typeof form.formSections);
      console.log("📦 Form sections keys:", Object.keys(form.formSections || {}));
    }

    console.log("🎉 Returning successful response");
    return NextResponse.json({ form }, { status: 200 });
  } catch (error: any) {
    console.error("❌ ERROR in API Route:");
    console.error("❌ Error type:", error?.constructor?.name);
    console.error("❌ Error message:", error?.message);
    console.error("❌ Error stack:", error?.stack);

    if (error instanceof z.ZodError) {
      console.error("❌ Zod validation error details:", error.flatten());
      return NextResponse.json(
        { error: "ValidationFailed", details: error.flatten() },
        { status: 400 }
      );
    }

    // Log database-specific errors
    if (error?.code) {
      console.error("❌ Database error code:", error.code);
    }
    if (error?.detail) {
      console.error("❌ Database error detail:", error.detail);
    }
    if (error?.constraint) {
      console.error("❌ Database constraint:", error.constraint);
    }

    console.error("❌ Returning 500 error response");
    return NextResponse.json(
      {
        error: "FormFetchFailed",
        message: error?.message ?? "Unable to fetch form",
        details:
          process.env.NODE_ENV === "development"
            ? {
                type: error?.constructor?.name,
                code: error?.code,
                stack: error?.stack,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
