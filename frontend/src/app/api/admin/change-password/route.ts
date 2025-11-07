import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { requireAdminToken } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  const authError = requireAdminToken(request);
  if (authError) {
    return authError;
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current and new password are required." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("admin_password")
      .select("password_hash")
      .eq("id", 1)
      .single();

    if (error || !data) {
      console.error("Failed to fetch admin password hash:", error);
      return NextResponse.json(
        { success: false, error: "Unable to verify current password." },
        { status: 500 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, data.password_hash);

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 401 }
      );
    }

    const isSamePassword = await bcrypt.compare(newPassword, data.password_hash);
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, error: "New password must be different from the current password." },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabaseAdmin
      .from("admin_password")
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (updateError) {
      console.error("Failed to update admin password:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update password. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
