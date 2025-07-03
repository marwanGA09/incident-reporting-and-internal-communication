"use client";
import { useRouter } from "next/navigation";
import { useIncidentFormStore } from "../_components/IncidentFormStore";
import { Step3Schema } from "@/lib/validation/incidents";
import { useState } from "react";
import { z } from "zod";

export default function Step3() {
  const router = useRouter();
  const { data, setData } = useIncidentFormStore();
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  const [departmentId, setDepartmentId] = useState(data.departmentId || "");
  const [assignedToId, setAssignedToId] = useState(data.assignedToId || "");

  const handleNext = () => {
    const result = Step3Schema.safeParse({ departmentId, assignedToId });
    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }
    setData({ departmentId, assignedToId });
    router.push("/incidents/new/review");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">
        Step 3: Department & Assignment
      </h1>

      <label>Department ID (UUID)</label>
      <input
        className="border p-2 w-full mb-2"
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value)}
      />

      <label>Assigned To (Clerk User ID)</label>
      <input
        className="border p-2 w-full mb-2"
        value={assignedToId}
        onChange={(e) => setAssignedToId(e.target.value)}
      />

      {errors.length > 0 && (
        <div className="text-red-500">
          {errors.map((err) => (
            <p key={err.path.join(".")}>{err.message}</p>
          ))}
        </div>
      )}

      <button
        onClick={handleNext}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Review
      </button>
    </div>
  );
}
