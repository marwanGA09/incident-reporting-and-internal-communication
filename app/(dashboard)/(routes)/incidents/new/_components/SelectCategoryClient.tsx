"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIncidentFormStore } from "./IncidentFormStore";
import { useState } from "react";

export default function SelectCategoryClient({
  categories,
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
  categories: { id: string; name: string }[];
}) {
  // const { data, setData } = useIncidentFormStore();
  // const [categoryId, setCategoryId] = useState(data.categoryId || "");
  console.log("SOme things");
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Incident Category</SelectLabel>
          {categories.map((cate) => (
            <SelectItem key={cate.id} value={cate.id}>
              {cate.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
