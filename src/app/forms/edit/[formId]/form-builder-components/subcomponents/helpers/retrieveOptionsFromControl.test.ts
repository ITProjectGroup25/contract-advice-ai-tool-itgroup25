// @ts-ignore
import { describe, it, expect } from "bun:test";
import retrieveOptionsFromControl from "./retrieveOptionsFromControl";

describe("retrieveOptionsFromControl", () => {
  it("should return empty array when template is null", () => {
    const result = retrieveOptionsFromControl({
      controlName: "Label for Radio",
      template: null,
    });
    expect(result).toEqual([]);
  });

  it("should return empty array when formLayoutComponents is empty", () => {
    const template = {
      formName: "Test Form",
      id: 1,
      formLayoutComponents: [],
      publishHistory: [],
      creator: "",
    };

    const result = retrieveOptionsFromControl({
      controlName: "Label for Radio",
      template,
    });
    expect(result).toEqual([]);
  });

  it("should return empty array when no children exist in any components", () => {
    const template = {
      formName: "Test Form",
      id: 1,
      formLayoutComponents: [
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading",
            subHeading: "Container SubHeading",
            id: "container1",
            alwaysVisible: true,
          },
          children: [],
        },
      ],
      publishHistory: [],
      creator: "",
    };

    const result = retrieveOptionsFromControl({
      controlName: "Label for Radio",
      template,
    });
    expect(result).toEqual([]);
  });

  it("should return empty array when control label name is not found", () => {
    const template = {
      formName: "Test Form",
      id: 1,
      formLayoutComponents: [
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading",
            subHeading: "Container SubHeading",
            id: "container1",
            alwaysVisible: true,
          },
          children: [
            {
              controlName: "text-input",
              displayText: "Text Input",
              description: "Some Description",
              labelName: "Different Label",
              itemType: "control",
              icon: "fas fa-text",
              required: false,
              category: "input",
              id: "field1",
              containerId: "container1",
            },
          ],
        },
      ],
      publishHistory: [],
      creator: "",
    };

    const result = retrieveOptionsFromControl({
      controlName: "Nonexistent Label",
      template,
    });
    expect(result).toEqual([]);
  });

  it("should return empty array when control is found but has no items", () => {
    const template = {
      formName: "Test Form",
      id: 1,
      formLayoutComponents: [
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading",
            subHeading: "Container SubHeading",
            id: "container1",
            alwaysVisible: true,
          },
          children: [
            {
              controlName: "text-input",
              displayText: "Text Input",
              description: "Some Description",
              labelName: "Label for Text",
              itemType: "control",
              icon: "fas fa-text",
              required: false,
              category: "input",
              id: "field1",
              containerId: "container1",
            },
          ],
        },
      ],
      publishHistory: [],
      creator: "",
    };

    const result = retrieveOptionsFromControl({
      controlName: "Label for Text",
      template,
    });
    expect(result).toEqual([]);
  });

  it("should return empty array when control is found but items array is empty", () => {
    const template = {
      formName: "Test Form",
      id: 1,
      formLayoutComponents: [
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading",
            subHeading: "Container SubHeading",
            id: "container1",
            alwaysVisible: true,
          },
          children: [
            {
              controlName: "radio-group",
              displayText: "Radio",
              description: "Some Description",
              labelName: "Label for Radio",
              itemType: "control",
              icon: "far fa-dot-circle",
              required: false,
              items: [],
              category: "other-elements",
              id: "field1",
              containerId: "container1",
            },
          ],
        },
      ],
      publishHistory: [],
      creator: "",
    };

    const result = retrieveOptionsFromControl({
      controlName: "Label for Radio",
      template,
    });
    expect(result).toEqual([]);
  });

  it("should return option labels when control with items is found", () => {
    const template = {
      formName: "Test Form",
      id: 1,
      formLayoutComponents: [
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading",
            subHeading: "Container SubHeading",
            id: "container1",
            alwaysVisible: true,
          },
          children: [
            {
              controlName: "radio-group",
              displayText: "Radio",
              description: "Some Description",
              labelName: "Label for Radio",
              itemType: "control",
              icon: "far fa-dot-circle",
              required: false,
              items: [
                {
                  id: "item1",
                  value: "Option__-1",
                  label: "Option 1",
                },
                {
                  id: "item2",
                  value: "Option__-2",
                  label: "Option 2",
                },
              ],
              category: "other-elements",
              id: "field1",
              containerId: "container1",
            },
          ],
        },
      ],
      publishHistory: [],
      creator: "",
    };

    const result = retrieveOptionsFromControl({
      controlName: "Label for Radio",
      template,
    });
    expect(result).toEqual(["Option 1", "Option 2"]);
  });

  it("should return option labels from control in multiple components", () => {
    const template = {
      formName: "Test Form",
      id: 1,
      formLayoutComponents: [
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading 1",
            subHeading: "Container SubHeading",
            id: "container1",
            alwaysVisible: true,
          },
          children: [
            {
              controlName: "text-input",
              displayText: "Text Input",
              description: "Some Description",
              labelName: "Label for Text",
              itemType: "control",
              icon: "fas fa-text",
              required: false,
              category: "input",
              id: "field1",
              containerId: "container1",
            },
          ],
        },
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading 2",
            subHeading: "Container SubHeading",
            id: "container2",
            alwaysVisible: true,
          },
          children: [
            {
              controlName: "dropdown",
              displayText: "Dropdown",
              description: "Some Description",
              labelName: "Label for Dropdown",
              itemType: "control",
              icon: "fas fa-caret-down",
              required: true,
              items: [
                {
                  id: "dropdown1",
                  value: "Choice__-1",
                  label: "Choice A",
                },
                {
                  id: "dropdown2",
                  value: "Choice__-2",
                  label: "Choice B",
                },
                {
                  id: "dropdown3",
                  value: "Choice__-3",
                  label: "Choice C",
                },
              ],
              category: "selection",
              id: "field2",
              containerId: "container2",
            },
          ],
        },
      ],
      publishHistory: [],
      creator: "",
    };

    const result = retrieveOptionsFromControl({
      controlName: "Label for Dropdown",
      template,
    });
    expect(result).toEqual(["Choice A", "Choice B", "Choice C"]);
  });

  it("should return first matching control's options when multiple controls have same label name", () => {
    const template = {
      formName: "Test Form",
      id: 1,
      formLayoutComponents: [
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading",
            subHeading: "Container SubHeading",
            id: "container1",
            alwaysVisible: true,
          },
          children: [
            {
              controlName: "radio-group-1",
              displayText: "Radio 1",
              description: "First radio group",
              labelName: "Duplicate Label",
              itemType: "control",
              icon: "far fa-dot-circle",
              required: false,
              items: [
                {
                  id: "first1",
                  value: "First__-1",
                  label: "First Option 1",
                },
                {
                  id: "first2",
                  value: "First__-2",
                  label: "First Option 2",
                },
              ],
              category: "other-elements",
              id: "field1",
              containerId: "container1",
            },
            {
              controlName: "radio-group-2",
              displayText: "Radio 2",
              description: "Second radio group",
              labelName: "Duplicate Label",
              itemType: "control",
              icon: "far fa-dot-circle",
              required: false,
              items: [
                {
                  id: "second1",
                  value: "Second__-1",
                  label: "Second Option 1",
                },
                {
                  id: "second2",
                  value: "Second__-2",
                  label: "Second Option 2",
                },
              ],
              category: "other-elements",
              id: "field2",
              containerId: "container1",
            },
          ],
        },
      ],
      publishHistory: [],
      creator: "",
    };

    const result = retrieveOptionsFromControl({
      controlName: "Duplicate Label",
      template,
    });
    expect(result).toEqual(["First Option 1", "First Option 2"]);
  });

  it("should handle controls with single option", () => {
    const template = {
      formName: "Test Form",
      id: 1,
      formLayoutComponents: [
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading",
            subHeading: "Container SubHeading",
            id: "container1",
            alwaysVisible: true,
          },
          children: [
            {
              controlName: "checkbox",
              displayText: "Checkbox",
              description: "Single checkbox",
              labelName: "Single Checkbox Label",
              itemType: "control",
              icon: "far fa-check-square",
              required: false,
              items: [
                {
                  id: "single1",
                  value: "Single__-option",
                  label: "Only Option",
                },
              ],
              category: "selection",
              id: "field1",
              containerId: "container1",
            },
          ],
        },
      ],
      publishHistory: [],
      creator: "",
    };

    const result = retrieveOptionsFromControl({
      controlName: "Single Checkbox Label",
      template,
    });
    expect(result).toEqual(["Only Option"]);
  });

  it("should handle case sensitivity in label name matching", () => {
    const template = {
      formName: "Test Form",
      id: 1,
      formLayoutComponents: [
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading",
            subHeading: "Container SubHeading",
            id: "container1",
            alwaysVisible: true,
          },
          children: [
            {
              controlName: "radio-group",
              displayText: "Radio",
              description: "Case sensitive test",
              labelName: "Label For Radio",
              itemType: "control",
              icon: "far fa-dot-circle",
              required: false,
              items: [
                {
                  id: "case1",
                  value: "Case__-1",
                  label: "Case Option 1",
                },
              ],
              category: "other-elements",
              id: "field1",
              containerId: "container1",
            },
          ],
        },
      ],
      publishHistory: [],
      creator: "",
    };

    const result = retrieveOptionsFromControl({
      controlName: "label for radio", // lowercase
      template,
    });
    expect(result).toEqual([]); // Should not match due to case sensitivity
  });
});
