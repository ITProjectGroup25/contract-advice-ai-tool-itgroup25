import useFormBuilder from "../../hooks/useFormBuilder";

type Args = ReturnType<typeof useFormBuilder>["selectedTemplate"];

const listAllControlHeadings = (args: Args): string[] => {
  // Handle null case
  if (!args) {
    return [];
  }

  // Handle case where formLayoutComponents doesn't exist or is empty
  if (!args.formLayoutComponents || args.formLayoutComponents.length === 0) {
    return [];
  }

  // Extract all controlNames from children across all components
  const controlNames: string[] = [];

  args.formLayoutComponents.forEach((component) => {
    if (component.children && component.children.length > 0) {
      component.children.forEach((child) => {
        controlNames.push(child.controlName);
      });
    }
  });

  return controlNames;
};

export default listAllControlHeadings;
