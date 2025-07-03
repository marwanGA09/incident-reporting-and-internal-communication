"use client";

import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { useIncidentFormStore, useIncidentUIForm } from "./IncidentFormStore";
import { z } from "zod";
import { Step2Schema } from "@/lib/validation/incidents";
import { InputForm } from "./InputForm";
// import { SelectCategory } from "./SelectCategory";
import { Button } from "@/components/ui/button";
import SelectItems from "./SelectItems";

function PageTwoForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { data, setData } = useIncidentFormStore();
  const { setUiData } = useIncidentUIForm();
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  const [location, setLocation] = useState(data.location || "");
  const [categoryId, setCategoryId] = useState(data.categoryId || "");
  const [isPending, startTransition] = useTransition();
  const handleNext = () => {
    const result = Step2Schema.safeParse({ location, categoryId });
    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }

    const categoryName = categories.find((cat) => cat.id === categoryId)?.name;

    setData({ location, categoryId });
    setUiData({ categoryName });
    startTransition(() => {
      router.push("/incidents/new/step-3");
    });
  };
  return (
    <>
      {" "}
      <InputForm
        placeholder="Adama, oromia..."
        label="Location"
        value={location}
        onChange={setLocation}
      />
      <SelectItems
        label="Select Incident Category"
        value={categoryId}
        onChange={setCategoryId}
        items={categories}
      />
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
        {isPending ? "Loading ..." : "Next"}
      </Button>
    </>
  );
}

export default PageTwoForm;
