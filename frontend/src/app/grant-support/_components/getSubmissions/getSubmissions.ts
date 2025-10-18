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

type Args = {};

/**
 * Retrieves submissions from the `grant_support_submissions` table.
 * Optionally filter by userEmail, status, or submissionUid.
 * Throws on any error (for compatibility with React Query).
 */
export async function getSubmissions({}: Args = {}): Promise<
  Camelize<GrantSupportSubmission>[]
> {
  const { data, error } = await supabaseAdmin
    .from("grant_support_submissions")
    .select(
      "id,submission_uid,query_type,status,user_email,user_name,form_data,user_satisfied,needs_human_review,created_at,updated_at"
    );

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
