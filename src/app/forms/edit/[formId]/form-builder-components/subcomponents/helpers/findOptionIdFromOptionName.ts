import { TemplateType } from "../../types/FormTemplateTypes";

type Args = {
  optionName: string;
  formTemplate: TemplateType;
};

/**
 * Finds the option ID from a given optionName by traversing the form template.
 * Matches against the `label` field of child.items.
 * Returns the option ID as a string if found, otherwise "".
 */
const findOptionIdFromOptionName = ({
  optionName,
  formTemplate,
}: Args): string => {
  for (const comp of formTemplate.formLayoutComponents) {
    for (const child of comp.children) {
      if (child.items) {
        const option = child.items.find((opt) => opt.label === optionName);
        if (option) {
          return String(option.id);
        }
      }
    }
  }
  return "";
};

export default findOptionIdFromOptionName