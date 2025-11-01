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
  formId: number;
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

export async function getFaqs({ formId }: Args): Promise<Return> {
  try {
    if (!formId) {
      return {
        message: "error",
        error: "Form ID is required",
      };
    }

    const { data, error } = await supabaseAdmin
      .from("grant_support_faqs")
      .select("id,form_id,name,answer,selections,created_at,updated_at")
      .eq("form_id", formId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase select error:", error);
      return {
        message: "error",
        error: error.message,
      };
    }

    return {
      message: "success",
      data: data || [],
    };
  } catch (error) {
    console.error("Get FAQs error:", error);
    return {
      message: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
