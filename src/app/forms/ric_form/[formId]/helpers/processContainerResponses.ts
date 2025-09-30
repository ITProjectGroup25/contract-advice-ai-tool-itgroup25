import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
} from "@/app/forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";

const processContainerResponses = (
  step: {
    container: FormLayoutComponentContainerType;
    children: FormLayoutComponentChildrenType[];
  },
  formData: Record<string, any>
) => {
  const containerResponses: any[] = [];

  step.children.forEach((child) => {
    const fieldId = child.id.toString();
    const fieldValue = formData[fieldId];

    // Skip if no value was provided (but allow empty arrays and false values)
    if (fieldValue === undefined || fieldValue === null) {
      return;
    }

    // Skip empty strings
    if (fieldValue === "") {
      return;
    }

    const response: Record<string, any> = {};
    response[child.labelName] = fieldValue;
    containerResponses.push(response);
  });

  return containerResponses;
};
export default processContainerResponses;
