import useFormBuilder from "../../hooks/useFormBuilder";

type Args = ReturnType<typeof useFormBuilder>["selectedTemplate"];

const listAllControl = (args: Args): string[] => {
  console.log({ args });
  // Handle null case
  if (!args) {
    return [];
  }

  // Handle case where formLayoutComponents doesn't exist or is empty
  if (!args.formLayoutComponents || args.formLayoutComponents.length === 0) {
    return [];
  }

  // Extract all labelName from children across all components
  const labelNames: string[] = [];

  args.formLayoutComponents.forEach((component) => {
    if (component.children && component.children.length > 0) {
      component.children.forEach((child) => {
        labelNames.push(child.labelName);
      });
    }
  });

  return labelNames;
};

export default listAllControl;
