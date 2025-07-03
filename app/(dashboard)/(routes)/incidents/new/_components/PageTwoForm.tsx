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
      <div className="flex justify-end items-center gap-2.5 mt-3">
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
          variant={"link"}
          onClick={handleNext}
          className=" bg-green-500 hover:bg-green-700 text-white  px-6 py-2 rounded shadow"
        >
          {isPending ? "Loading..." : "Next"}
        </Button>
      </div>
    </>
  );
}

export default PageTwoForm;
