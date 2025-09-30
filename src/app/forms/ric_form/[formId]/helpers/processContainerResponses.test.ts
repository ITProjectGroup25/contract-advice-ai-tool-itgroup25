import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
} from "@/app/forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";
import processContainerResponses from "./processContainerResponses";

describe("processContainerResponses", () => {
  const mockContainer: FormLayoutComponentContainerType = {
    controlName: "test-container",
    displayText: "Test Container",
    itemType: "container",
    icon: "icon",
    heading: "Test Heading",
    subHeading: "Test SubHeading",
    id: "container1",
    alwaysVisible: true,
  };

  describe("single value fields", () => {
    it("should process text field responses correctly", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "Enter text",
            labelName: "Your Name",
            itemType: "control",
            icon: "icon",
            required: true,
            category: "text",
            id: "field1",
            containerId: "container1",
            dataType: "text",
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        field1: "John Doe",
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([{ "Your Name": "John Doe" }]);
    });

    it("should process radio button selection correctly", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "radio-group",
            displayText: "Radio",
            description: "",
            labelName: "Query Type",
            itemType: "control",
            icon: "icon",
            required: true,
            category: "selection",
            id: "radio1",
            containerId: "container1",
            items: [
              { id: "opt1", value: "Simple", label: "Simple" },
              { id: "opt2", value: "Complex", label: "Complex" },
            ],
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        radio1: "Simple",
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([{ "Query Type": "Simple" }]);
    });

    it("should process dropdown selection correctly", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "select-dropdown",
            displayText: "Dropdown",
            description: "",
            labelName: "Country",
            itemType: "control",
            icon: "icon",
            required: false,
            category: "selection",
            id: "dropdown1",
            containerId: "container1",
            items: [
              { id: "opt1", value: "USA", label: "United States" },
              { id: "opt2", value: "UK", label: "United Kingdom" },
            ],
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        dropdown1: "USA",
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([{ Country: "USA" }]);
    });
  });

  describe("array value fields", () => {
    it("should process checklist selections correctly", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "checklist",
            displayText: "Checklist",
            description: "",
            labelName: "Grants Team",
            itemType: "control",
            icon: "icon",
            required: false,
            category: "selection",
            id: "checklist1",
            containerId: "container1",
            items: [
              {
                id: "opt1",
                value: "Health and Medical",
                label: "Health and Medical",
              },
              { id: "opt2", value: "International", label: "International" },
              { id: "opt3", value: "ARC-D", label: "ARC-D" },
            ],
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        checklist1: ["Health and Medical", "International"],
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([
        { "Grants Team": ["Health and Medical", "International"] },
      ]);
    });
  });

  describe("multiple fields in container", () => {
    it("should process multiple fields correctly", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "",
            labelName: "Your Name",
            itemType: "control",
            icon: "icon",
            required: true,
            category: "text",
            id: "field1",
            containerId: "container1",
            dataType: "text",
          },
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "",
            labelName: "Your Email",
            itemType: "control",
            icon: "icon",
            required: true,
            category: "text",
            id: "field2",
            containerId: "container1",
            dataType: "email",
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        field1: "John Doe",
        field2: "john@example.com",
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([
        { "Your Name": "John Doe" },
        { "Your Email": "john@example.com" },
      ]);
    });

    it("should process mixed field types correctly", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "",
            labelName: "Name",
            itemType: "control",
            icon: "icon",
            required: true,
            category: "text",
            id: "field1",
            containerId: "container1",
            dataType: "text",
          },
          {
            controlName: "radio-group",
            displayText: "Radio",
            description: "",
            labelName: "Type",
            itemType: "control",
            icon: "icon",
            required: true,
            category: "selection",
            id: "radio1",
            containerId: "container1",
            items: [
              { id: "opt1", value: "Option1", label: "Option 1" },
              { id: "opt2", value: "Option2", label: "Option 2" },
            ],
          },
          {
            controlName: "checklist",
            displayText: "Checklist",
            description: "",
            labelName: "Features",
            itemType: "control",
            icon: "icon",
            required: false,
            category: "selection",
            id: "checklist1",
            containerId: "container1",
            items: [
              { id: "f1", value: "Feature1", label: "Feature 1" },
              { id: "f2", value: "Feature2", label: "Feature 2" },
            ],
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        field1: "Test Name",
        radio1: "Option1",
        checklist1: ["Feature1", "Feature2"],
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([
        { Name: "Test Name" },
        { Type: "Option1" },
        { Features: ["Feature1", "Feature2"] },
      ]);
    });
  });

  describe("empty or missing values", () => {
    it("should skip fields with undefined values", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "",
            labelName: "Optional Field",
            itemType: "control",
            icon: "icon",
            required: false,
            category: "text",
            id: "field1",
            containerId: "container1",
            dataType: "text",
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        field1: undefined,
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([]);
    });

    it("should skip fields with null values", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "",
            labelName: "Optional Field",
            itemType: "control",
            icon: "icon",
            required: false,
            category: "text",
            id: "field1",
            containerId: "container1",
            dataType: "text",
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        field1: null,
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([]);
    });

    it("should skip fields with empty string values", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "",
            labelName: "Optional Field",
            itemType: "control",
            icon: "icon",
            required: false,
            category: "text",
            id: "field1",
            containerId: "container1",
            dataType: "text",
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        field1: "",
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([]);
    });

    it("should skip missing fields from formData", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "",
            labelName: "Field 1",
            itemType: "control",
            icon: "icon",
            required: false,
            category: "text",
            id: "field1",
            containerId: "container1",
            dataType: "text",
          },
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "",
            labelName: "Field 2",
            itemType: "control",
            icon: "icon",
            required: false,
            category: "text",
            id: "field2",
            containerId: "container1",
            dataType: "text",
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        field1: "Value 1",
        // field2 is missing
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([{ "Field 1": "Value 1" }]);
    });
  });

  describe("edge cases", () => {
    it("should handle container with no children", () => {
      const step = {
        container: mockContainer,
        children: [],
      };

      const formData = {};

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([]);
    });

    it("should handle numeric field IDs", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "",
            labelName: "Numeric ID Field",
            itemType: "control",
            icon: "icon",
            required: false,
            category: "text",
            id: 12345,
            containerId: "container1",
            dataType: "text",
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        "12345": "Test Value",
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([{ "Numeric ID Field": "Test Value" }]);
    });

    it("should handle special characters in label names", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "",
            labelName: 'Field with "quotes" & special-chars!',
            itemType: "control",
            icon: "icon",
            required: false,
            category: "text",
            id: "field1",
            containerId: "container1",
            dataType: "text",
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        field1: "Test Value",
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([
        { 'Field with "quotes" & special-chars!': "Test Value" },
      ]);
    });

    it("should preserve the value 0 as valid", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "text-field",
            displayText: "Text Field",
            description: "",
            labelName: "Numeric Field",
            itemType: "control",
            icon: "icon",
            required: false,
            category: "text",
            id: "field1",
            containerId: "container1",
            dataType: "number",
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        field1: 0,
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([{ "Numeric Field": 0 }]);
    });

    it("should preserve boolean false as valid", () => {
      const step = {
        container: mockContainer,
        children: [
          {
            controlName: "checkbox",
            displayText: "Checkbox",
            description: "",
            labelName: "Accept Terms",
            itemType: "control",
            icon: "icon",
            required: false,
            category: "selection",
            id: "field1",
            containerId: "container1",
          },
        ] as FormLayoutComponentChildrenType[],
      };

      const formData = {
        field1: false,
      };

      const result = processContainerResponses(step, formData);

      expect(result).toEqual([{ "Accept Terms": false }]);
    });
  });
});
