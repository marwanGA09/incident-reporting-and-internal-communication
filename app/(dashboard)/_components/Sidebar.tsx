// "use client";
import {
  BlendIcon,
  Grid2X2Check,
  NotebookIcon,
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
import Image from "next/image";
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
  console.log("user in sidebar", user?.publicMetadata?.role);
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

  const usersFromDB = await prisma.user.findMany({
    where: {
      clerkId: { in: uniqueUserIds },
    },
    include: {
      department: true,
    },
  });

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
              <SidebarMenuItem key={user.id}>
                <SidebarMenuButton asChild>
                  <a href={`/direct-chat/${user.id}`}>
                    {/* <item.icon /> */}{" "}
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300 flex justify-center items-center">
                      {<NotebookIcon className="w-5 h-5" />}
                    </div>
                    <span>Saved Message</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {usersFromDB.map((user) => (
                <SidebarMenuItem key={user.id}>
                  <SidebarMenuButton asChild>
                    <a href={`/direct-chat/${user.clerkId}`}>
                      {/* <item.icon /> */}{" "}
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                        {user.imageUrl ? (
                          <Image
                            src={user.imageUrl}
                            alt={user.username || "user"}
                            width={20}
                            height={20}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-400 text-white flex items-center justify-center text-sm font-semibold">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span>{user.username}</span>
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
