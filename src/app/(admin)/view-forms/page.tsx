import { getUserForms } from "@/app/actions/getUserForms";
import FormList from "@/app/forms/FormList";

type Props = {};

const page = async (props: Props) => {
  const forms = await getUserForms();
  console.log({ forms });
  return (
    <div>
      <h1 className="text-4xl font-normal px-4 m-5">My Forms</h1>
      <FormList forms={forms} />
    </div>
  );
};

export default page;
