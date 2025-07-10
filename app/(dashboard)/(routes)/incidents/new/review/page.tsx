"use client";

import {
  useIncidentFormStore,
  useIncidentUIForm,
} from "../_components/IncidentFormStore";
import { IncidentFormSchema } from "@/lib/validation/incidents";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function Review() {
  const router = useRouter();
  const { data, clear } = useIncidentFormStore();
  const { uiData, clearUI } = useIncidentUIForm();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    const result = IncidentFormSchema.safeParse(data);
    if (!result.success) {
      setError("Form has invalid or incomplete data");
      return;
    }

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        body: JSON.stringify(result.data),
      });
      if (!res.ok) throw new Error("API error");

      clear();
      clearUI();
      setSuccess(true);
      startTransition(() => {
        router.push("/incidents");
      });
      toast.success(" Incident submitted successfully!");
    } catch (e) {
      console.error("Submission Error", e);
      setError("Failed to submit incident");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 px-6 py-8 border shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Review Your Incident Report
      </h1>

      <div className="space-y-4">
        <Section title="Title" value={data.title} />
        <Section title="Description" value={data.description} />
        <Section title="Location" value={data.location} />

        <Section
          title="Category"
          value={uiData?.categoryName}
          // subValue={data.categoryId}
        />

        <Section
          title="Department"
          value={uiData?.departmentName}
          // subValue={data.departmentId}
        />

        <Section
          title="Assigned To"
          value={uiData?.assignedToName || "Not Assigned"}
          // subValue={data.assignedToId}
        />
      </div>

      {error && (
        <div className="mt-4 text-red-600 font-medium border border-red-300 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 text-green-700 font-medium border border-green-300 bg-green-50 p-3 rounded">
          Incident submitted successfully!
        </div>
      )}

      <div className="mt-6 flex justify-center gap-2.5">
        <Button
          // onClick={handleSubmit}
          onClick={() => {
            router.back();
          }}
          disabled={isPending}
          className="bg-slate-300 hover:bg-slate-400 text-black px-6 py-2 rounded shadow"
        >
          {isPending ? "Edit..." : "Edit"}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow"
        >
          {isPending ? "Submitting..." : "Submit Incident"}
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  value,
}: {
  title: string;
  value?: string;
  subValue?: string;
}) {
  return (
    <div className="border-b pb-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-gray-800">
        {value || <span className="text-gray-400">Not provided</span>}
      </p>
    </div>
  );
}
