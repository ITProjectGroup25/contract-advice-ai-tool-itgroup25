import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
} from "@/app/forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";

type Args = {
  formTemplate: {
    formLayoutComponents: Array<{
      container: FormLayoutComponentContainerType;
      children: FormLayoutComponentChildrenType[];
    }>;
  };
};

type Return = Array<{
  container: FormLayoutComponentContainerType;
  children: FormLayoutComponentChildrenType[];
}>;

export function retrieveVisibleSteps(form: Args): Return {
  return form.formTemplate.formLayoutComponents.filter(
    (comp) => comp.container.alwaysVisible === true
  );
}
