import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { form, formDetails, formResults } from "../../../../../drizzle/schema";
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
  const results = await db
    .select()
    .from(formResults)
    .where(eq(formResults.formId, formId))
    .orderBy(desc(formResults.submittedAt));

  console.log({ results });

  return <FormResultsPage formName={singleForm.name} results={results} />;
};

export default page;
