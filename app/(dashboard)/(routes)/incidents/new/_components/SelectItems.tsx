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

export default function SelectItems({
  items,
  label,
  value,
  disabled = false,
  onChange,
}: {
  value: string;
  label: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  items: { id: string; name: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-11/12 ml-auto mt-3">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
