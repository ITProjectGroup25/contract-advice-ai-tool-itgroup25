import {
  FormLayoutComponentContainerType,
  FormLayoutComponentChildrenType,
} from "@/app/forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";
import { retrieveVisibleSteps } from "./retrieveVisibleSteps";

describe("retrieveVisibleSteps", () => {
  const visibleContainer: FormLayoutComponentContainerType = {
    controlName: "step-1",
    displayText: "Step 1",
    itemType: "container",
    icon: "fa fa-building",
    heading: "Visible Step",
    subHeading: "This step should be visible",
    id: "c1",
    alwaysVisible: true,
  };

  const hiddenContainer: FormLayoutComponentContainerType = {
    controlName: "step-2",
    displayText: "Step 2",
    itemType: "container",
    icon: "fa fa-building",
    heading: "Hidden Step",
    subHeading: "This step should NOT be visible",
    id: "c2",
    alwaysVisible: false,
  };

  const children: FormLayoutComponentChildrenType[] = [];

  const mockForm = {
    formTemplate: {
      formName: "Test Form",
      id: 123,
      formLayoutComponents: [
        { container: visibleContainer, children },
        { container: hiddenContainer, children },
      ],
    },
  };

  it("keeps only containers with alwaysVisible = true", () => {
    const result = retrieveVisibleSteps(mockForm);
    expect(result).toHaveLength(1);
    expect(result[0].container.id).toBe("c1");
  });

  it("returns empty array if no containers are alwaysVisible", () => {
    const form = {
      formTemplate: {
        ...mockForm.formTemplate,
        formLayoutComponents: mockForm.formTemplate.formLayoutComponents.map(
          (c) => ({
            ...c,
            container: { ...c.container, alwaysVisible: false },
          })
        ),
      },
    };

    const result = retrieveVisibleSteps(form);
    expect(result).toHaveLength(0);
  });

  it("returns all containers if all are alwaysVisible", () => {
    const form = {
      formTemplate: {
        ...mockForm.formTemplate,
        formLayoutComponents: mockForm.formTemplate.formLayoutComponents.map(
          (c) => ({
            ...c,
            container: { ...c.container, alwaysVisible: true },
          })
        ),
      },
    };

    const result = retrieveVisibleSteps(form);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.container.id)).toEqual(["c1", "c2"]);
  });
});
