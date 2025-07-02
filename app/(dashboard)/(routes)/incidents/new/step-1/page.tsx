"use client";

import { useRouter } from "next/navigation";
import { useIncidentFormStore } from "../_components/IncidentFormStore";
import { Step1Schema } from "@/lib/validation/incidents";
import { z } from "zod";
import { useState } from "react";
import { InputTitle } from "../_components/Input";

export default function Step1() {
  const router = useRouter();
  const { data, setData } = useIncidentFormStore();
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  const [title, setTitle] = useState(data.title || "");
  const [description, setDescription] = useState(data.description || "");

  const handleNext = () => {
    const result = Step1Schema.safeParse({ title, description });
    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }
    setData({ title, description });
    router.push("/incidents/new/step-2");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Step 1: Basic Info</h1>
      <label>Title</label>
      {/* <input
        className="border p-2 w-full mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      /> */}
      <InputTitle value={title} onChange={setTitle} />
      <label>Description</label>
      <textarea
        className="border p-2 w-full mb-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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
        Next
      </button>
    </div>
  );
}
