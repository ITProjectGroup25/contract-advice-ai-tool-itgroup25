"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FileData {
  name: string;
  size: number;
  type: string;
  data: string; // base64 encoded
}

interface FileUploadProps {
  id: string;
  title: string;
  description?: string;
  required?: boolean;
  value?: FileData[];
  onChange: (files: FileData[]) => void;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
}

export function FileUpload({
  id,
  title,
  description,
  required = false,
  value = [],
  onChange,
  accept = "*/*",
  maxSize = 10,
  maxFiles = 5,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const units = ["Bytes", "KB", "MB", "GB"];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** unitIndex).toFixed(2))} ${units[unitIndex]}`;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(reader.error);
    });
  };

  const validateFile = (file: File) => {
    const maxSizeInBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`);
      return false;
    }
    return true;
  };

  const processFiles = async (files: FileList) => {
    if (value.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    setIsUploading(true);
    const newFiles: FileData[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!validateFile(file)) {
          continue;
        }

        const fileExists = value.some((existing) => existing.name === file.name && existing.size === file.size);
        if (fileExists) {
          toast.error(`File "${file.name}" is already uploaded.`);
          continue;
        }

        try {
          const base64Data = await convertFileToBase64(file);
          newFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            data: base64Data,
          });
        } catch (error) {
          console.error("Error converting file to base64:", error);
          toast.error(`Failed to process file "${file.name}".`);
        }
      }

      if (newFiles.length > 0) {
        onChange([...value, ...newFiles]);
        toast.success(`${newFiles.length} file(s) uploaded successfully.`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      void processFiles(files);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      void processFiles(files);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
    toast.success("File removed successfully.");
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {title} {required && "*"}
      </Label>

      {description && <p className="text-sm text-muted-foreground mb-2">{description}</p>}

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop files here
          </div>
          <div className="text-xs text-muted-foreground">Maximum {maxFiles} files, {maxSize}MB each</div>
          {isUploading && <div className="text-xs text-muted-foreground">Processing files...</div>}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {value.length > 0 && (
        <div className="space-y-2">
          <Separator />
          <div className="text-sm font-medium">Uploaded Files ({value.length}/{maxFiles})</div>
          <div className="space-y-2">
            {value.map((file, index) => (
              <Card key={`${file.name}-${index}`} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type || "Unknown type"}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {required && value.length === 0 && (
        <div className="flex items-center space-x-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>At least one file is required.</span>
        </div>
      )}
    </div>
  );
}
