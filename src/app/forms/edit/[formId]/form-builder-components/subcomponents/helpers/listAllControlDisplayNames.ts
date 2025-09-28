import useFormBuilder from "../../hooks/useFormBuilder";

type Args = ReturnType<typeof useFormBuilder>["selectedTemplate"];

const listAllControl = (args: Args): string[] => {
  // Handle null case
  if (!args) {
    return [];
  }

  // Handle case where formLayoutComponents doesn't exist or is empty
  if (!args.formLayoutComponents || args.formLayoutComponents.length === 0) {
    return [];
  }

  // Extract all displayText from children across all components
  const displayTexts: string[] = [];

  args.formLayoutComponents.forEach((component) => {
    if (component.children && component.children.length > 0) {
      component.children.forEach((child) => {
        displayTexts.push(child.displayText);
      });
    }
  });

  return displayTexts;
};

export default listAllControl;
