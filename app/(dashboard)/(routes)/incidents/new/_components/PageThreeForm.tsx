"use client";

import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { useIncidentFormStore, useIncidentUIForm } from "./IncidentFormStore";
import { z } from "zod";
import { Step3Schema } from "@/lib/validation/incidents";
import { Button } from "@/components/ui/button";
import SelectItems from "./SelectItems";

function PageThreeForm({
  departments,
}: {
  departments: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { data, setData } = useIncidentFormStore();
  const { setUiData } = useIncidentUIForm();
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  const [departmentId, setDepartmentId] = useState(data.departmentId || "");
  const [assignedToId, setAssignedToId] = useState(data.assignedToId || "");

  const [isPending, startTransition] = useTransition();
  const handleNext = () => {
    const result = Step3Schema.safeParse({ departmentId, assignedToId });
    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }
    const departmentName = departments.find(
      (dep) => dep.id === departmentId
    )?.name;
    setData({ departmentId, assignedToId });
    setUiData({ departmentName });
    startTransition(() => {
      router.push("/incidents/new/review");
    });
  };

  return (
    <>
      {/* <InputForm
        placeholder="Adama, oromia..."
        label="Location"
        value={location}
        onChange={setLocation}
      /> */}

      <SelectItems
        label="Select Department"
        value={departmentId}
        onChange={setDepartmentId}
        items={departments}
      />
      <SelectItems
        disabled={true}
        label="Assign To"
        value={assignedToId}
        onChange={setAssignedToId}
        items={[]}
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

export default PageThreeForm;
