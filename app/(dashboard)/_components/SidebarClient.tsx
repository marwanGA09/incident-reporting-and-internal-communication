"use client";

import {
  BlendIcon,
  Grid2X2Check,
  NotebookIcon,
  ShieldCheckIcon,
  ShieldPlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { User } from "@clerk/nextjs/server";
import { Department, Notification } from "@prisma/client";

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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import SearchUsers from "./SearchUser";
import { getNotifications, getUnreadIncidentsCount } from "@/app/lib/actions";

interface UserFromDB {
  id: string;
  clerkId: string | null;
  username: string | null;
  imageUrl: string | null;
  department: {
    id: string;
    name: string;
  } | null;
}

interface GroupDepartmentLink {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface IncidentsLink {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface SidebarClientProps {
  dbUser: {
    id: string;
    role: string | null;
    departmentId: string | null;
    clerkId: string | null;
  };
  unreadNotificationsProps: Notification[];
  // groupsDepartmentLink: GroupDepartmentLink[];
  departments: Department[];
  usersFromDB: UserFromDB[];
}

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

export default function SidebarClient({
  dbUser,
  unreadNotificationsProps,
  // groupsDepartmentLink,
  departments,
  usersFromDB,
}: SidebarClientProps) {
  const [unreadNot, setUnreadNot] = useState<Notification[]>([]);
  const [unreadIncidentsCount, setUnreadIncidentsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    // Fetch initial data
    const fetchInitialData = async () => {
      const { unReadNotifications } = await getNotifications();
      if (isMounted && unReadNotifications) {
        setUnreadNot(unReadNotifications);
      }

      const { count } = await getUnreadIncidentsCount();
      if (isMounted && count !== undefined) {
        setUnreadIncidentsCount(count);
      }
    };

    fetchInitialData();

    // Setup Supabase channels and subscriptions
    const handleNotification = (payload: any) => {
      const newNotification = payload.payload;

      // Ensure the notification is for the current user
      if (newNotification.recipientId !== dbUser.id) {
        return;
      }

      setUnreadNot((prev) => {
        const exists = prev.some((n) => n.id === newNotification.id);
        if (exists) return prev;
        return [...prev, { ...newNotification }];
      });

      if (newNotification.type === "INCIDENT") {
        setUnreadIncidentsCount((prev) => prev + 1);
      }
    };

    const handleIncidentRead = (payload: any) => {
      const { userId } = payload.payload;
      if (userId === dbUser.id) {
        setUnreadIncidentsCount((prev) => Math.max(0, prev - 1));
      }
    };

    const notificationChannel = supabase.channel("NOTIFICATION", {
      config: { presence: { key: dbUser.id } },
    });
    notificationChannel
      .on("broadcast", { event: "new-notification" }, handleNotification)
      .subscribe();

    const incidentReadChannel = supabase.channel("INCIDENT_READ_STATUS", {
      config: { presence: { key: dbUser.id } },
    });
    incidentReadChannel
      .on("broadcast", { event: "incident-read" }, handleIncidentRead)
      .subscribe();

    // Cleanup function
    return () => {
      isMounted = false;
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(incidentReadChannel);
    };
  }, [dbUser.id]); // Only re-run when dbUser.id changes

  const unreadNotifications = unreadNot;
  console.log(
    "unread notification",
    unreadNotifications.length,
    unreadNotifications
  );
  const notificationCounts = unreadNotifications.reduce((acc, notification) => {
    if (notification.url) {
      acc[notification.url] = (acc[notification.url] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // const incidentNotificationCount = Object.entries(notificationCounts).reduce(
  //   (acc, [url, count]) => {
  //     if (url.startsWith("/incidents")) {
  //       return acc + count;
  //     }
  //     return acc;
  //   },
  //   0
  // );

  const groupsDepartmentLink =
    dbUser.role === "admin"
      ? departments.map((dep) => ({
          title: dep.name,
          url: `/group-chat/${dep.id}`,
          icon: BlendIcon,
        }))
      : [
          {
            title:
              departments.find((dep) => dep.id === dbUser.departmentId)?.name ||
              "General",
            url: `/group-chat/${dbUser.departmentId}`,
            icon: BlendIcon,
          },
        ];

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Incidents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {incidentsLink.map((item) => {
                const isIncidentParent = item.url === "/incidents";
                const count = isIncidentParent ? unreadIncidentsCount : 0;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className="flex justify-between items-center w-full"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon />
                          <span>{item.title}</span>
                        </div>
                        {count > 0 && (
                          <Badge className="h-5 w-5 flex items-center justify-center p-0">
                            {count}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Departments Groups</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupsDepartmentLink.map((item) => {
                const count = notificationCounts[item.url] || 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className="flex justify-between items-center w-full"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon />
                          <span>{item.title}</span>
                        </div>
                        {count > 0 && (
                          <Badge className="h-5 w-5 flex items-center justify-center p-0">
                            {count}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className=" h-full">
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key={dbUser.id}>
                <SidebarMenuButton asChild>
                  <a
                    href={`/direct-chat/${dbUser.clerkId}`}
                    className="flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300 flex justify-center items-center">
                      {<NotebookIcon className="w-5 h-5" />}
                    </div>
                    <span>Saved Message</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {usersFromDB.map((dbUser) => {
                const url = `/direct-chat/${dbUser.clerkId}`;
                const count = notificationCounts[url] || 0;
                return (
                  <SidebarMenuItem key={dbUser.id}>
                    <SidebarMenuButton asChild>
                      <a
                        href={url}
                        className="flex justify-between items-center w-full"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                            {dbUser.imageUrl ? (
                              <Image
                                src={dbUser.imageUrl}
                                alt={dbUser.username || "user"}
                                width={20}
                                height={20}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-400 text-white flex items-center justify-center text-sm font-semibold">
                                {dbUser.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span>{dbUser.username}</span>
                        </div>
                        {count > 0 && (
                          <Badge className="h-5 w-5 flex items-center justify-center p-0">
                            {count}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
          <div className="mt-auto">
            <SearchUsers />
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {dbUser.role === "admin" && (
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
      </SidebarFooter>
    </Sidebar>
  );
}
