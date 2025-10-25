import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") ?? process.env.GOOGLE_TEST_UID;

    if (!userId) {
      return NextResponse.json({ connected: false, error: "Missing userId" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("user_google_tokens")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116" && error.code !== "PGRST106") {
      throw error;
    }

    const connected = Boolean(data);
    return NextResponse.json({ connected, userId }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        connected: false,
        error: error?.message ?? "Unable to verify Google OAuth connection",
      },
      { status: 500 }
    );
  }
}
