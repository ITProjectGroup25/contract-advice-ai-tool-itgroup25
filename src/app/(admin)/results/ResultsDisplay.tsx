import { db } from "@/db";
import { eq } from "drizzle-orm";
import { form } from "../../../../drizzle/schema";

type Props = {
  formId: number;
};

const ResultsDisplay = async ({ formId }: Props) => {
  const singleForm = await db.query.form.findFirst({
    where: eq(form.id, formId),
    with: {
      questions: {
        with: {
          fieldOptions: true,
        },
      },
      submissions: {
        with: {
          answers: {
            with: {
              fieldOption: true,
            },
          },
        },
      },
    },
  });

  if (!singleForm) return null;
  if (!singleForm.submissions)
    return <p>No submissions on this singleForm yet!</p>;
  console.log("singleForm", singleForm);
  return <div></div>;
};

export default ResultsDisplay;
