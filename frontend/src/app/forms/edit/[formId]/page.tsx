import postgres from "postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@backend";
import { redirect } from "next/navigation";
import MainFormBuilder from "./form-builder-components/main-form-builder";
import { TemplateSchema } from "./form-builder-components/types/FormTemplateTypes";

export const dynamic = "force-dynamic";

type PageParams = {
  params: {
    formId: string;
  };
};

const page = async ({ params }: PageParams) => {
  // Check authentication before allowing access to form editor
  const session = await getServerSession(authOptions as any);
  
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const formId = Number(params.formId);

  if (!Number.isInteger(formId)) {
    return <div>Form not Found!</div>;
  }

  // Use direct SQL queries to avoid Drizzle ORM compatibility issues
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return <div>Database configuration error</div>;
  }

  const sql = postgres(connectionString);

  let formTemplate;

  try {
    // Get form data
    const singleFormResult = await sql`
      SELECT * FROM form WHERE id = ${formId} LIMIT 1
    `;

    const singleForm = singleFormResult[0];

    if (!singleForm) {
      await sql.end();
      return <div>Form not Found!</div>;
    }

    // Get form details
    const formDataResult = await sql`
      SELECT * FROM form_details WHERE form_id = ${formId} LIMIT 1
    `;

    const formData = formDataResult[0];

    await sql.end();

    const formFields = formData?.form_fields
      ? typeof formData.form_fields === "string"
        ? formData.form_fields
        : JSON.stringify(formData.form_fields)
      : "[]";

    formTemplate = {
      formName: singleForm.name ?? "Untitled Form",
      id: singleForm.id,
      createdAt: singleForm.created_at,
      formLayoutComponents: JSON.parse(formFields),
      publishHistory: [],
      creator: "",
    };
  } catch (error) {
    console.error("Error loading form:", error);
    return <div>Error loading form. Please try again.</div>;
  }

  const validatedFormTemplate = TemplateSchema.parse(formTemplate);

  return (
    <div>
      <MainFormBuilder formTemplate={validatedFormTemplate} />
    </div>
  );
};

export default page;
