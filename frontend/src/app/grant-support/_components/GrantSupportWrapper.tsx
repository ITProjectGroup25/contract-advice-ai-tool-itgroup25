"use client";

import { useQuery } from "@tanstack/react-query";
import GrantSupportApp from "./GrantSupportApp";
import { Form, apiResponseSchema } from "./types";

// Fetch and validate function
async function fetchForm(formId: number): Promise<Form> {
  const response = await fetch(`/api/grant-support/forms/${formId}`);

  console.log({ response });

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

const GrantSupportWrapper = ({ formId = 2 }: Props) => {
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

  return <GrantSupportApp form={data} />;
};

export default GrantSupportWrapper;
