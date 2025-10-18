"use client";

import { uploadFile } from "@/app/actions/uploadFile/uploadFile";
import { Clock, FileText, HelpCircle, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  GrantSupportSubmissionResponse,
  createGrantSupportSubmission,
} from "../../_utils/api";
import {
  EmailData,
  GrantTeamEmailData,
  emailService,
} from "../../_utils/emailService";
import FixedLogo from "../FixedLogo";
import { FormSectionsType } from "../types";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
  const [visibleSections, setVisibleSections] = useState<typeof sections>(
    () => {
      return sections.filter((section) => section.container.alwaysVisible);
    }
  );

  const formValues = watch();

  const handleFieldChange = (
    fieldId: string,
    selectedValue: any,
    field: any
  ) => {
    setValue(fieldId, selectedValue);

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
          const containerToMakeVisible = sections.find(
            (comp) => comp.container.id === containerIdToMakeVisible
          );

          if (!containerToMakeVisible) {
            console.warn(
              `Container with ID ${containerIdToMakeVisible} not found`
            );
            return;
          }

          // Find the index to insert the container at the correct position
          const containerToMakeVisibleIdx = sections.findIndex(
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
            setVisibleSections((prevSections) => {
              // Check if already visible
              const alreadyVisible = prevSections.some(
                (section) => section.container.id === containerIdToMakeVisible
              );

              if (alreadyVisible) {
                return prevSections;
              }

              // Insert the container at the correct position
              const newSections = [...prevSections];
              newSections.splice(
                containerToMakeVisibleIdx,
                0,
                containerToMakeVisible
              );

              return newSections;
            });
          } else {
            // Different option selected - hide this specific container if it's not always visible
            if (!containerToMakeVisible.container.alwaysVisible) {
              setVisibleSections((prevSections) =>
                prevSections.filter(
                  (section) => section.container.id !== containerIdToMakeVisible
                )
              );
            }
          }
        }
      );
    }
  };

  const handleFileChange = (fieldId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setUploadedFiles((prev) => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), ...fileArray],
    }));

    // Also update form data
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

    // Also update form data
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

      const submissionResponse: GrantSupportSubmissionResponse =
        await createGrantSupportSubmission({
          formData: processedData,
          queryType,
          userEmail: (processedData["Your Email"] as string) || undefined,
          userName: (processedData["User's Name"] as string) || undefined,
          status: "submitted",
        });

      const submissionId = submissionResponse.submissionUid;

      // Send confirmation email to user
      const userEmail = processedData["Your Email"] as string;
      const userName = processedData["User's Name"] as string;

      if (userEmail && userName) {
        const emailData: EmailData = {
          userEmail,
          userName,
          submissionId,
          queryType,
          timestamp: new Date().toISOString(),
        };

        try {
          console.log(
            "📧 FORM: Sending USER CONFIRMATION email to:",
            userEmail
          );
          const emailSent = await emailService.sendConfirmationEmail(emailData);
          if (emailSent) {
            console.log(
              "✅ FORM: User confirmation email sent successfully to:",
              userEmail
            );
          } else {
            console.warn("⚠️ FORM: Failed to send user confirmation email");
          }
        } catch (emailError) {
          console.error(
            "❌ FORM: User confirmation email service error:",
            emailError
          );
        }
      }

      if (queryType === "simple") {
        toast.success(
          "Simple query submitted successfully! Check your email for confirmation."
        );
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
            const grantEmailSent = await emailService.sendGrantTeamNotification(
              grantTeamEmailData
            );
            if (grantEmailSent) {
              console.log(
                "✅ FORM: Grant team notification sent successfully for complex query:",
                submissionId
              );
            } else {
              console.warn("⚠️ FORM: Failed to send grant team notification");
            }
          } catch (grantEmailError) {
            console.error(
              "❌ FORM: Grant team notification error:",
              grantEmailError
            );
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
  // Helper function to convert file to base64
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

  console.log({ visibleSections });

  return (
    <>
      <FixedLogo />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold">{title}</h1>
          <p className="text-l">
            Please complete this form to submit your referral request
          </p>
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
                    <CardDescription>
                      {section.container.subHeading}
                    </CardDescription>
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
              className="bg-green-700 border border-white text-white hover:bg-green-600 px-4 py-2"
            >
              {isSubmitting ? "Submitting..." : "Submit Referral Request"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
