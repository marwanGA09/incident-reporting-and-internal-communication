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
    <div className="flex items-start pt-3 gap-2">
      <Label className="pt-3" htmlFor="textarea">
        {label}
      </Label>
      <Textarea
        id="textarea"
        rows={5}
        value={value}
        placeholder="Description"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
