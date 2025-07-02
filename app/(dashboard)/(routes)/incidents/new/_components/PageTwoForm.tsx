"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useIncidentFormStore } from "./IncidentFormStore";
import { z } from "zod";
import { Step2Schema } from "@/lib/validation/incidents";
import { InputForm } from "./InputForm";
// import { SelectCategory } from "./SelectCategory";
import SelectCategoryClient from "./SelectCategoryClient";

function PageTwoForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { data, setData } = useIncidentFormStore();
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  const [location, setLocation] = useState(data.location || "");
  const [categoryId, setCategoryId] = useState(data.categoryId || "");
  console.log({ categoryId, setCategoryId });
  const handleNext = () => {
    const result = Step2Schema.safeParse({ location, categoryId });
    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }
    setData({ location, categoryId });
    router.push("/incidents/new/step-3");
  };
  return (
    <>
      {" "}
      <InputForm label="Location" value={location} onChange={setLocation} />
      <SelectCategoryClient
        value={categoryId}
        onChange={setCategoryId}
        categories={categories}
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
    </>
  );
}

export default PageTwoForm;

// import { useRouter } from "next/navigation";
// import { useIncidentFormStore } from "../_components/IncidentFormStore";
// import { Step2Schema } from "@/lib/validation/incidents";
// import { useState } from "react";
// import { z } from "zod";
// import { SelectCategory } from "../_components/SelectCategory";
// import { InputForm } from "../_components/InputForm";

// export default function Step2() {
//   const router = useRouter();
//   const { data, setData } = useIncidentFormStore();
//   const [errors, setErrors] = useState<z.ZodIssue[]>([]);

//   const [location, setLocation] = useState(data.location || "");
//   const [categoryId, setCategoryId] = useState(data.categoryId || "");
//   console.log({ categoryId, setCategoryId });
//   const handleNext = () => {
//     const result = Step2Schema.safeParse({ location, categoryId });
//     if (!result.success) {
//       setErrors(result.error.issues);
//       return;
//     }
//     setData({ location, categoryId });
//     router.push("/incidents/new/step-3");
//   };

//   return (
//     <div className="max-w-md mx-auto p-4">
//       <h1 className="text-xl font-bold mb-4">Step 2: Location & Category</h1>

//       {/* <label>Location</label>
//       <input
//         className="border p-2 w-full mb-2"
//         value={location}
//         onChange={(e) => setLocation(e.target.value)}
//       /> */}
//       {/* <label>Category ID (UUID)</label>
//       <input
//       className="border p-2 w-full mb-2"
//       value={categoryId}
//       onChange={(e) => setCategoryId(e.target.value)}
//       /> */}

//       {/* <SelectCategory onChange={setCategoryId} /> */}
//       <InputForm label="Location" value={location} onChange={setLocation} />
//       <SelectCategory />

//       {errors.length > 0 && (
//         <div className="text-red-500">
//           {errors.map((err) => (
//             <p key={err.path.join(".")}>{err.message}</p>
//           ))}
//         </div>
//       )}

//       <button
//         onClick={handleNext}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Next
//       </button>
//     </div>
//   );
// }
