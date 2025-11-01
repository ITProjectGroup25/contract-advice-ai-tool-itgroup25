"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL environment variable is not set");
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
}

type Return = {
  message: string;
  data?: any;
  error?: string;
};

type Args = {
  submissionUid: string;
};

// 单例模式：复用Supabase客户端以减少连接开销
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAdminInstance;
}

const supabaseAdmin = getSupabaseAdmin();

export async function getSubmission({ submissionUid }: Args): Promise<Return> {
  try {
    if (!submissionUid) {
      return {
        message: "error",
        error: "Submission UID is required",
      };
    }

    const { data, error } = await supabaseAdmin
      .from("grant_support_submissions")
      .select("submission_uid, form_data")
      .eq("submission_uid", submissionUid)
      .single();

    if (error) {
      console.error("Supabase select error:", error);
      return {
        message: "error",
        error: error.message,
      };
    }

    if (!data) {
      return {
        message: "error",
        error: "Submission not found",
      };
    }

    return {
      message: "success",
      data: data,
    };
  } catch (error) {
    console.error("Get submission error:", error);
    return {
      message: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}