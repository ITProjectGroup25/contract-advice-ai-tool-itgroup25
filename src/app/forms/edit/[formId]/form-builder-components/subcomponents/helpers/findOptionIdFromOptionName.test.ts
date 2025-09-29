import { TemplateType } from "../../types/FormTemplateTypes";
import findOptionIdFromOptionName from "./findOptionIdFromOptionName";

describe("findOptionIdFromOptionName", () => {
  it("should return the correct option id when given optionName = 'Button 2'", () => {
    const formTemplate: TemplateType = {
      formName: "Form 1",
      id: 30,
      createdAt: new Date("2025-09-29T00:16:17.000Z"),
      formLayoutComponents: [
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading",
            subHeading: "Container SubHeading",
            id: "y0o5880z2eci2s7yijwkns",
            alwaysVisible: false,
            selectedControlOption: "Button 2",
            selectedControlHeading: "Label for Radio",
          },
          children: [
            {
              controlName: "text-field",
              displayText: "Text Field",
              description: "Some Description about the field",
              labelName: "Text Field",
              itemType: "control",
              icon: "fas fa-text-height",
              required: false,
              category: "text-elements",
              id: "3gfvkxypahots1w6vnh3c",
              containerId: "y0o5880z2eci2s7yijwkns",
              placeholder: "Placeholder for Text Field",
              dataType: "text",
            },
          ],
        },
        {
          container: {
            controlName: "step-container",
            displayText: "Workflow Step",
            itemType: "container",
            icon: "fa fa-building",
            heading: "Container Heading",
            subHeading: "Container SubHeading",
            id: "31qp5s8fl2h5sy3j7oiqq6",
            alwaysVisible: true,
          },
          children: [
            {
              controlName: "radio-group",
              displayText: "Radio",
              description: "Some Description about the field",
              labelName: "Label for Radio",
              itemType: "control",
              icon: "far fa-dot-circle",
              required: false,
              items: [
                {
                  id: "d4qnuo0veeqr811q63w8mo",
                  value: "Button__-1",
                  label: "Button 1",
                },
                {
                  id: "xgkcmvr8w7envth4ys5jb",
                  value: "Button__-2",
                  label: "Button 2",
                },
              ],
              category: "other-elements",
              id: "c02sgngsgoois98p5dnzlc",
              containerId: "31qp5s8fl2h5sy3j7oiqq6",
              containerToMakeVisible: "y0o5880z2eci2s7yijwkns",
              optionThatMakesVisible: "Button 2",
            },
          ],
        },
      ],
      publishHistory: [],
      creator: "",
    };

    const result = findOptionIdFromOptionName({
      optionName: "Button 2",
      formTemplate,
    });

    expect(result).toBe("xgkcmvr8w7envth4ys5jb");
  });
});
