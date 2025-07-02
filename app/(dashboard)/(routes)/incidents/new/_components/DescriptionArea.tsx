import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DescriptionArea({
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
      <Textarea
        value={value}
        placeholder="Description"
        onChange={(e) => onChange(e.target.value)}
      />
    </Label>
  );
}
