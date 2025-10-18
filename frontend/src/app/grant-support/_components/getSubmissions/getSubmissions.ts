"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  GrantSupportSubmission,
  GrantSupportSubmissionSchema,
} from "./grantSupportSubmissionSchema";
import convertKeysToCamel, { Camelize } from "./snakeToCamel";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL environment variable is not set");
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

type Args = {
  userEmail?: string;
  status?: string;
  submissionUid?: string;
};

/**
 * Retrieves submissions from the `grant_support_submissions` table.
 * Optionally filter by userEmail, status, or submissionUid.
 * Throws on any error (for compatibility with React Query).
 */
export async function getSubmissions({
  userEmail,
  status,
  submissionUid,
}: Args = {}): Promise<Camelize<GrantSupportSubmission>[]> {
  let query = supabaseAdmin
    .from("grant_support_submissions")
    .select(
      "id,submission_uid,query_type,status,user_email,user_name,form_data,user_satisfied,needs_human_review,created_at,updated_at"
    );

  console.log({ query });

  if (userEmail) query = query.eq("user_email", userEmail);
  if (status) query = query.eq("status", status);
  if (submissionUid) query = query.eq("submission_uid", submissionUid);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  console.log({ data });

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error(error.message || "Failed to fetch submissions");
  }

  const parsed = z.array(GrantSupportSubmissionSchema).safeParse(data);

  console.log({ parsed });

  if (!parsed.success) {
    console.error("Zod validation error:", parsed.error.format());
    throw new Error("Invalid data format returned from Supabase");
  }

  const parsedDataAsCamelCase = convertKeysToCamel(parsed.data);

  return parsedDataAsCamelCase;
}
