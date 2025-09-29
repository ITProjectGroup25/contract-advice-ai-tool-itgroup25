import {
  FormLayoutComponentChildrenType,
  TemplateType,
} from "../../types/FormTemplateTypes";
import searchForTargetedControl from "./searchForTargetedControl";

describe("searchForTargetedControl", () => {
  const mockTemplate: TemplateType = {
    formName: "Test Form",
    id: 1,
    formLayoutComponents: [
      {
        container: {
          controlName: "container1",
          displayText: "Container 1",
          itemType: "container",
          icon: "fa fa-container",
          heading: "Heading 1",
          subHeading: "Subheading 1",
          id: "container-1",
          alwaysVisible: true,
        },
        children: [
          {
            controlName: "textField1",
            displayText: "Text Field 1",
            description: "A text field",
            labelName: "FirstName",
            itemType: "text",
            icon: "fa fa-text",
            required: true,
            id: "child-1",
            containerId: "container-1",
            category: "basic",
            items: [
              {
                id: "item-1",
                label: "First Name",
                value: "John",
              },
            ],
          },
          {
            controlName: "textField2",
            displayText: "Text Field 2",
            description: "Another text field",
            labelName: "LastName",
            itemType: "text",
            icon: "fa fa-text",
            required: true,
            id: "child-2",
            containerId: "container-1",
            category: "basic",
          },
        ],
      },
    ],
  };

  it("should return the entire targeted control if found", () => {
    const result = searchForTargetedControl({
      controlLabelName: "FirstName",
      template: mockTemplate,
    });
    const expected: FormLayoutComponentChildrenType =
      mockTemplate.formLayoutComponents[0].children[0];
    expect(result).toEqual(expected);
  });

  it("should return null if control label name is not found", () => {
    const result = searchForTargetedControl({
      controlLabelName: "NonExistent",
      template: mockTemplate,
    });
    expect(result).toBeNull();
  });

  it("should return the entire control even if it has no items", () => {
    const result = searchForTargetedControl({
      controlLabelName: "LastName",
      template: mockTemplate,
    });
    const expected: FormLayoutComponentChildrenType =
      mockTemplate.formLayoutComponents[0].children[1];
    expect(result).toEqual(expected);
  });
});
