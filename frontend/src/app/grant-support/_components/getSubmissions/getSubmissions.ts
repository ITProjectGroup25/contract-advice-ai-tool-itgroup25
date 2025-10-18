"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  GrantSupportSubmission,
  GrantSupportSubmissionSchema,
} from "./grantSupportSubmissionSchema";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL environment variable is not set");
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

type ReturnSuccess = {
  message: "success";
  data: GrantSupportSubmission[];
};

type ReturnError = {
  message: "error";
  error: string;
};

type Return = ReturnSuccess | ReturnError;

type Args = {
  userEmail?: string;
  status?: string;
  submissionUid?: string;
};

/**
 * Retrieves submissions from the `grant_support_submissions` table.
 * Optionally filter by userEmail, status, or submissionUid.
 */
export async function getSubmissions({
  userEmail,
  status,
  submissionUid,
}: Args = {}): Promise<Return> {
  try {
    let query = supabaseAdmin.from("grant_support_submissions").select("*");

    if (userEmail) query = query.eq("user_email", userEmail);
    if (status) query = query.eq("status", status);
    if (submissionUid) query = query.eq("submission_uid", submissionUid);

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    console.log({ data });

    if (error) {
      console.error("Supabase fetch error:", error);
      return {
        message: "error",
        error: error.message,
      };
    }

    // Validate fetched data
    const parsed = z.array(GrantSupportSubmissionSchema).safeParse(data);

    if (!parsed.success) {
      console.error("Zod validation error:", parsed.error.format());
      return {
        message: "error",
        error: "Invalid data format returned from Supabase",
      };
    }

    return {
      message: "success",
      data: parsed.data,
    };
  } catch (error) {
    console.error("Get submissions error:", error);
    return {
      message: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
