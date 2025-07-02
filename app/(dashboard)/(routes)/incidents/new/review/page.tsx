"use client";
import { useIncidentFormStore } from "../_components/IncidentFormStore";
import { IncidentFormSchema } from "@/lib/validation/incidents";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Review() {
  const router = useRouter();
  const { data, clear } = useIncidentFormStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const result = IncidentFormSchema.safeParse(data);
    console.log({ result });
    if (!result.success) {
      setError("Form has invalid or incomplete data");
      return;
    }
    // app/api/incidents/route.ts
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        body: JSON.stringify(result.data),
      });
      if (!res.ok) throw new Error("API error");

      clear();
      setSuccess(true);
      router.push("/incidents"); // redirect after success
    } catch (e) {
      console.log("ERROR", e);
      setError("Failed to submit incident");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Review & Submit</h1>

      <pre className="bg-gray-100 p-4 rounded mb-4">
        {JSON.stringify(data, null, 2)}
      </pre>

      {error && <div className="text-red-500">{error}</div>}
      {success && (
        <div className="text-green-600">Incident submitted successfully!</div>
      )}

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
}
