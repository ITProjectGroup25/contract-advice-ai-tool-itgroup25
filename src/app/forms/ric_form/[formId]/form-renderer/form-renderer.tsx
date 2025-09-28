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
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">
              {container.heading}
            </h2>
          </div>

          {container.subHeading ? (
            <p className="text-sm text-gray-600 mb-6">{container.subHeading}</p>
          ) : null}

          {children.map((field) => (
            <Box key={field.id}>
              {renderField(field, formData[field.id], (value) =>
                // @ts-ignore
                handleFieldChange(field.id, value)
              )}
            </Box>
          ))}
        </CardContent>
      </Card>
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
