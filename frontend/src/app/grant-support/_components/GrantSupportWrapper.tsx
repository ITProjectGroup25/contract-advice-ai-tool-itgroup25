"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import GrantSupportApp from "./GrantSupportApp";

// Zod schema matching your Drizzle table
const formStatusEnum = z.enum(["draft", "published", "archived"]); // Adjust to match your actual enum values

const formSchema = z.object({
  id: z.number(),
  formKey: z.string().max(64).nullable(),
  title: z.string().max(200).nullable(),
  description: z.string().nullable(),
  status: formStatusEnum,
  versionNo: z.number().default(1),
  emailSubjectTpl: z.string().max(255).nullable(),
  emailBodyTpl: z.string().nullable(),
  createdAt: z.string(), // ISO 8601 string from API
  updatedAt: z.string(), // ISO 8601 string from API
  formSections: z.any().nullable(), // or define a specific schema for your JSON structure
});

// Response schema (array or single object)
const formsResponseSchema = z.array(formSchema);

// Infer TypeScript type
type Form = z.infer<typeof formSchema>;

// Fetch and validate function
async function fetchForms(): Promise<Form[]> {
  const response = await fetch("https://api.example.com/forms");

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Validate with Zod
  const validatedData = formsResponseSchema.parse(data);

  return validatedData;
}

type Props = {};

const GrantSupportWrapper = (props: Props) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["forms"],
    queryFn: fetchForms,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  if (isLoading) {
    return <div>Loading forms...</div>;
  }

  if (isError) {
    return (
      <div>
        <h2>Error loading forms</h2>
        <p>{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  return <GrantSupportApp />;
};

export default GrantSupportWrapper;
