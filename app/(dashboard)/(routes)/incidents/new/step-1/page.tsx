"use client";

import { useRouter } from "next/navigation";
import { useIncidentFormStore } from "../_components/IncidentFormStore";
import { Step1Schema } from "@/lib/validation/incidents";
import { z } from "zod";
import { useState, useTransition } from "react";
import { InputForm } from "../_components/InputForm";
import { DescriptionArea } from "../_components/DescriptionArea";
import { Button } from "@/components/ui/button";

export default function Step1() {
  const router = useRouter();
  const { data, setData } = useIncidentFormStore();
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  const [title, setTitle] = useState(data.title || "");
  const [description, setDescription] = useState(data.description || "");

  const [isPending, startTransition] = useTransition();

  const handleNext = () => {
    const result = Step1Schema.safeParse({ title, description });
    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }
    setData({ title, description });
    startTransition(() => {
      router.push("/incidents/new/step-2");
    });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Step 1: Basic Info</h1>
      {/* <input
        className="border p-2 w-full mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      /> */}
      <InputForm
        placeholder="Add title of incident here"
        label={"Title"}
        value={title}
        onChange={setTitle}
      />
      <DescriptionArea
        label="Description"
        value={description}
        onChange={setDescription}
      />
      {/* <label>Description</label>
      <textarea
        className="border p-2 w-full mb-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      /> */}

      {errors.length > 0 && (
        <div className="text-red-500">
          {errors.map((err) => (
            <p key={err.path.join(".")}>{err.message}</p>
          ))}
        </div>
      )}

      <Button
        variant={"link"}
        onClick={handleNext}
        className=" px-4 py-2 rounded mt-4 bg-amber-100"
      >
        {isPending ? "Loading..." : "Next"}
      </Button>
    </div>
  );
}
