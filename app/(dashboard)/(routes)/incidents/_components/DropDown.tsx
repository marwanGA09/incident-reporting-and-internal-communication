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

export function Dropdown({
  status,
  incidentId,
}: {
  status: string;
  incidentId: string;
}) {
  const { user } = useUser();
  const handleValueChange = async (value: string) => {
    const result = await axios.patch(`/api/incidents/${incidentId}/status`, {
      status: value,
    });
    user?.reload();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <SquarePenIcon />
        </Button>
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
