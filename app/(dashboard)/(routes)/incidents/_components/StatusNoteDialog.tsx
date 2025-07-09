import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function StatusNoteDialog({
  open,
  onClose,
  onSubmit,
  status,
}: {
  open: boolean;
  status: string;
  onClose: () => void;
  onSubmit: (note: string) => void;
}) {
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Status to {status}</DialogTitle>
          <DialogDescription>
            Provide a note or reason for this status change.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Write a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[120px]"
        />
        <DialogFooter>
          <Button onClick={() => onSubmit(note)} disabled={!note.trim()}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
