"use client";
// FormParser.tsx - Complete form parsing system in one file
import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
} from "@/app/forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";
import { Box, Paper, Typography } from "@mui/material";
import React, { useState } from "react";
import { renderField } from "./control-field-renderer";

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
  const [currentStep, setCurrentStep] = useState(0);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = () => {
    if (currentStep < formTemplate.formLayoutComponents.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  // Field Renderer Function

  // Step Renderer Function
  const renderStep = (
    container: FormLayoutComponentContainerType,
    children: FormLayoutComponentChildrenType[],
    isVisible: boolean
  ) => {
    if (!isVisible) return null;

    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }} key={container.id}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {container.heading}
          </Typography>
          {container.subHeading && (
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {container.subHeading}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {children.map((field) => (
            <Box key={field.id}>
              {renderField(field, formData[field.id], (value) =>
                //   @ts-ignore
                handleFieldChange(field.id, value)
              )}
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  // Filter visible steps
  const visibleSteps = formTemplate.formLayoutComponents.filter(
    (step) =>
      step.container.alwaysVisible ||
      currentStep === formTemplate.formLayoutComponents.indexOf(step)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Referral Request Form
          </h1>
        </div>
      </div>

      <button
        className="text-black"
        onClick={() => console.log({ visibleSteps })}
      >
        Submit
      </button>

      {/* Render visible steps */}
      {visibleSteps.map((step, index) =>
        renderStep(
          step.container,
          step.children,
          step.container.alwaysVisible || index === 0
        )
      )}

      {/* Debug info - remove in production */}
      <Box sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Form Data (Debug):
        </Typography>
        <pre style={{ fontSize: "12px", overflow: "auto" }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </Box>
    </div>
  );
};

export default FormParser;
