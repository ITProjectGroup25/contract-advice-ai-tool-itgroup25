import useFormBuilder from "../../hooks/useFormBuilder";
import { FormControlNames } from "../../utils/formBuilderUtils";

type Args = {
  controlName: string;
  template: ReturnType<typeof useFormBuilder>["selectedTemplate"];
};

const retrieveOptionsFromControl = ({
  controlName,
  template,
}: Args): string[] => {
  // Handle null template case
  if (!template) {
    return [];
  }

  // Handle case where formLayoutComponents doesn't exist or is empty
  if (
    !template.formLayoutComponents ||
    template.formLayoutComponents.length === 0
  ) {
    return [];
  }

  // Search through all components and their children to find the matching control
  for (const component of template.formLayoutComponents) {
    if (component.children && component.children.length > 0) {
      for (const child of component.children) {
        // Check if this child's labelName matches the controlName we're looking for
        if (child.labelName === controlName) {
          // If this control has items (options), return the labels
          if (child.items && child.items.length > 0) {
            return child.items.map((item) => item.label);
          }
          // If no items found, return empty array
          return [];
        }
      }
    }
  }

  // If no matching control found, return empty array
  return [];
};

export default retrieveOptionsFromControl;
