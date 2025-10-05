// app/(dashboard)/dashboard/departments/_components/EditDepartmentDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Department } from "@prisma/client";
import { updateDepartment } from "@/app/lib/actions";

interface EditDepartmentDialogProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditDepartmentDialog = ({ department, isOpen, onClose }: EditDepartmentDialogProps) => {
  const [name, setName] = useState(department?.name || "");
  const [email, setEmail] = useState(department?.email || "");

  useEffect(() => {
    if (department) {
      setName(department.name);
      setEmail(department.email || "");
    }
  }, [department]);

  const handleSave = async () => {
    if (department) {
      await updateDepartment(department.id, name, email);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Department: {department?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
