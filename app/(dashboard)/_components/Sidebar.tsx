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
import { currentUser } from "@clerk/nextjs/server";
import { getDepartments, getNotifications } from "@/app/lib/actions";
import { prisma } from "@/app/lib/prisma";
import SidebarClient from "./SidebarClient";

// Menu items.

export async function AppSidebar() {
  const user = await currentUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true, role: true, departmentId: true, clerkId: true },
  });

  if (!dbUser) return null;

  const { unReadNotifications } = await getNotifications();
  const departments = await getDepartments();

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

  const usersFromDB = await prisma.user.findMany({
    where: {
      clerkId: { in: uniqueUserIds },
    },
    include: {
      department: true,
    },
  });

  return (
    <SidebarClient
      dbUser={dbUser}
      unreadNotificationsProps={unReadNotifications || []}
      // groupsDepartmentLink={groupsDepartmentLink}
      departments={departments}
      usersFromDB={usersFromDB}
    />
    // <div>some thing</div>
  );
}
