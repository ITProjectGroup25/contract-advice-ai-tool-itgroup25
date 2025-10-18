"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import GrantSupportApp from "./GrantSupportApp";

// Zod schema matching your Drizzle table
const formStatusEnum = z.enum(["draft", "published", "archived"]);

const formSchema = z.object({
  id: z.number(),
  formKey: z.string().max(64).optional(),
  title: z.string().max(200).optional(),
  description: z.string().optional(),
  status: formStatusEnum,
  versionNo: z.number(),
  emailSubjectTpl: z.string().max(255).optional(),
  emailBodyTpl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  formSections: z.any().optional(),
});

// API response wrapper
const apiResponseSchema = z.object({
  form: formSchema,
});

// Infer TypeScript type
type Form = z.infer<typeof formSchema>;

// Fetch and validate function
async function fetchForm(formId: number): Promise<Form> {
  const response = await fetch(`/api/grant-support/forms/${formId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Form not found");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Validate with Zod
  const validatedData = apiResponseSchema.parse(data);

  return validatedData.form;
}

type Props = {
  formId?: number;
};

const GrantSupportWrapper = ({ formId = 1 }: Props) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => fetchForm(formId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  if (isLoading) {
    return <div>Loading form...</div>;
  }

  if (isError) {
    return (
      <div>
        <h2>Error loading form</h2>
        <p>{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  return <GrantSupportApp />;
};

export default GrantSupportWrapper;
