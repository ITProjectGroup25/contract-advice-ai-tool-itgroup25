import { FileText, Upload, X } from "lucide-react";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface RenderFieldProps {
  child: any;
  formValues: any;
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  handleFieldChange: (fieldName: string, value: any, field: any) => void;
  uploadedFiles: { [key: string]: File[] };
  handleFileChange: (fieldName: string, files: FileList | null) => void;
  handleRemoveFile: (fieldName: string, fileIndex: number) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const renderDescription = (description?: string) => {
  if (!description) return null;

  const urlPattern = /((?:https?:)?\/\/[^\s)]+|\/[^\s)]+)/g;
  const parts = description.split(urlPattern);

  return (
    <div className="text-muted-foreground mb-2 text-sm">
      {parts.map((part, index) => {
        if (urlPattern.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline"
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

const getValidationRules = (child: any, uploadedFiles: { [key: string]: File[] }) => {
  const rules: any = {};
  if (child.required) {
    if (child.controlName === "checklist") {
      rules.validate = (value: any) =>
        value && value.length > 0 ? true : `${child.labelName} is required`;
    } else if (child.controlName === "file-upload") {
      rules.validate = () =>
        uploadedFiles[child.labelName] && uploadedFiles[child.labelName].length > 0
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

export const renderField = ({
  child,
  formValues,
  register,
  control,
  errors,
  handleFieldChange,
  uploadedFiles,
  handleFileChange,
  handleRemoveFile,
}: RenderFieldProps) => {
  // Use labelName as the field name instead of id
  const fieldName = child.labelName;
  const validationRules = getValidationRules(child, uploadedFiles);

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
              <span className="text-muted-foreground text-sm">
                {uploadedFiles[fieldName]?.length || 0} file(s) selected
              </span>
            </div>

            {/* Display uploaded files */}
            {uploadedFiles[fieldName] && uploadedFiles[fieldName].length > 0 && (
              <div className="space-y-2">
                {uploadedFiles[fieldName].map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border bg-gray-50 p-3"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0 text-gray-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
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
            <p className="text-destructive text-sm">{errors[fieldName]?.message as string}</p>
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
            rules={validationRules}
            render={({ field: { value = [] } }) => (
              <div className="space-y-3">
                {child.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${fieldName}-${item.id}`}
                      checked={value.includes(item.label)} // store label instead of value
                      onCheckedChange={(checked) => {
                        const updatedValues = checked
                          ? [...value, item.label] // push label
                          : value.filter((v: string) => v !== item.label); // remove label
                        handleFieldChange(fieldName, updatedValues, child);
                      }}
                    />
                    <Label htmlFor={`${fieldName}-${item.id}`}>{item.label}</Label>
                  </div>
                ))}
              </div>
            )}
          />
          {errors[fieldName] && (
            <p className="text-destructive text-sm">{errors[fieldName]?.message as string}</p>
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
            {...register(fieldName, validationRules)}
            placeholder={child.placeholder}
            onChange={(e) => handleFieldChange(fieldName, e.target.value, child)}
          />
          {errors[fieldName] && (
            <p className="text-destructive text-sm">{errors[fieldName]?.message as string}</p>
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
            {...register(fieldName, validationRules)}
            placeholder={child.placeholder}
            rows={child.rows || 4}
            onChange={(e) => handleFieldChange(fieldName, e.target.value, child)}
          />
          {errors[fieldName] && (
            <p className="text-destructive text-sm">{errors[fieldName]?.message as string}</p>
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
            rules={validationRules}
            render={({ field: { value } }) => (
              <div className="space-y-3">
                {child.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`${fieldName}-${item.id}`}
                      checked={value === item.label}
                      onChange={() => {
                        handleFieldChange(fieldName, item.label, child);
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`${fieldName}-${item.id}`} className="cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          />
          {errors[fieldName] && (
            <p className="text-destructive text-sm">{errors[fieldName]?.message as string}</p>
          )}
        </div>
      );

    case "date-field":
      return (
        <div key={child.id} className="space-y-2">
          <Label htmlFor={fieldName}>
            {child.labelName} {child.required && "*"}
          </Label>
          {renderDescription(child.description)}
          <Input
            id={fieldName}
            type="date"
            {...register(fieldName, validationRules)}
            placeholder={child.placeholder}
            onChange={(e) => handleFieldChange(fieldName, e.target.value, child)}
            className="block w-full"
          />
          {errors[fieldName] && (
            <p className="text-destructive text-sm">{errors[fieldName]?.message as string}</p>
          )}
        </div>
      );
    default:
      return null;
  }
};

export default renderField;
