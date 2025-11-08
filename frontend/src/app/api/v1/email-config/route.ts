import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, schema } from "@backend";
import { requireAdminToken } from "@/lib/api-auth";

const { systemSetting } = schema;
const EMAIL_CONFIG_KEY = "grant_support_email_config";

const emailConfigSchema = z.object({
  serviceId: z.string().min(1, "serviceId is required"),
  templateId: z.string().min(1, "templateId is required"),
  publicKey: z.string().min(1, "publicKey is required"),
  grantTeamEmail: z.string().email("grantTeamEmail must be a valid email"),
  grantTeamTemplateId: z.string().min(1, "grantTeamTemplateId is required"),
});

type EmailConfig = z.infer<typeof emailConfigSchema>;

export async function GET() {
  try {
    const [record] = await db
      .select({ valueText: systemSetting.valueText })
      .from(systemSetting)
      .where(eq(systemSetting.settingKey, EMAIL_CONFIG_KEY))
      .limit(1);

    if (!record?.valueText) {
      return NextResponse.json({ configured: false, config: null }, { status: 200 });
    }

    let config: EmailConfig | null = null;
    try {
      config = emailConfigSchema.parse(JSON.parse(record.valueText));
    } catch (error) {
      console.warn("Invalid stored email configuration payload, returning empty config", error);
    }

    return NextResponse.json({ configured: Boolean(config), config }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "EmailConfigFetchFailed",
        message: error?.message ?? "Cannot load email configuration",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  // Check admin token before allowing email config update
  const authError = requireAdminToken(req as NextRequest);
  if (authError) return authError;

  try {
    const body = await req.json();
    const config = emailConfigSchema.parse(body);

    await db
      .insert(systemSetting)
      .values({
        settingKey: EMAIL_CONFIG_KEY,
        valueText: JSON.stringify(config),
      })
      .onConflictDoUpdate({
        target: systemSetting.settingKey,
        set: {
          valueText: JSON.stringify(config),
          updatedAt: sql`now()`,
        },
      });

    return NextResponse.json({ configured: true, config }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "ValidationFailed", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "EmailConfigSaveFailed", message: error?.message ?? "Cannot save configuration" },
      { status: 500 }
    );
  }
}
