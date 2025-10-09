"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";

import { addAttachmentToAction } from "@/app/lib/actions";
import FileUpload from "../new/_components/FileUpload";

interface AddAttachmentProps {
  incidentId: string;
}

export default function AddAttachment({ incidentId }: AddAttachmentProps) {
  const [, startTransition] = useTransition();

  const handleUpload = (url: string, fileName: string) => {
    startTransition(async () => {
      try {
        await addAttachmentToAction({ incidentId, url, fileName });
        toast.success("Attachment added successfully!");
      } catch {
        toast.error("Failed to add attachment.");
      }
    });
  };

  return (
    <div className="mt-4">
      <h4 className="text-md font-semibold mb-2">Add Attachment</h4>
      <FileUpload onUpload={handleUpload} />
    </div>
  );
}
