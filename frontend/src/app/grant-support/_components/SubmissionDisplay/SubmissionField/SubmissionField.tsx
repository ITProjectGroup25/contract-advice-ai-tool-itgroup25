import { Download } from "lucide-react";
import z from "zod";
import { FieldValue, FileUpload, FileUploadSchema } from "../../types";
import { formatDashDelimitedString } from "../formatDashDelimitedString/formatDashDelimitedString";

const isFileUpload = (value: any): value is FileUpload => {
  return FileUploadSchema.safeParse(value).success;
};

const isListOfStrings = (value: any): value is string[] => {
  return z.array(z.string()).safeParse(value).success;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const renderValue = (value: FieldValue) => {
  if (isFileUpload(value)) {
    return (
      <a
        href={value.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="font-medium">{value.fileName}</span>
        <span className="text-xs text-gray-500">
          ({formatFileSize(value.fileSize)})
        </span>
      </a>
    );
  }

  if (isListOfStrings(value)) {
    return value.map(formatDashDelimitedString).join(", ");
  }

  return formatDashDelimitedString(String(value));
};

type Props = {
  fieldKey: string;
  value: FieldValue;
};

const SubmissionField = ({ fieldKey, value }: Props) => {
  return (
    <div className="border-b pb-2">
      <p className="text-sm font-medium text-muted-foreground">{fieldKey}</p>
      <p className="text-sm">{renderValue(value)}</p>
    </div>
  );
};

export default SubmissionField;
