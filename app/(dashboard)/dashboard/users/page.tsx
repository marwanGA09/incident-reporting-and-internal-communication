// app/(dashboard)/dashboard/users/page.tsx

import { getAllUsers } from "@/app/lib/actions";
import { UserTable } from "./_components/UserTable";

export default async function UsersPage() {
  const users = await getAllUsers();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <UserTable users={users} />
    </div>
  );
}
