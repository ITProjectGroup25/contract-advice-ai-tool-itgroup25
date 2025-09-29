import { TemplateType } from "../../types/FormTemplateTypes";

type Args = {
  optionName: string;
  formTemplate: TemplateType;
};

/**
 * Finds the option ID from the given optionName by traversing the form template.
 * Returns the option ID if found, otherwise returns an empty string.
 */
const findOptionIdFromOptionName = ({
  optionName,
  formTemplate,
}: Args): string => {
  for (const comp of formTemplate.formLayoutComponents) {
    for (const child of comp.children) {
      if (child.items) {
        const option = child.items.find((opt) => opt.value === optionName);
        if (option) {
          return String(option.id);
        }
      }
    }
  }
  return "";
};

export default findOptionIdFromOptionName;
