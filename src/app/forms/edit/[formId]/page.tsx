import { db } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { form, formDetails } from "../../../../../drizzle/schema";
import MainFormBuilder from "./form-builder-components/main-form-builder";
import { TemplateSchema } from "./form-builder-components/types/FormTemplateTypes";

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

  console.log(form.id);

  console.log({ formId });

  const singleForm = await db.query.form.findFirst({
    where: eq(form.id, formId),
  });

  console.log({ singleForm });

  const formData = await db.query.formDetails.findFirst({
    where: eq(formDetails.formId, formId),
  });

  console.log({ formData });

  const formFields = z.string().parse(formData?.formFields);

  console.log({ formFields });

  const formTemplate = {
    formName: singleForm?.name!,
    id: singleForm?.id!,
    createdAt: singleForm?.createdAt!,
    formLayoutComponents: JSON.parse(formFields),
    publishHistory: [],
    creator: "",
  };

  console.log({ formTemplate });

  const validatedFormTemplate = TemplateSchema.parse(formTemplate);

  console.log({ validatedFormTemplate });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <MainFormBuilder formTemplate={validatedFormTemplate} />
      </div>
    </main>
  );
};

export default page;
