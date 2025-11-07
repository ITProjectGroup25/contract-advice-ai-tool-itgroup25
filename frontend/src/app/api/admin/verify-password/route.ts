import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// use service role key to access database
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    // get password hash from database
    const { data, error } = await supabaseAdmin
      .from("admin_password")
      .select("password_hash")
      .eq("id", 1)
      .single();

    if (error || !data) {
      console.error("Failed to fetch password:", error);
      return NextResponse.json(
        { success: false, error: "Authentication failed" },
        { status: 500 }
      );
    }

    // verify password
    const isValid = await bcrypt.compare(password, data.password_hash);

    if (isValid) {
      // Return API token for subsequent requests
      const adminToken = process.env.ADMIN_API_TOKEN;
      return NextResponse.json({ 
        success: true,
        token: adminToken // Send token to frontend after successful auth
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Incorrect password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

