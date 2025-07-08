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
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function Dropdown({
  status,
  incidentId,
}: {
  status: string;
  incidentId: string;
}) {
  const router = useRouter();
  const handleValueChange = async (value: string) => {
    const result = await axios.patch(`/api/incidents/${incidentId}/status`, {
      status: value,
    });
    router.refresh();
  };
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
          onValueChange={handleValueChange}
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
