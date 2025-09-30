import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { form, formDetails, formResults } from "../../../../../drizzle/schema";
import { FormResultSchema } from "../../edit/[formId]/form-builder-components/types/FormTemplateTypes";
import FormResultsPage from "./results-table";

type Props = {};

const page = async ({
  params,
}: {
  params: {
    formId: number;
  };
}) => {
  const formId = params.formId;

  if (!formId || formId == null) {
    return <div>Form not Found!</div>;
  }

  console.log({ formId });

  // Get the form name from the form table
  const singleForm = await db.query.form.findFirst({
    where: eq(form.id, formId),
  });

  if (!singleForm) {
    return <div>Form not found</div>;
  }

  console.log({ singleForm });

  // Get the form fields (template) from form_details table
  const formData = await db.query.formDetails.findFirst({
    where: eq(formDetails.formId, formId),
  });

  console.log({ formData });

  // Get all results for this form (many-to-one relationship)
  const rawResults = await db
    .select()
    .from(formResults)
    .where(eq(formResults.formId, formId))
    .orderBy(desc(formResults.submittedAt));

  console.log({ rawResults });

  // Validate each result through the FormResultSchema
  const validatedResults = z.array(FormResultSchema).parse(rawResults);

  console.log({ validatedResults });

  return (
    <FormResultsPage formName={singleForm.name} results={validatedResults} />
  );
};

export default page;
