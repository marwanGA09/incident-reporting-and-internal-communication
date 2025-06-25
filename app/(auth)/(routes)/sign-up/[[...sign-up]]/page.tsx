// import { SignUp } from '@clerk/nextjs';

// export default function Page() {
//   return <SignUp />;
// }
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
// import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { Position } from "@/types/globals";
// 👇 Import server action via 'use server'
import { setUserMetadata } from "./action";
import toast from "react-hot-toast";

export default function CompleteMetadataPage() {
  const router = useRouter();
  const { user } = useUser();
  const [departmentId, setDepartmentId] = useState("");
  const [position, setPosition] = useState<Position>("lower"); // Default to 'lower'
  const [isPending, startTransition] = useTransition();

  const departments = [
    { id: "dept-news", name: "News" },
    { id: "dept-tech", name: "Technology" },
    { id: "dept-hr", name: "Human Resources" },
  ];

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await setUserMetadata({ role: "regular", departmentId, position });
        toast.success("Profile setup complete!");
        router.push("/");
      } catch (error) {
        console.error("Error setting user metadata:", error);
        toast.error(
          "Failed to complete profile setup. Please try again later."
        );
      }
    });
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 max-w-md w-full space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          Complete Your Profile
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Select onValueChange={(v: string) => setDepartmentId(v)}>
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
                <SelectItem value="higher">Higher</SelectItem>
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
