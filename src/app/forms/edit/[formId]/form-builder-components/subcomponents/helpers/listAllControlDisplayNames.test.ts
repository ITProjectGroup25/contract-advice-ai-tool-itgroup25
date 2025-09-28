// @ts-ignore
import { describe, it, expect } from "bun:test";
import listAllControlDisplayNames from "./listAllControlDisplayNames";

describe("listAllControlDisplayNames", () => {
  it("should return empty array when args is null", () => {
    const result = listAllControlDisplayNames(null);
    expect(result).toEqual([]);
  });

  it("should return empty array when formLayoutComponents is empty", () => {
    const args = {
      id: 1,
      formName: "Test Form",
      formLayoutComponents: [],
    };

    const result = listAllControlDisplayNames(args);
    expect(result).toEqual([]);
  });

  it("should return empty array when no children exist in any components", () => {
    const args = {
      id: 1,
      formName: "Test Form",
      formLayoutComponents: [
        {
          container: {
            controlName: "container1",
            displayText: "Container 1",
            itemType: "container",
            icon: "icon1",
            alwaysVisible: true,
            id: "cont1",
            heading: "Heading 1",
            subHeading: "Sub Heading 1",
          },
          children: [],
        },
      ],
    };

    const result = listAllControlDisplayNames(args);
    expect(result).toEqual([]);
  });

  it("should return display texts from children of single component", () => {
    const args = {
      id: 1,
      formName: "Test Form",
      formLayoutComponents: [
        {
          container: {
            controlName: "container1",
            displayText: "Container 1",
            itemType: "container",
            icon: "icon1",
            alwaysVisible: true,
            id: "cont1",
            heading: "Heading 1",
            subHeading: "Sub Heading 1",
          },
          children: [
            {
              controlName: "textField1",
              displayText: "Text Field 1",
              description: "Description 1",
              labelName: "Label 1",
              itemType: "textField",
              icon: "text-icon",
              required: true,
              category: "input",
              id: "field1",
              containerId: "cont1",
            },
            {
              controlName: "dropdown1",
              displayText: "Dropdown 1",
              description: "Description 2",
              labelName: "Label 2",
              itemType: "dropdown",
              icon: "dropdown-icon",
              required: false,
              category: "selection",
              id: "field2",
              containerId: "cont1",
            },
          ],
        },
      ],
    };

    const result = listAllControlDisplayNames(args);
    expect(result).toEqual(["Text Field 1", "Dropdown 1"]);
  });

  it("should return display texts from children of multiple components", () => {
    const args = {
      id: 1,
      formName: "Test Form",
      formLayoutComponents: [
        {
          container: {
            controlName: "container1",
            displayText: "Container 1",
            itemType: "container",
            icon: "icon1",
            alwaysVisible: true,
            id: "cont1",
            heading: "Heading 1",
            subHeading: "Sub Heading 1",
          },
          children: [
            {
              controlName: "textField1",
              displayText: "Text Field 1",
              description: "Description 1",
              labelName: "Label 1",
              itemType: "textField",
              icon: "text-icon",
              required: true,
              category: "input",
              id: "field1",
              containerId: "cont1",
            },
          ],
        },
        {
          container: {
            controlName: "container2",
            displayText: "Container 2",
            itemType: "container",
            icon: "icon2",
            alwaysVisible: false,
            id: "cont2",
            heading: "Heading 2",
            subHeading: "Sub Heading 2",
          },
          children: [
            {
              controlName: "checkbox1",
              displayText: "Checkbox 1",
              description: "Description 3",
              labelName: "Label 3",
              itemType: "checkbox",
              icon: "checkbox-icon",
              required: false,
              category: "selection",
              id: "field3",
              containerId: "cont2",
            },
            {
              controlName: "textarea1",
              displayText: "Textarea 1",
              description: "Description 4",
              labelName: "Label 4",
              itemType: "textarea",
              icon: "textarea-icon",
              required: true,
              category: "input",
              id: "field4",
              containerId: "cont2",
              rows: 5,
            },
          ],
        },
      ],
    };

    const result = listAllControlDisplayNames(args);
    expect(result).toEqual(["Text Field 1", "Checkbox 1", "Textarea 1"]);
  });

  it("should handle mixed scenarios with some empty children arrays", () => {
    const args = {
      id: 1,
      formName: "Test Form",
      formLayoutComponents: [
        {
          container: {
            controlName: "container1",
            displayText: "Container 1",
            itemType: "container",
            icon: "icon1",
            alwaysVisible: true,
            id: "cont1",
            heading: "Heading 1",
            subHeading: "Sub Heading 1",
          },
          children: [],
        },
        {
          container: {
            controlName: "container2",
            displayText: "Container 2",
            itemType: "container",
            icon: "icon2",
            alwaysVisible: false,
            id: "cont2",
            heading: "Heading 2",
            subHeading: "Sub Heading 2",
          },
          children: [
            {
              controlName: "radioButton1",
              displayText: "Radio Button 1",
              description: "Description 5",
              labelName: "Label 5",
              itemType: "radioButton",
              icon: "radio-icon",
              required: true,
              category: "selection",
              id: "field5",
              containerId: "cont2",
            },
          ],
        },
      ],
    };

    const result = listAllControlDisplayNames(args);
    expect(result).toEqual(["Radio Button 1"]);
  });

  it("should preserve order of display texts as they appear in the form", () => {
    const args = {
      id: 1,
      formName: "Test Form",
      formLayoutComponents: [
        {
          container: {
            controlName: "container1",
            displayText: "Container 1",
            itemType: "container",
            icon: "icon1",
            alwaysVisible: true,
            id: "cont1",
            heading: "Heading 1",
            subHeading: "Sub Heading 1",
          },
          children: [
            {
              controlName: "field3",
              displayText: "Field 3",
              description: "Description",
              labelName: "Label",
              itemType: "textField",
              icon: "icon",
              required: false,
              category: "input",
              id: "f3",
              containerId: "cont1",
            },
            {
              controlName: "field1",
              displayText: "Field 1",
              description: "Description",
              labelName: "Label",
              itemType: "textField",
              icon: "icon",
              required: false,
              category: "input",
              id: "f1",
              containerId: "cont1",
            },
            {
              controlName: "field2",
              displayText: "Field 2",
              description: "Description",
              labelName: "Label",
              itemType: "textField",
              icon: "icon",
              required: false,
              category: "input",
              id: "f2",
              containerId: "cont1",
            },
          ],
        },
      ],
    };

    const result = listAllControlDisplayNames(args);
    expect(result).toEqual(["Field 3", "Field 1", "Field 2"]);
  });

  // Additional tests for displayText functionality
  it("should handle cases where displayText contains special characters", () => {
    const args = {
      id: 1,
      formName: "Test Form",
      formLayoutComponents: [
        {
          container: {
            controlName: "container1",
            displayText: "Container 1",
            itemType: "container",
            icon: "icon1",
            alwaysVisible: true,
            id: "cont1",
            heading: "Heading 1",
            subHeading: "Sub Heading 1",
          },
          children: [
            {
              controlName: "specialField1",
              displayText: "User's Name (Required)",
              description: "Description",
              labelName: "Label",
              itemType: "textField",
              icon: "icon",
              required: true,
              category: "input",
              id: "special1",
              containerId: "cont1",
            },
            {
              controlName: "specialField2",
              displayText: "Email Address - Optional",
              description: "Description",
              labelName: "Label",
              itemType: "email",
              icon: "icon",
              required: false,
              category: "input",
              id: "special2",
              containerId: "cont1",
            },
          ],
        },
      ],
    };

    const result = listAllControlDisplayNames(args);
    expect(result).toEqual([
      "User's Name (Required)",
      "Email Address - Optional",
    ]);
  });

  it("should handle cases where displayText is empty string", () => {
    const args = {
      id: 1,
      formName: "Test Form",
      formLayoutComponents: [
        {
          container: {
            controlName: "container1",
            displayText: "Container 1",
            itemType: "container",
            icon: "icon1",
            alwaysVisible: true,
            id: "cont1",
            heading: "Heading 1",
            subHeading: "Sub Heading 1",
          },
          children: [
            {
              controlName: "field1",
              displayText: "",
              description: "Description",
              labelName: "Label",
              itemType: "textField",
              icon: "icon",
              required: false,
              category: "input",
              id: "f1",
              containerId: "cont1",
            },
            {
              controlName: "field2",
              displayText: "Valid Display Text",
              description: "Description",
              labelName: "Label",
              itemType: "textField",
              icon: "icon",
              required: false,
              category: "input",
              id: "f2",
              containerId: "cont1",
            },
          ],
        },
      ],
    };

    const result = listAllControlDisplayNames(args);
    expect(result).toEqual(["", "Valid Display Text"]);
  });

  it("should handle duplicate display texts", () => {
    const args = {
      id: 1,
      formName: "Test Form",
      formLayoutComponents: [
        {
          container: {
            controlName: "container1",
            displayText: "Container 1",
            itemType: "container",
            icon: "icon1",
            alwaysVisible: true,
            id: "cont1",
            heading: "Heading 1",
            subHeading: "Sub Heading 1",
          },
          children: [
            {
              controlName: "field1",
              displayText: "Text Input",
              description: "Description 1",
              labelName: "Label 1",
              itemType: "textField",
              icon: "icon",
              required: false,
              category: "input",
              id: "f1",
              containerId: "cont1",
            },
            {
              controlName: "field2",
              displayText: "Text Input",
              description: "Description 2",
              labelName: "Label 2",
              itemType: "textField",
              icon: "icon",
              required: false,
              category: "input",
              id: "f2",
              containerId: "cont1",
            },
            {
              controlName: "field3",
              displayText: "Different Input",
              description: "Description 3",
              labelName: "Label 3",
              itemType: "textField",
              icon: "icon",
              required: false,
              category: "input",
              id: "f3",
              containerId: "cont1",
            },
          ],
        },
      ],
    };

    const result = listAllControlDisplayNames(args);
    expect(result).toEqual(["Text Input", "Text Input", "Different Input"]);
  });
});
