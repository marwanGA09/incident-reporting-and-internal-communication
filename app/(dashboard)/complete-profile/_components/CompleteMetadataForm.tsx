"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { setUserMetadata } from "@/app/(dashboard)/complete-profile/action";
import toast from "react-hot-toast";
import { Position } from "@/types/globals";
import { Department } from "@prisma/client";

export default function CompleteMetadataForm({
  departments,
}: {
  departments: Department[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const { user } = useUser();
  const [departmentId, setDepartmentId] = useState("");
  const [position, setPosition] = useState<Position>("lower");
  const [isPending, startTransition] = useTransition();

  if (!user) return null;

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await setUserMetadata({ role: "regular", departmentId, position });
        // ✅ Ask Clerk to reload the user data from server
        await user?.reload();
        toast.success("Profile setup complete!");
        router.refresh();
        router.push(returnTo);
      } catch {
        toast.error(
          "Failed to complete profile setup. Please try again later."
        );
      }
    });
  };

  return (
    <div className=" ">
      <div className="bg-white shadow-md rounded-2xl p-8 max-w-md w-full space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          Complete Your Profile
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Select onValueChange={setDepartmentId}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Select onValueChange={(v: Position) => setPosition(v)}>
              <SelectTrigger id="position">
                <SelectValue placeholder="Select your position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem disabled value="higher">
                  Higher
                </SelectItem>
                <SelectItem value="middle">Middle</SelectItem>
                <SelectItem value="lower">Lower</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            disabled={isPending || !departmentId || !position}
            onClick={handleSubmit}
            className="w-full"
          >
            {isPending ? "Submitting..." : "Finish Setup"}
          </Button>
        </div>
      </div>
    </div>
  );
}
