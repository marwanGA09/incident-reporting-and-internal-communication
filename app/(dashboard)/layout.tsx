import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { AppSidebar } from "./_components/Sidebar";
import { getDepartments } from "../lib/actions";
import { prisma } from "../lib/prisma";
import { BlendIcon } from "lucide-react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import UserMetadataGuard from "../_components/UserMetadataGuard";
import { NavigationMenu } from "./_components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });

  if (!dbUser) return null;

  const plainUser = {
    id: user.id,
    publicMetadata: {
      role: user.publicMetadata.role,
      departmentId: user.publicMetadata.departmentId,
    },
  };

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

  const groupsDepartmentLink =
    user?.publicMetadata?.role === "admin"
      ? (await getDepartments()).map((dep) => ({
          title: dep.name,
          url: `/group-chat/${dep.id}`,
          icon: "BlendIcon",
        }))
      : [
          {
            title: (
              await getDepartments(`${user?.publicMetadata?.departmentId}`)
            )[0].name,
            url: `/group-chat/${user?.publicMetadata?.departmentId}`,
            icon: "BlendIcon",
          },
        ];

  return (
    // <div className="flex h-screen">
    //   <SidebarProvider>
    //     <AppSidebar
    //       user={plainUser}
    //       dbUser={dbUser}
    //       groupsDepartmentLink={groupsDepartmentLink}
    //       usersFromDB={usersFromDB}
    //     />
    //   </SidebarProvider>
    //   <main className="flex-1 h-full overflow-y-auto">{children}</main>
    // </div>
    <UserMetadataGuard>
      <SidebarProvider defaultOpen={true}>
        {/* <AppSidebar /> */}
        <AppSidebar
          user={plainUser}
          dbUser={dbUser}
          groupsDepartmentLink={groupsDepartmentLink}
          usersFromDB={usersFromDB}
        />
        <main className="w-full h-screen flex flex-col">
          <div className="bg-primary-foreground h-[80px] flex items-center justify-end  px-6  inset-y-0 w-full z-50 ">
            <NavigationMenu />
          </div>
          <div className=" absolute top-2 z-50">
            <SidebarTrigger />
          </div>
          <div className="absolute top-[80px] bottom-0 flex-grow w-full">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </UserMetadataGuard>
  );
}
