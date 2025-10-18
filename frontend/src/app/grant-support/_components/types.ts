import z from "zod";

export const formStatusEnum = z.enum([
  "Active",
  "Draft",
  "Published",
  "Archived",
]); // Add "Active"

export const formSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)), // Convert string id to number
  formKey: z.string().max(64).optional(),
  title: z.string().max(200).optional(),
  description: z.string().optional(),
  status: formStatusEnum,
  versionNo: z.number(),
  emailSubjectTpl: z.string().max(255).optional().nullable(),
  emailBodyTpl: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  formSections: z.any().optional(),
});
// API response wrapper
export const apiResponseSchema = z.object({
  form: formSchema,
});

// Infer TypeScript type
export type Form = z.infer<typeof formSchema>;
