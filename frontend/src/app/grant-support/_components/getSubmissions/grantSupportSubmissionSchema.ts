import { z } from "zod";

export const GrantSupportSubmissionSchema = z.object({
  id: z.bigint().or(z.number()), // drizzle bigserial({ mode: "bigint" })
  submission_uid: z.string().max(40),
  query_type: z.string().max(16),
  status: z.string().max(32).default("submitted"),
  user_email: z.string().email().nullable().optional(),
  user_name: z.string().max(200).nullable().optional(),
  form_data: z.record(z.any()), // jsonb
  user_satisfied: z.boolean().nullable().optional(),
  needs_human_review: z.boolean().nullable().optional(),
  created_at: z.string(), // timestamp with timezone, mode: string
  updated_at: z.string(),
});

export type GrantSupportSubmission = z.infer<
  typeof GrantSupportSubmissionSchema
>;
