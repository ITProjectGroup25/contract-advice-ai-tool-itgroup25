"use client";
// FormParser.tsx - Complete form parsing system with array-based visibility
import { uploadFormResults } from "@/app/actions/uploadFormResults";
import {
  FormLayoutComponentChildrenType,
  FormLayoutComponentContainerType,
} from "@/app/forms/edit/[formId]/form-builder-components/types/FormTemplateTypes";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { CheckCircle, Loader2, User } from "lucide-react";
import React, { useState, useTransition } from "react";
import sendEmail from "../emailjs";
import processContainerResponses from "../helpers/processContainerResponses";
import ContactDetailsCard from "./contact-container";
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
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const initialVisibleSteps = retrieveVisibleSteps({ formTemplate });

  console.log({ initialVisibleSteps });

  const [visibleSteps, setVisibleSteps] = useState<
    Array<{
      container: FormLayoutComponentContainerType;
      children: FormLayoutComponentChildrenType[];
    }>
  >(initialVisibleSteps);

  const handleSubmit = () => {
    startTransition(async () => {
      // Collate form results by container
      const collatedResults: Record<string, any[]> = {};

      // Iterate through each visible step/container
      visibleSteps.forEach((step) => {
        const containerName = step.container.heading;
        const containerResponses = processContainerResponses(step, formData);

        console.log({ containerResponses });

        // Only add container if it has responses
        if (containerResponses.length > 0) {
          collatedResults[containerName] = containerResponses;
        }
      });

      // Add contact details as a separate container
      collatedResults["Contact Details"] = [
        { Name: contactName },
        { Email: contactEmail },
      ];

      const submissionData = {
        formId: formTemplate.id,
        formName: formTemplate.formName,
        submittedAt: new Date().toISOString(),
        responses: collatedResults,
      };

      console.log("Form submitted:", submissionData);

      try {
        // Send email first
        await sendEmail({ data: submissionData });
        console.log("Email sent successfully");

        // Only save to database if email succeeds
        const result = await uploadFormResults(submissionData);

        if (result.message === "success") {
          console.log("Form results saved with ID:", result.data?.id);
          setIsConfirmed(true);

          // Reset confirmed state after 3 seconds
          setTimeout(() => setIsConfirmed(false), 3000);
        } else {
          throw new Error(result.error || "Failed to save results");
        }

        if (onSubmit) {
          onSubmit(submissionData);
        }
      } catch (error) {
        console.error("Form submission failed:", error);
        // TODO: Show error message to user
      }
    });
  };

  const handleFieldChange = (
    fieldId: string,
    selectedValue: any,
    field: any
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: selectedValue }));

    // Check if this field has conditional visibility logic
    if (
      field.containersToMakeVisible &&
      field.containersToMakeVisible.length > 0
    ) {
      // Process all visibility mappings for this field
      field.containersToMakeVisible.forEach(
        (mapping: {
          containerToMakeVisible: string;
          optionThatMakesVisible: string;
        }) => {
          // Find the option value that corresponds to this mapping's ID
          const optionThatMakesVisible = field.items?.find(
            (item: { id: string }) => item.id === mapping.optionThatMakesVisible
          );

          if (!optionThatMakesVisible) {
            console.warn(
              `Option with ID ${mapping.optionThatMakesVisible} not found in field items`
            );
            return;
          }

          const optionValueThatMakesVisible = optionThatMakesVisible.value;
          const containerIdToMakeVisible = mapping.containerToMakeVisible;

          // Find the container that should be shown/hidden
          const containerToMakeVisible = formTemplate.formLayoutComponents.find(
            (comp) => comp.container.id === containerIdToMakeVisible
          );

          if (!containerToMakeVisible) {
            console.warn(
              `Container with ID ${containerIdToMakeVisible} not found`
            );
            return;
          }

          // Find the index to insert the container at the correct position
          const containerToMakeVisibleIdx =
            formTemplate.formLayoutComponents.findIndex(
              (comp) => comp.container.id === containerIdToMakeVisible
            );

          console.log({
            selectedValue,
            optionValueThatMakesVisible,
            containerIdToMakeVisible,
            containerToMakeVisibleIdx,
          });

          // If the selected value matches the visibility trigger for this mapping
          if (selectedValue === optionValueThatMakesVisible) {
            setVisibleSteps((prevSteps) => {
              // Check if already visible
              const alreadyVisible = prevSteps.some(
                (step) => step.container.id === containerIdToMakeVisible
              );

              if (alreadyVisible) {
                return prevSteps;
              }

              // Insert the container at the correct position
              const newSteps = [...prevSteps];
              newSteps.splice(
                containerToMakeVisibleIdx,
                0,
                containerToMakeVisible
              );

              return newSteps;
            });
          } else {
            // Different option selected - hide this specific container if it's not always visible
            if (!containerToMakeVisible.container.alwaysVisible) {
              setVisibleSteps((prevSteps) =>
                prevSteps.filter(
                  (step) => step.container.id !== containerIdToMakeVisible
                )
              );
            }
          }
        }
      );
    }
  };

  // Step Renderer Function
  const renderStep = (
    container: FormLayoutComponentContainerType,
    children: FormLayoutComponentChildrenType[],
    index: number
  ) => {
    return (
      <Card
        key={container.id}
        className="border border-gray-200 bg-white w-full mb-4"
      >
        <CardContent className="flex flex-col items-start p-6 w-full space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">
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
            className="text-black bg-gray-200 px-4 py-2 rounded mb-4"
            onClick={() =>
              console.log({ visibleSteps, formData, contactName, contactEmail })
            }
          >
            Debug: Log State
          </button>

          {/* Render visible steps */}
          {visibleSteps.map((step, index) =>
            renderStep(step.container, step.children, index)
          )}

          <ContactDetailsCard
            contactName={contactName}
            contactEmail={contactEmail}
            onNameChange={setContactName}
            onEmailChange={setContactEmail}
          />

          {/* Submit Button with Loading and Confirmed States */}
          <div className="w-full flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={isPending || isConfirmed}
              className={`px-8 py-3 font-medium text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 ${
                isConfirmed
                  ? "bg-green-600 text-white cursor-default"
                  : isPending
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : isConfirmed ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Submitted!
                </>
              ) : (
                "Submit Form"
              )}
            </button>
          </div>

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

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Visible Steps (Debug):
            </Typography>
            <pre style={{ fontSize: "12px", overflow: "auto" }}>
              {JSON.stringify(
                visibleSteps.map((s) => ({
                  id: s.container.id,
                  heading: s.container.heading,
                  alwaysVisible: s.container.alwaysVisible,
                })),
                null,
                2
              )}
            </pre>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Contact Details (Debug):
            </Typography>
            <pre style={{ fontSize: "12px", overflow: "auto" }}>
              {JSON.stringify({ contactName, contactEmail }, null, 2)}
            </pre>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default FormParser;
