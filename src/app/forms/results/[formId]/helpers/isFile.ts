export const isFileUpload = (
  value: any
): value is {
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  fileUrl: string;
} => {
  return (
    typeof value === "object" &&
    value !== null &&
    "fileName" in value &&
    "fileUrl" in value &&
    "fileType" in value
  );
};
