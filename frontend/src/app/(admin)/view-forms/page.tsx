import { getUserForms } from "@/app/actions/getUserForms";
import FormList from "@/app/forms/FormList";

type Props = {};

export const dynamic = "force-dynamic";

const page = async (props: Props) => {
  const forms = await getUserForms();
  return (
    <div>
      <h1 className="text-4xl font-normal px-4 m-5">My Forms</h1>
      <FormList forms={forms} />
    </div>
  );
};

export default page;


