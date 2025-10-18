"use client";

import { Clock, FileText, HelpCircle, Upload, Users, X } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  GrantSupportSubmissionResponse,
  createGrantSupportSubmission,
} from "../_utils/api";
import {
  EmailData,
  GrantTeamEmailData,
  emailService,
} from "../_utils/emailService";
import FixedLogo from "./FixedLogo";
import { FormSectionsType } from "./types";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

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

  const [otherFields, setOtherFields] = useState<{ [key: string]: boolean }>(
    {}
  );

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

      // Determine queryType from the form data
      const queryTypeField = sections
        .flatMap((s) => s.children)
        .find((c) => c.labelName === "Query Type");

      const queryType = queryTypeField
        ? (data[queryTypeField.id]?.toLowerCase() as "simple" | "complex")
        : "simple";

      console.log("Hi");
      console.log({ data });
      console.log({ queryType });

      // Process uploaded files - convert to base64 or handle as needed
      const processedData = { ...data };
      for (const [fieldId, files] of Object.entries(uploadedFiles)) {
        if (files && files.length > 0) {
          // Convert files to a format suitable for your backend
          const fileData = await Promise.all(
            files.map(async (file) => ({
              name: file.name,
              size: file.size,
              type: file.type,
              // You might want to convert to base64 or upload to storage
              data: await fileToBase64(file),
            }))
          );
          processedData[fieldId] = fileData;
        }
      }

      const submissionResponse: GrantSupportSubmissionResponse =
        await createGrantSupportSubmission({
          formData: processedData,
          queryType,
          userEmail: (data.email as string) || undefined,
          userName: (data.name as string) || undefined,
          status: "submitted",
        });

      const submissionId = submissionResponse.submissionUid;

      // Send confirmation email to user
      const userEmail = data.email as string;
      const userName = data.name as string;

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

  const renderField = (child: any) => {
    const fieldName = child.id;
    const currentValue = formValues[fieldName];

    const getValidationRules = () => {
      const rules: any = {};
      if (child.required) {
        if (child.controlName === "checklist") {
          rules.validate = (value: any) =>
            value && value.length > 0 ? true : `${child.labelName} is required`;
        } else if (child.controlName === "file-upload") {
          rules.validate = () =>
            uploadedFiles[fieldName] && uploadedFiles[fieldName].length > 0
              ? true
              : `${child.labelName} is required`;
        } else {
          rules.required = `${child.labelName} is required`;
        }
      }

      if (child.dataType === "email") {
        rules.pattern = {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Invalid email address",
        };
      }

      return rules;
    };

    const renderDescription = (description?: string) => {
      if (!description) return null;

      const urlPattern = /((?:https?:)?\/\/[^\s)]+|\/[^\s)]+)/g;
      const parts = description.split(urlPattern);

      return (
        <div className="text-sm text-muted-foreground mb-2">
          {parts.map((part, index) => {
            if (urlPattern.test(part)) {
              return (
                <a
                  key={index}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                >
                  {part}
                </a>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      );
    };

    switch (child.controlName) {
      case "file-upload":
        return (
          <div key={child.id} className="space-y-3">
            <Label htmlFor={fieldName}>
              {child.labelName} {child.required && "*"}
            </Label>
            {renderDescription(child.description)}

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Input
                  id={fieldName}
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(fieldName, e.target.files)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById(fieldName)?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose Files
                </Button>
                <span className="text-sm text-muted-foreground">
                  {uploadedFiles[fieldName]?.length || 0} file(s) selected
                </span>
              </div>

              {/* Display uploaded files */}
              {uploadedFiles[fieldName] &&
                uploadedFiles[fieldName].length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles[fieldName].map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(fieldName, index)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case "checklist":
        return (
          <div key={child.id} className="space-y-3">
            <Label>
              {child.labelName} {child.required && "*"}
            </Label>
            {renderDescription(child.description)}
            <Controller
              name={fieldName}
              control={control}
              rules={getValidationRules()}
              render={({ field: { value = [] } }) => (
                <div className="space-y-3">
                  {child.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${fieldName}-${item.id}`}
                        checked={value.includes(item.value)}
                        onCheckedChange={(checked) => {
                          const updatedValues = checked
                            ? [...value, item.value]
                            : value.filter((v: string) => v !== item.value);
                          handleFieldChange(fieldName, updatedValues, child);
                        }}
                      />
                      <Label htmlFor={`${fieldName}-${item.id}`}>
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case "text-field":
        return (
          <div key={child.id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {child.labelName} {child.required && "*"}
            </Label>
            {renderDescription(child.description)}
            <Input
              id={fieldName}
              type={child.dataType || "text"}
              {...register(fieldName, getValidationRules())}
              placeholder={child.placeholder}
              onChange={(e) =>
                handleFieldChange(fieldName, e.target.value, child)
              }
            />
            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case "multiline-text-field":
        return (
          <div key={child.id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {child.labelName} {child.required && "*"}
            </Label>
            {renderDescription(child.description)}
            <Textarea
              id={fieldName}
              {...register(fieldName, getValidationRules())}
              placeholder={child.placeholder}
              rows={child.rows || 4}
              onChange={(e) =>
                handleFieldChange(fieldName, e.target.value, child)
              }
            />
            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      case "radio-group":
        return (
          <div key={child.id} className="space-y-3">
            <Label>
              {child.labelName} {child.required && "*"}
            </Label>
            {renderDescription(child.description)}
            <Controller
              name={fieldName}
              control={control}
              rules={getValidationRules()}
              render={({ field: { value, onChange } }) => (
                <div className="space-y-3">
                  {child.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${fieldName}-${item.id}`}
                        checked={value === item.value}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFieldChange(fieldName, item.value, child);
                          }
                        }}
                      />
                      <Label htmlFor={`${fieldName}-${item.id}`}>
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors[fieldName] && (
              <p className="text-sm text-destructive">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
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
                  {section.children.map((child) => renderField(child))}
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
