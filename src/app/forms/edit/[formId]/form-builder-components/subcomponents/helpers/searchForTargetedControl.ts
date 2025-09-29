import {
  FormLayoutComponentChildrenType,
  TemplateType,
} from "../../types/FormTemplateTypes";

type Args = {
  controlLabelName: string;
  template: TemplateType;
};

const searchForTargetedControl = ({
  controlLabelName,
  template,
}: Args): FormLayoutComponentChildrenType | null => {
  for (const container of template.formLayoutComponents) {
    for (const child of container.children) {
      if (child.labelName === controlLabelName) {
        return child; // Return the entire control
      }
    }
  }
  return null; // Not found
};

export default searchForTargetedControl;
