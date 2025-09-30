"use client";
// FormParser.tsx - Complete form parsing system in one file
import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
} from "@/app/forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { User } from "lucide-react";
import React, { useState } from "react";
import { renderField } from "./control-field-renderer";
import { retrieveVisibleSteps } from "./retrieveVisibleSteps/retrieveVisibleSteps";

// Main Form Parser Component
interface FormParserProps {
  formTemplate: {
    formName: string;
    id: number;
    formLayoutComponents: Array<{
      container: FormLayoutComponentContainerType;
      children: FormLayoutComponentChildrenType[];
    }>;
  };
  onSubmit?: (formData: Record<string, any>) => void;
}

const FormParser: React.FC<FormParserProps> = ({ formTemplate, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const initialVisibleSteps = retrieveVisibleSteps({ formTemplate });

  console.log({ initialVisibleSteps });

  const [visibleSteps, setVisibleSteps] = useState<
    Array<{
      container: FormLayoutComponentContainerType;
      children: FormLayoutComponentChildrenType[];
    }>
  >(initialVisibleSteps);

  // Track which containers are controlled by which fields
  const [conditionalContainers, setConditionalContainers] = useState<
    Record<string, string>
  >({});

  const handleFieldChange = (
    fieldId: string,
    selectedValue: any,
    field: any
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: selectedValue }));

    // Check if this field has conditional visibility logic
    if (field.containerToMakeVisible && field.optionThatMakesVisible) {
      const optionValueThatMakesVisible = field.items.find(
        (item: { id: string }) => item.id === field.optionThatMakesVisible
      )?.value;

      const containerIdToMakeVisible = field.containerToMakeVisible;

      // If the selected value matches the visibility trigger
      if (selectedValue === optionValueThatMakesVisible) {
        const containerToMakeVisible = formTemplate.formLayoutComponents.find(
          (comp) => comp.container.id === containerIdToMakeVisible
        );

        if (!containerToMakeVisible) return;

        setVisibleSteps((prevSteps) => {
          const alreadyVisible = prevSteps.some(
            (step) => step.container.id === containerToMakeVisible.container.id
          );

          if (alreadyVisible) {
            return prevSteps;
          }

          // Find the correct insertion position based on the original template order
          const newContainerOriginalIndex =
            formTemplate.formLayoutComponents.findIndex(
              (comp) =>
                comp.container.id === containerToMakeVisible.container.id
            );

          // Find where to insert in the visible steps array
          let insertIndex = prevSteps.length; // Default to end

          for (let i = 0; i < prevSteps.length; i++) {
            const currentStepOriginalIndex =
              formTemplate.formLayoutComponents.findIndex(
                (comp) => comp.container.id === prevSteps[i].container.id
              );

            if (currentStepOriginalIndex > newContainerOriginalIndex) {
              insertIndex = i;
              break;
            }
          }

          // Insert at the correct position
          return [
            ...prevSteps.slice(0, insertIndex),
            containerToMakeVisible,
            ...prevSteps.slice(insertIndex),
          ];
        });

        // Track that this container is controlled by this field
        setConditionalContainers((prev) => ({
          ...prev,
          [containerIdToMakeVisible]: fieldId,
        }));
      } else {
        // Different option selected - hide the container if it was previously made visible
        setVisibleSteps((prevSteps) =>
          prevSteps.filter(
            (step) => step.container.id !== containerIdToMakeVisible
          )
        );

        // Remove from conditional containers tracking
        setConditionalContainers((prev) => {
          const newTracking = { ...prev };
          delete newTracking[containerIdToMakeVisible];
          return newTracking;
        });
      }
    }
  };

  // Step Renderer Function
  const renderStep = (
    container: FormLayoutComponentContainerType,
    children: FormLayoutComponentChildrenType[],
    isVisible: boolean
  ) => {
    if (!isVisible) return null;

    return (
      <Card
        key={container.id}
        className="border border-gray-200 bg-white w-full my-4"
      >
        <CardContent className="flex flex-col items-start p-6 w-full">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className=" text-lg font-medium text-gray-900">
              {container.heading}
            </h2>
          </div>

          <button
            onClick={() => {
              console.log({ visibleSteps, conditionalContainers });
            }}
          >
            Click ME
          </button>

          {container.subHeading ? (
            <p className="text-sm text-gray-600 mb-6">{container.subHeading}</p>
          ) : null}

          {children.map((field) => {
            return renderField(
              field,
              formData[field.id],
              // @ts-ignore
              (value) => handleFieldChange(field.id, value, field)
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Referral Request Form
          </h1>

          <button
            className="text-black"
            onClick={() => console.log({ visibleSteps })}
          >
            Submit
          </button>

          {/* Render visible steps */}
          {visibleSteps.map((step, index) =>
            renderStep(step.container, step.children, true)
          )}

          {/* Debug info - remove in production */}
          <Box
            sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}
          >
            <Typography variant="h6" gutterBottom>
              Form Data (Debug):
            </Typography>
            <pre style={{ fontSize: "12px", overflow: "auto" }}>
              {JSON.stringify(formData, null, 2)}
            </pre>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default FormParser;
