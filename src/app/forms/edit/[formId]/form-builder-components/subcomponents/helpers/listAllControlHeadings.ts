import useFormBuilder from "../../hooks/useFormBuilder";

type Args = ReturnType<typeof useFormBuilder>["selectedTemplate"];

const listAllControlHeadings = (args: Args): string[] => {
  return [];
};

export default listAllControlHeadings;
