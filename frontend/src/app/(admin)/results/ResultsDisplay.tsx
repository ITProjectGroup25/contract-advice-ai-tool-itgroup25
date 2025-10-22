import { db, form, formResults } from "@backend";
import { eq } from "drizzle-orm";

type Props = {
  formId: number;
};

const ResultsDisplay = async ({ formId }: Props) => {
  const singleForm = (await db.select().from(form).where(eq(form.id, formId)).limit(1))?.[0];

  if (!singleForm) return null;

  const submissions = await db.select().from(formResults).where(eq(formResults.formId, formId));

  if (!submissions || submissions.length === 0) {
    return <p>No submissions on this form yet!</p>;
  }

  return <div>Submissions: {submissions.length}</div>;
};

export default ResultsDisplay;
