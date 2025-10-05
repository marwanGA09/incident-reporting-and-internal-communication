// app/(dashboard)/dashboard/users/_components/UserTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Department } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { EditUserDialog } from "./EditUserDialog";
import { getDepartments } from "@/app/lib/actions";

type UserWithDepartment = User & { department: Department | null };

interface UserTableProps {
  users: UserWithDepartment[];
}

export const UserTable = ({ users }: UserTableProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithDepartment | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    getDepartments().then(setDepartments);
  }, []);

  const handleEditClick = (user: UserWithDepartment) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.department?.name || "N/A"}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <EditUserDialog
        user={selectedUser}
        departments={departments}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </>
  );
};
