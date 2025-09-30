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

  const singleForm = (await db.select().from(form).where(eq(form.id, formId)).limit(1))[0];

  if (!singleForm) {
    return <div>Form not Found!</div>;
  }

  const formData = (await db.select().from(formDetails).where(eq(formDetails.formId, formId)).limit(1))[0];

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
