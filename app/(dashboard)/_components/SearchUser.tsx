"use client";

import { searchUsers } from "@/app/lib/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { User } from "@prisma/client";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";



export default function SearchUsers() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
    }
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedTerm) {
      setUsers([]);
      setLoading(false);
      return;
    }
    const fetchUsers = async () => {
      const foundUsers = await searchUsers(debouncedTerm);
      setUsers(foundUsers);
      setLoading(false);
    };
    fetchUsers();
  }, [debouncedTerm]);

  const handleUserSelect = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="p-2">
          <SidebarMenuButton
            tooltip="Search users (Ctrl+K)"
            className="w-full justify-start"
            variant="outline"
          >
            <SearchIcon className="size-5 shrink-0" />
            <span>Search User</span>
          </SidebarMenuButton>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search Users</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="mt-4 h-64 overflow-y-auto">
          {loading && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          )}
          {!loading && users.length > 0 && (
            <div className="flex flex-col gap-1">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/direct-chat/${user.clerkId}`}
                  onClick={handleUserSelect}
                  className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={user.imageUrl || ""} />
                    <AvatarFallback>
                      {user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.username}</span>
                </Link>
              ))}
            </div>
          )}
          {!loading && users.length === 0 && debouncedTerm && (
            <p className="pt-4 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          )}
          {!loading && !debouncedTerm && (
            <p className="pt-4 text-center text-sm text-muted-foreground">
              Start typing to search for users.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
