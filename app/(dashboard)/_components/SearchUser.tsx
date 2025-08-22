"use client";

import { searchUsers } from "@/app/lib/actions";
import { Input } from "@/components/ui/input";
import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { User } from "@prisma/client";
import Image from "next/image";
import { useState, useEffect } from "react";
export default function SearchUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [usersFromDB, setUsersFromDB] = useState<User[]>([]);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 1000); // 1 second

    return () => {
      clearTimeout(handler); // cleanup if user types again before 1s
    };
  }, [searchTerm]);

  // Effect for calling your search API
  useEffect(() => {
    if (!debouncedTerm) return;

    const fetchUsers = async () => {
      const users = await searchUsers(debouncedTerm);
      console.log({ debouncedTerm });
      console.log("Users:", users);
      setUsersFromDB(users);
    };

    fetchUsers();
  }, [debouncedTerm]);

  return (
    <div className="mt-auto">
      <SidebarGroupLabel>Search Users</SidebarGroupLabel>
      <SidebarMenu>
        {usersFromDB.map((user) => (
          <SidebarMenuItem key={user.id}>
            <SidebarMenuButton asChild>
              <a href={`/direct-chat/${user.clerkId}`}>
                {/* <item.icon /> */}{" "}
                <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.firstName || "user"}
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-400 text-white flex items-center justify-center text-sm font-semibold">
                      {user.firstName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span>{user.firstName}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
