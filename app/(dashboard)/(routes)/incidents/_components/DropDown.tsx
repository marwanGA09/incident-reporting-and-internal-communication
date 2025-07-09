// "use client";

// import * as React from "react";
// import axios from "axios";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuLabel,
//   DropdownMenuRadioGroup,
//   DropdownMenuRadioItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { SquarePenIcon } from "lucide-react";
// import { useRouter } from "next/navigation";

// export function Dropdown({
//   status,
//   incidentId,
//   onValueChange,
// }: {
//   status: string;
//   incidentId: string;
//   onValueChange: (status: string, incidentId: string) => void;
// }) {
//   const router = useRouter();

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <span className="bg-inherit border-0 hover:bg-inherit">
//           <SquarePenIcon />
//         </span>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className="w-56">
//         <DropdownMenuLabel>Incident Status</DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuRadioGroup
//           value={status}
//           onValueChange={(status) => {
//             onValueChange(status, incidentId);
//           }}
//         >
//           <DropdownMenuRadioItem value="REPORTED">
//             Reported
//           </DropdownMenuRadioItem>
//           <DropdownMenuRadioItem value="IN_REVIEW">
//             In_review
//           </DropdownMenuRadioItem>
//           <DropdownMenuRadioItem value="RESOLVED">
//             Resolved
//           </DropdownMenuRadioItem>
//           <DropdownMenuRadioItem value="CLOSED">Closed</DropdownMenuRadioItem>
//         </DropdownMenuRadioGroup>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
"use client";

import * as React from "react";
import axios from "axios";

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
import { redirect, useRouter } from "next/navigation";
import { StatusNoteDialog } from "./StatusNoteDialog";
import { useUser } from "@clerk/nextjs";

export function Dropdown({
  status,
  incidentId,
}: {
  status: string;
  incidentId: string;
}) {
  const router = useRouter();
  const { user } = useUser();
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleSubmitNote = async (note: string) => {
    try {
      await axios.patch("/api/incidents", {
        id: incidentId,
        status: selectedStatus,
        note,
        userId: user?.id,
      });
      setDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Status change failed", err);
    }
  };

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
          onSubmit={handleSubmitNote}
        />
      )}
    </>
  );
}
