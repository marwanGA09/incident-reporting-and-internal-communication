import { Input } from "@/components/ui/input";

export function InputTitle({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      type="text"
      placeholder="Title"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
