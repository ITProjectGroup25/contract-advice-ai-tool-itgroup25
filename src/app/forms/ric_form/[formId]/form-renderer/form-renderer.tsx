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

  const handleFieldChange = (fieldId: string, value: any, field: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    
    const optionValueThatMakesVisible = field.items.find(
      (item: { id: string }) => item.id === field.optionThatMakesVisible
    ).value;

    console.log({ optionValueThatMakesVisible });
  };

  // Step Renderer Function

  const renderStep = (
    container: FormLayoutComponentContainerType,
    children: FormLayoutComponentChildrenType[],
    isVisible: boolean
  ) => {
    if (!isVisible) return null;

    return (
      <Card className="border border-gray-200 bg-white w-full">
        <CardContent className="flex flex-col items-start p-6 w-full">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className=" text-lg font-medium text-gray-900">
              {container.heading}
            </h2>
          </div>

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
