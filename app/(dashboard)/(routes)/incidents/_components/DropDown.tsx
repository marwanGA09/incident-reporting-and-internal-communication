"use client";

import * as React from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";

export function Dropdown({
  status,
  incidentId,
  onValueChange,
}: {
  status: string;
  incidentId: string;
  onValueChange: (status: string, incidentId: string) => void;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span className="bg-inherit border-0 hover:bg-inherit">
          <SquarePenIcon />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Incident Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(status) => {
            onValueChange(status, incidentId);
          }}
        >
          <DropdownMenuRadioItem value="REPORTED">
            Reported
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="IN_REVIEW">
            In_review
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="RESOLVED">
            Resolved
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="CLOSED">Closed</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
