import { TemplateType } from "../../types/FormTemplateTypes";
import findOptionIdFromOptionName from "./findOptionIdFromOptionName";

const mockFormTemplate: TemplateType = {
  formName: "Test Form",
  id: 1,
  formLayoutComponents: [
    {
      container: {
        controlName: "step-container",
        displayText: "Step 1",
        itemType: "container",
        icon: "fa fa-box",
        heading: "Heading 1",
        subHeading: "SubHeading 1",
        id: "container-1",
        alwaysVisible: true,
      },
      children: [
        {
          controlName: "radio-group",
          displayText: "Options",
          description: "Choose one",
          labelName: "Option Label",
          itemType: "control",
          icon: "fa fa-circle",
          required: false,
          category: "choices",
          id: "child-1",
          containerId: "container-1",
          items: [
            { id: "opt-1", value: "Option A", label: "Option A" },
            { id: "opt-2", value: "Option B", label: "Option B" },
          ],
        },
      ],
    },
    {
      container: {
        controlName: "step-container",
        displayText: "Step 2",
        itemType: "container",
        icon: "fa fa-box",
        heading: "Heading 2",
        subHeading: "SubHeading 2",
        id: "container-2",
        alwaysVisible: false,
      },
      children: [
        {
          controlName: "dropdown",
          displayText: "More Options",
          description: "Pick one",
          labelName: "Dropdown",
          itemType: "control",
          icon: "fa fa-caret-down",
          required: false,
          category: "choices",
          id: "child-2",
          containerId: "container-2",
          items: [
            { id: 100, value: "Option X", label: "Option X" },
            { id: 101, value: "Option Y", label: "Option Y" },
          ],
        },
      ],
    },
  ],
};

describe("findOptionIdFromOptionName", () => {
  it("should return the correct id when option exists in first container", () => {
    const result = findOptionIdFromOptionName({
      optionName: "Option A",
      formTemplate: mockFormTemplate,
    });
    expect(result).toBe("opt-1");
  });

  it("should return the correct id when option exists in second container", () => {
    const result = findOptionIdFromOptionName({
      optionName: "Option Y",
      formTemplate: mockFormTemplate,
    });
    expect(result).toBe("101"); // note: coerced to string
  });

  it("should return empty string when option does not exist", () => {
    const result = findOptionIdFromOptionName({
      optionName: "Nonexistent Option",
      formTemplate: mockFormTemplate,
    });
    expect(result).toBe("");
  });

  it("should return the first match if multiple options share the same value", () => {
    const templateWithDuplicates: TemplateType = {
      ...mockFormTemplate,
      formLayoutComponents: [
        ...mockFormTemplate.formLayoutComponents,
        {
          container: {
            controlName: "step-container",
            displayText: "Step 3",
            itemType: "container",
            icon: "fa fa-box",
            heading: "Heading 3",
            subHeading: "SubHeading 3",
            id: "container-3",
            alwaysVisible: true,
          },
          children: [
            {
              controlName: "checkbox",
              displayText: "Duplicate Options",
              description: "Duplicate values",
              labelName: "Dupes",
              itemType: "control",
              icon: "fa fa-check",
              required: false,
              category: "choices",
              id: "child-3",
              containerId: "container-3",
              items: [
                { id: "dup-1", value: "Option A", label: "Duplicate Option A" },
              ],
            },
          ],
        },
      ],
    };

    const result = findOptionIdFromOptionName({
      optionName: "Option A",
      formTemplate: templateWithDuplicates,
    });
    expect(result).toBe("opt-1"); // first occurrence wins
  });
});
