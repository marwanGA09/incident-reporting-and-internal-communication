"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useIncidentFormStore,
  useIncidentUIForm,
} from "../_components/IncidentFormStore";
import { IncidentFormSchema } from "@/lib/validation/incidents";
import logger from "@/app/lib/logger";

export default function Review() {
  const router = useRouter();
  const { data, clear } = useIncidentFormStore();
  const { uiData, clearUI } = useIncidentUIForm();

  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    const result = IncidentFormSchema.safeParse(data);
    if (!result.success) {
      console.error("Form validation failed on review:", result.error.issues);
      toast.error(
        "Form has invalid or incomplete data. Please go back and edit."
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/incidents", {
          method: "POST",
          body: JSON.stringify(result.data),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "API error");
        }

        toast.success("Incident submitted successfully!");
        clear();
        clearUI();
        router.push("/incidents");
      } catch (error: unknown) {
        logger.error({ error }, "Submission Error");
        toast.error(
          `Failed to submit incident: ${
            typeof error.message === "object"
              ? JSON.stringify(error.message)
              : error.message
          }`
        );
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto pt-8"
    >
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
          <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
        </div>
        <p className="text-sm text-gray-500">Final Review</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Review Your Incident Report</CardTitle>
          <CardDescription>
            Please review all the information carefully before final submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <ReviewItem label="Title" value={data.title} />
            <ReviewItem
              label="Date & Time of Occurrence"
              value={data.occurredAt && format(data.occurredAt, "PPP HH:mm")}
            />
            <ReviewItem label="Severity" value={data.severity} />
            <ReviewItem label="Priority" value={data.priority} />
            <ReviewItem label="Category" value={uiData.categoryName} />
            <ReviewItem label="Department" value={uiData.departmentName} />
            <ReviewItem
              label="Location / Address"
              value={data.locationAddress}
            />
            <ReviewItem label="Assignee" value={uiData.assigneeName} />
          </div>

          <ReviewItem
            label="Affected Services"
            value={data.affectedServices?.join(", ")}
            fullWidth
          />
          <ReviewItem label="Description" value={data.description} fullWidth />

          <div className="flex justify-between items-center pt-6">
            <Button
              variant="secondary"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Back to Edit
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? "Submitting..." : "Confirm & Submit Incident"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ReviewItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p className="text-base font-semibold text-gray-800 mt-1">
        {value || (
          <span className="font-normal text-gray-400">Not provided</span>
        )}
      </p>
    </div>
  );
}
