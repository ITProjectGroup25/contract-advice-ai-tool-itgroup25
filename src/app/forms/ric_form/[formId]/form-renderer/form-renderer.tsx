"use client";
// FormParser.tsx - Complete form parsing system in one file
import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
} from "@/app/forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";
import { Box, Button, Paper, Typography } from "@mui/material";
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

  const isLastStep =
    currentStep === formTemplate.formLayoutComponents.length - 1;
  const isFirstStep = currentStep === 0;

  // Filter visible steps
  const visibleSteps = formTemplate.formLayoutComponents.filter(
    (step) =>
      step.container.alwaysVisible ||
      currentStep === formTemplate.formLayoutComponents.indexOf(step)
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 800, mx: "auto", p: 3 }}
    >
      <Typography variant="h4" gutterBottom>
        {formTemplate.formName}
      </Typography>

      {/* Render visible steps */}
      {visibleSteps.map((step, index) =>
        renderStep(
          step.container,
          step.children,
          step.container.alwaysVisible || index === 0
        )
      )}

      {/* Navigation buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          Previous
        </Button>

        {isLastStep ? (
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>

      {/* Debug info - remove in production */}
      <Box sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Form Data (Debug):
        </Typography>
        <pre style={{ fontSize: "12px", overflow: "auto" }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </Box>
    </Box>
  );
};

export default FormParser;
