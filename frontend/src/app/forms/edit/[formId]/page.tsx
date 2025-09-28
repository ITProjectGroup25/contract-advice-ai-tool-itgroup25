import { db, form, formDetails } from "@backend";
import { eq } from "drizzle-orm";
import { z } from "zod";
import MainFormBuilder from "./form-builder-components/main-form-builder";
import { TemplateSchema } from "./form-builder-components/types/FormTemplateTypes";

export const dynamic = "force-dynamic";

type PageParams = {
  params: {
    formId: string;
  };
};

const page = async ({ params }: PageParams) => {
  const formId = Number(params.formId);

  if (!Number.isInteger(formId)) {
    return <div>Form not Found!</div>;
  }

  const singleForm = await db.query.form.findFirst({
    where: eq(form.id, formId),
  });

  if (!singleForm) {
    return <div>Form not Found!</div>;
  }

  const formData = await db.query.formDetails.findFirst({
    where: eq(formDetails.formId, formId),
  });

  const formFields = formData?.formFields
    ? z.string().parse(formData.formFields)
    : "[]";

  const formTemplate = {
    formName: singleForm.name ?? "Untitled Form",
    id: singleForm.id,
    createdAt: singleForm.createdAt,
    formLayoutComponents: JSON.parse(formFields),
    publishHistory: [],
    creator: "",
  };

  const validatedFormTemplate = TemplateSchema.parse(formTemplate);

  return (
    <div>
      <MainFormBuilder formTemplate={validatedFormTemplate} />
    </div>
  );
};

export default page;
