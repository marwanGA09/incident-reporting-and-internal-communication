"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SquarePenIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { StatusNoteDialog } from "./StatusNoteDialog";
import { useUser } from "@clerk/nextjs";

export function Dropdown({
  status,
  handleSubmitNote,
}: {
  status: string;
  handleSubmitNote: (note: string, selectedStatus: string) => void;
}) {
  const { user } = useUser();
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === status) return; // no change
    setSelectedStatus(newStatus);
    setDialogOpen(true);
  };

  if (!user) return redirect("/");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="bg-inherit border-0 hover:bg-inherit cursor-pointer">
            <SquarePenIcon />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Incident Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={status}
            onValueChange={handleStatusChange}
          >
            <DropdownMenuRadioItem value="REPORTED">
              Reported
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="IN_REVIEW">
              In Review
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="RESOLVED">
              Resolved
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="CLOSED">Closed</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedStatus && (
        <StatusNoteDialog
          open={dialogOpen}
          status={selectedStatus}
          onClose={() => setDialogOpen(false)}
          onSubmit={(note) => {
            handleSubmitNote(note, selectedStatus);
            setDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
