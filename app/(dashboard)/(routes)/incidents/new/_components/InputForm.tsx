import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InputForm({
  placeholder,
  label,
  value,
  onChange,
}: {
  placeholder: string;
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
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Label>
  );
}
