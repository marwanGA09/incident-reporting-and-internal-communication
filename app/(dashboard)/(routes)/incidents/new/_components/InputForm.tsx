import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InputForm({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Label>
      {label}
      <Input
        value={value}
        type="text"
        placeholder="Title"
        onChange={(e) => onChange(e.target.value)}
      />
    </Label>
  );
}
