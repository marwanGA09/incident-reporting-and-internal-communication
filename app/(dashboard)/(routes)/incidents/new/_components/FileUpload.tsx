"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

import { supabase } from "@/lib/supabaseClient";
import logger from "@/app/lib/logger";

interface FileUploadProps {
  onUpload: (url: string, fileName: string) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!user) {
      toast.error("You must be logged in to upload files.");
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading file...");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("incident-attachments")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("incident-attachments")
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error("Could not get public URL for the file.");
      }

      onUpload(publicUrlData.publicUrl, file.name);
      toast.success("File uploaded successfully!", { id: toastId });
    } catch (error: any) {
      logger.error("File upload error:", error);
      toast.error(`Upload failed: ${error.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [".jpeg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".mov"],
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary/50"
        }`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <UploadCloud className="h-8 w-8" />
          <p>
            {isDragActive
              ? "Drop the file here..."
              : "Drag & drop a file here, or click to select"}
          </p>
          <p className="text-xs">Images, Videos, or PDFs</p>
        </div>
      )}
    </div>
  );
}
