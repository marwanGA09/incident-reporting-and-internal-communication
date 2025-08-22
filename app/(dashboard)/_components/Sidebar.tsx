// "use client";
import {
  BlendIcon,
  Grid2X2Check,
  ShieldCheckIcon,
  ShieldPlusIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import SidebarClient from "./SidebarClient";
import { currentUser } from "@clerk/nextjs/server";
import { getDepartments } from "@/app/lib/actions";
import { prisma } from "@/app/lib/prisma";
import { clerkClient } from "@/lib/clerkClient";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import SearchUsers from "./SearchUser";

// Menu items.
const incidentsLink = [
  {
    title: "Incidents",
    url: "/incidents",
    icon: ShieldCheckIcon,
  },
  {
    title: "Report Incidents",
    url: "/incidents/new/step-1",
    icon: ShieldPlusIcon,
  },
];

export async function AppSidebar() {
  // const { user, isLoaded } = useUser();
  const user = await currentUser();
  if (!user) return;
  console.log({ user });
  console.log(`${user?.publicMetadata?.departmentId}`);
  if (!user) return;
  const groupsDepartmentLink =
    user?.publicMetadata?.role === "admin"
      ? (await getDepartments()).map((dep) => {
          return {
            title: dep.name,
            url: `/group-chat/${dep.id}`,
            icon: BlendIcon,
          };
        })
      : [
          {
            title: (
              await getDepartments(`${user?.publicMetadata?.departmentId}`)
            )[0].name,
            url: `/group-chat/${user?.publicMetadata?.departmentId}`,
            icon: BlendIcon,
          },
        ];

  const chatLink = [
    {
      title: "chat 1",
      url: "/incidents",
      icon: ShieldCheckIcon,
    },
    {
      title: "chat 2",
      url: "/incidents/new/step-1",
      icon: ShieldPlusIcon,
    },
  ];

  const DmUsers = await prisma.directMessage.findMany({
    select: {
      senderId: true,
      receiverId: true,
    },
    where: {
      roomName: {
        contains: user?.id,
        mode: "insensitive",
      },
    },
  });

  const uniqueUserIds = [
    ...new Set(DmUsers.flatMap((dm) => [dm.senderId, dm.receiverId])),
  ].filter((id) => id !== user?.id);
  // console.log({ User: user?.id });
  // console.log(uniqueUserIds);

  const { data } = await clerkClient.users.getUserList({
    userId: uniqueUserIds,
    orderBy: "-created_at",
    limit: 500,
  });

  const listOfUsers = data.map((user) => {
    // console.log({ user });

    return {
      name: user?.firstName || "",
      id: user.id,
      imageUrl: user.imageUrl || "",
      // username: user.username || "",
      // email: user.primaryEmailAddress?.emailAddress || "",
    };
  });

  const usersFromDB = await prisma.user.findMany({
    where: {
      clerkId: { in: uniqueUserIds },
    },
    include: {
      department: true,
    },
  });
  console.log({ usersFromDB });
  // await prisma.directMessage.findUnique
  // console.log({ DmUsers });
  // if (!isLoaded) return;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Incidents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {incidentsLink.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Departments Groups</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupsDepartmentLink.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>{" "}
        <SidebarGroup className=" h-full">
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
          <div className="mt-auto">
            {/* <SidebarGroupLabel>Search Users</SidebarGroupLabel>
            <Input placeholder="Search users..." /> */}
            <SearchUsers />
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user?.publicMetadata.role === "admin" && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href={"/dashboard"}>
                  <Grid2X2Check />
                  <span>Admin Dashboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarClient />
      </SidebarFooter>
    </Sidebar>
  );
}
