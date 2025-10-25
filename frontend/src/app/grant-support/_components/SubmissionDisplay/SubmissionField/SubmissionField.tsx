import { Download } from "lucide-react";
import z from "zod";
import { FieldValue, FileUpload, FileUploadSchema } from "../../types";
import { formatDashDelimitedString } from "../formatDashDelimitedString/formatDashDelimitedString";

const isFileUpload = (value: any): value is FileUpload => {
  return z.array(FileUploadSchema).safeParse(value).success;
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
  if (Array.isArray(value)) {
    console.log({ value });
    console.log({ value, isFileUpload: isFileUpload(value) });
  }

  if (isFileUpload(value)) {
    const file = value[0];
    const parsedFile = FileUploadSchema.parse(file);
    return (
      <a
        href={parsedFile.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800 hover:underline"
      >
        <Download className="h-4 w-4" />
        <span className="font-medium">{parsedFile.fileName}</span>
        <span className="text-xs text-gray-500">({formatFileSize(parsedFile.fileSize)})</span>
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
      <p className="text-muted-foreground text-sm font-medium">{fieldKey}</p>
      <p className="text-sm">{renderValue(value)}</p>
    </div>
  );
};

export default SubmissionField;
