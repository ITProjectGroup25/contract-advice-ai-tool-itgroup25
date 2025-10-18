// app/actions/uploadFileToSupabase.ts
"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.DATABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for server actions

if (!supabaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
}

const FILE_BUCKET_NAME = "grant-scheme-files" as const;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function uploadFileToSupabase(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return {
        message: "No file provided",
        error: "File is required",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${timestamp}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `form-uploads/${fileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(FILE_BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return {
        message: "Failed to upload file",
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(FILE_BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      message: "success",
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: data.path,
        fileUrl: urlData.publicUrl,
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      message: "Failed to upload file",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
