import { db } from "@/db";
import { eq } from "drizzle-orm";
import { formFaqs } from "../../../../../drizzle/schema";
import AdminFAQManager from "./faq-creator";

const page = async ({
  params,
}: {
  params: {
    formId: string;
  };
}) => {
  const formId = parseInt(params.formId);

  if (!formId || isNaN(formId)) {
    return <div>Form not found</div>;
  }

  // Fetch FAQs for this form
  const faqs = await db
    .select({
      id: formFaqs.id,
      question: formFaqs.question,
      answer: formFaqs.answer,
    })
    .from(formFaqs)
    .where(eq(formFaqs.formId, formId));

  return <AdminFAQManager FAQs={faqs} formId={formId} />;
};

export default page;
