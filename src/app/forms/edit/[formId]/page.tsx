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

  // const sampleFormTemplate = {
  //   ...validatedFormTemplate,
  //   formLayoutComponents: [
  //     {
  //       container: {
  //         id: "xdb2ni4u0md3nflqc1qksy",
  //         controlName: "step-container",
  //         displayText: "Workflow Step",
  //         itemType: "container",
  //         icon: "fa fa-building",
  //         heading: "Dropoff Location",
  //         subHeading: "",
  //       },
  //       children: [
  //         {
  //           id: "dl0dduqw8s991yf8amgsm",
  //           controlName: "radio-group",
  //           displayText: "Radio",
  //           description: "Enter the dropoff location of the package",
  //           labelName: "Dropoff Location",
  //           itemType: "control",
  //           icon: "far fa-dot-circle",
  //           required: true,
  //           items: [
  //             {
  //               id: "56azek5q7i2m97yfbmw7j",
  //               value: "Front__-Door",
  //               label: "Front Door",
  //             },
  //             {
  //               id: "y1d6eq3231v2wsvs1ocy",
  //               value: "Back__-Door",
  //               label: "Back Door",
  //             },
  //             {
  //               id: "990tgqa51essjkas0gqzgs",
  //               value: "Package__-Locker",
  //               label: "Package Locker",
  //             },
  //           ],
  //           category: "other-elements",
  //           containerId: "xdb2ni4u0md3nflqc1qksy",
  //         },
  //       ],
  //     },
  //     {
  //       container: {
  //         id: "nyqlps3erjkgfng1rxgbvn",
  //         controlName: "step-container",
  //         displayText: "Workflow Step",
  //         itemType: "container",
  //         icon: "fa fa-building",
  //         heading: "Container Heading",
  //         subHeading: "Container SubHeading",
  //       },
  //       children: [
  //         {
  //           id: "h3qfythhwh5kbi9l5s0hrn",
  //           controlName: "image-upload",
  //           displayText: "Image",
  //           description: "",
  //           labelName: "Upload Image for POD",
  //           itemType: "control",
  //           icon: "far fa-image",
  //           required: true,
  //           category: "media-elements",
  //           containerId: "nyqlps3erjkgfng1rxgbvn",
  //         },
  //       ],
  //     },
  //   ],
  // } satisfies TemplateType;

  return (
    <div>
      <MainFormBuilder formTemplate={validatedFormTemplate} />
    </div>
  );
};

export default page;
