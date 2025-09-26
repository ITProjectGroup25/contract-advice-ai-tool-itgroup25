import AdminFAQManager from "./faq-creator";

const page = async ({
  params,
}: {
  params: {
    formId: string;
  };
}) => {
  const formId = params.formId;

  if (!formId) {
    return <div>Form not found</div>;
  }

  return <AdminFAQManager />;
};
export default page;
