import { Toaster } from "@/components/ui/sonner";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { form, formDetails, formFaqs } from "../../../../../drizzle/schema";
import { TemplateSchema } from "../../edit/[formId]/form-builder-components/types/FormTemplateTypes";
import FormParser from "./form-renderer/form-renderer";

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

  // Fetch FAQs for this form
  const faqs = await db
    .select({
      id: formFaqs.id,
      question: formFaqs.question,
      answer: formFaqs.answer,
    })
    .from(formFaqs)
    .where(eq(formFaqs.formId, formId));

  console.log({ faqs });

  const formFields = z.string().parse(formData?.formFields);

  console.log({ formFields });

  const formTemplate = JSON.parse(formFields);

  console.log({ formTemplate });

  const validatedFormTemplate = TemplateSchema.parse(formTemplate);

  console.log({ validatedFormTemplate });

  return (
    <div>
      <FormParser formTemplate={validatedFormTemplate} faqs={faqs} />
      <Toaster />
    </div>
  );
};

export default page;
