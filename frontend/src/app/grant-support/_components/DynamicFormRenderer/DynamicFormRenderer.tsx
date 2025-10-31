"use client";

import { uploadFile } from "@/app/actions/uploadFile/uploadFile";
import { Clock, FileText, HelpCircle, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { GrantSupportSubmissionResponse, createGrantSupportSubmission } from "../../_utils/api";
import { EmailData, GrantTeamEmailData, emailService } from "../../_utils/emailService";
import FixedLogo from "../FixedLogo";
import { FormSectionsType } from "../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import renderField from "./renderField";

interface DynamicFormRendererProps {
  sections: FormSectionsType;
  onSimpleQuerySuccess?: (submissionId?: string) => void;
  onComplexQuerySuccess?: () => void;
  title: string;
}

interface FormData {
  [key: string]: any;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  data: string;
}

const generateSubmissionId = () =>
  `submission_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

const isUploadedFileArray = (value: unknown): value is UploadedFile[] => {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "name" in item &&
        "size" in item &&
        "type" in item &&
        "data" in item
    )
  );
};

export function DynamicFormRenderer({
  sections,
  onSimpleQuerySuccess,
  onComplexQuerySuccess,
  title,
}: DynamicFormRendererProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: File[];
  }>({});

  // Initialize visible sections with only alwaysVisible sections
  const [visibleSections, setVisibleSections] = useState<typeof sections>(() => {
    return sections.filter((section) => section.container.alwaysVisible);
  });

  const formValues = watch();

  // Helper function to check if a section should be visible based on form values

  const shouldSectionBeVisible = useCallback(
    (section: (typeof sections)[0]): boolean => {
      // Always visible sections
      if (section.container.alwaysVisible) return true;

      // Check visibility condition
      const condition = section.container.visibilityCondition;
      if (!condition) return false;

      // Find the field that controls this section's visibility
      const controllingField = sections
        .flatMap((s) => s.children)
        .find((child) => child.id.toString() === condition.fieldId);

      if (!controllingField) return false;

      // Get the current value of the controlling field
      const currentFieldValue = formValues[controllingField.labelName];

      // Find the option that should trigger visibility
      const triggerOption = controllingField.items?.find((item) => item.id === condition.optionId);

      if (!triggerOption) return false;

      // Check if current value matches the trigger
      // Handle both single values (radio) and arrays (checkbox)
      if (Array.isArray(currentFieldValue)) {
        return currentFieldValue.includes(triggerOption.label);
      }

      return currentFieldValue === triggerOption.label;
    },
    [sections, formValues]
  );

  // Update visible sections whenever form values change
  useEffect(() => {
    const newVisibleSections = sections.filter((section) => shouldSectionBeVisible(section));
    setVisibleSections(newVisibleSections);
  }, [formValues, sections, shouldSectionBeVisible]);

  const handleFieldChange = (fieldId: string, selectedValue: any, field: any) => {
    setValue(fieldId, selectedValue);

    // The useEffect above will automatically handle section visibility
    // based on the new form values
  };

  const handleFileChange = (fieldId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setUploadedFiles((prev) => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), ...fileArray],
    }));

    setValue(fieldId, [...(uploadedFiles[fieldId] || []), ...fileArray]);
  };

  const handleRemoveFile = (fieldId: string, fileIndex: number) => {
    setUploadedFiles((prev) => {
      const updatedFiles = [...(prev[fieldId] || [])];
      updatedFiles.splice(fileIndex, 1);
      return {
        ...prev,
        [fieldId]: updatedFiles,
      };
    });

    const updatedFiles = [...(uploadedFiles[fieldId] || [])];
    updatedFiles.splice(fileIndex, 1);
    setValue(fieldId, updatedFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Testing");
      console.log({ sections });

      const queryType = z
        .enum(["simple", "complex"])
        .parse(z.string().parse(data["Query Type"]).toLowerCase());

      console.log("Hi");
      console.log({ data });
      console.log({ queryType });

      // Process files first - upload to Supabase
      const processedData: Record<string, any> = {};

      for (const [fieldName, value] of Object.entries(data)) {
        // Check if the value is in the uploadedFiles (File objects)
        if (uploadedFiles[fieldName] && uploadedFiles[fieldName].length > 0) {
          // Upload each file to Supabase
          const uploadedFileLinks = await Promise.all(
            uploadedFiles[fieldName].map(async (file) => {
              const formDataToUpload = new FormData();
              formDataToUpload.append("file", file);

              const uploadResult = await uploadFile({
                formData: formDataToUpload,
              });

              if (uploadResult.message === "success") {
                return uploadResult.data;
              } else {
                throw new Error(`Failed to upload file: ${uploadResult.error}`);
              }
            })
          );

          // Replace file objects with uploaded file data (URLs)
          processedData[fieldName] = uploadedFileLinks;
        } else {
          // Not a file field, just copy the value
          processedData[fieldName] = value;
        }
      }

      console.log({ processedData });

      const submissionResponse: GrantSupportSubmissionResponse = await createGrantSupportSubmission(
        {
          formData: processedData,
          queryType,
          userEmail: (processedData["Your Email"] as string) || undefined,
          userName: (processedData["Your Name"] as string) || undefined,
          status: "submitted",
        }
      );

      const submissionId = submissionResponse.submissionUid;

      // Send confirmation email to user
      const userEmail = processedData["Your Email"] as string;
      const userName = processedData["Your Name"] as string;

      if (userEmail && userName) {
        const emailData: EmailData = {
          userEmail,
          userName,
          submissionId,
          queryType,
          timestamp: new Date().toISOString(),
        };

        try {
          console.log("📧 FORM: Sending USER CONFIRMATION email to:", userEmail);
          const emailSent = await emailService.sendConfirmationEmail(emailData);
          if (emailSent) {
            console.log("✅ FORM: User confirmation email sent successfully to:", userEmail);
          } else {
            console.warn("⚠️ FORM: Failed to send user confirmation email");
          }
        } catch (emailError) {
          console.error("❌ FORM: User confirmation email service error:", emailError);
        }
      }

      if (queryType === "simple") {
        toast.success("Simple query submitted successfully! Check your email for confirmation.");
        setTimeout(() => {
          onSimpleQuerySuccess?.(submissionId);
        }, 1000);
      } else {
        if (userEmail && userName) {
          const grantTeamEmailData: GrantTeamEmailData = {
            submissionId,
            queryType: "complex",
            userEmail,
            userName,
            timestamp: new Date().toISOString(),
            formData: processedData,
          };

          try {
            console.log(
              "📧 FORM: Sending GRANT TEAM NOTIFICATION for complex query:",
              submissionId
            );
            const grantEmailSent = await emailService.sendGrantTeamNotification(grantTeamEmailData);
            if (grantEmailSent) {
              console.log(
                "✅ FORM: Grant team notification sent successfully for complex query:",
                submissionId
              );
            } else {
              console.warn("⚠️ FORM: Failed to send grant team notification");
            }
          } catch (grantEmailError) {
            console.error("❌ FORM: Grant team notification error:", grantEmailError);
          }
        }

        toast.success(
          "Complex referral submitted successfully! Check your email for confirmation."
        );
        setTimeout(() => {
          onComplexQuerySuccess?.();
        }, 1000);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit referral request. Please try again."
      );
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const getIconForSection = (icon: string) => {
    const iconMap: {
      [key: string]: React.ComponentType<{ className?: string }>;
    } = {
      "fa fa-user": Users,
      "fa fa-building": FileText,
      "fa fa-question-circle": HelpCircle,
      "fas fa-file-alt": FileText,
      "fas fa-clock": Clock,
    };
    return iconMap[icon] || FileText;
  };

  return (
    <>
      <FixedLogo />

      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-5xl font-bold">{title}</h1>
          <p className="text-l">Please complete this form to submit your referral request</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {visibleSections.map((section) => {
            const IconComponent = getIconForSection(section.container.icon);

            return (
              <Card key={section.container.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    {section.container.heading}
                  </CardTitle>
                  {section.container.subHeading && (
                    <CardDescription>{section.container.subHeading}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.children.map((child) =>
                    renderField({
                      child,
                      formValues,
                      register,
                      control,
                      errors,
                      handleFieldChange,
                      uploadedFiles,
                      handleFileChange,
                      handleRemoveFile,
                    })
                  )}
                </CardContent>
              </Card>
            );
          })}

          <Separator />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="border border-white bg-green-700 px-4 py-2 text-white hover:bg-green-600"
            >
              {isSubmitting ? "Submitting..." : "Submit Referral Request"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
