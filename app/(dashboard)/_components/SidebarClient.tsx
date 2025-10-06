"use client";

import {
  BookmarkIcon,
  Building2Icon,
  HomeIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldPlusIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getNotifications, getUnreadIncidentsCount } from "@/app/lib/actions";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Department, Notification } from "@prisma/client";
import SearchUsers from "./SearchUser";

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

interface SidebarClientProps {
  dbUser: {
    id: string;
    role: string | null;
    departmentId: string | null;
    clerkId: string | null;
  };
  unreadNotificationsProps: Notification[];
  departments: Department[];
  usersFromDB: UserFromDB[];
}

const homeLink = {
  title: "Home",
  url: "/",
  icon: HomeIcon,
};

const incidentsLinks = [
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

const adminSubLinks = [
  {
    title: "Users",
    url: "/dashboard/users",
    icon: UsersIcon,
  },
  {
    title: "Incident Management",
    url: "/dashboard/incidents",
    icon: ShieldAlertIcon,
  },
  {
    title: "General",
    url: "/dashboard",
    icon: SettingsIcon,
  },
];

export default function SidebarClient({
  dbUser,
  unreadNotificationsProps,
  departments,
  usersFromDB,
}: SidebarClientProps) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const [unreadNot, setUnreadNot] = useState<Notification[]>(
    unreadNotificationsProps
  );
  const [unreadIncidentsCount, setUnreadIncidentsCount] = useState(0);

  const activeClass = "bg-primary text-primary-foreground hover:bg-primary/90";

  useEffect(() => {
    let isMounted = true;

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

    const handleNotification = (payload: any) => {
      const newNotification = payload.payload;

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

    return () => {
      isMounted = false;
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(incidentReadChannel);
    };
  }, [dbUser.id]);

  const notificationCounts = unreadNot.reduce((acc, notification) => {
    if (notification.url) {
      acc[notification.url] = (acc[notification.url] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const groupsDepartmentLink =
    dbUser.role === "admin"
      ? departments.map((dep) => ({
          title: dep.name,
          url: `/group-chat/${dep.id}`,
          icon: Building2Icon,
        }))
      : departments
          .filter((dep) => dep.id === dbUser.departmentId)
          .map((dep) => ({
            title: dep.name,
            url: `/group-chat/${dep.id}`,
            icon: Building2Icon,
          }));

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SearchUsers />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={homeLink.title}
              className={cn(pathname === homeLink.url && activeClass)}
            >
              <Link
                href={homeLink.url}
                className="flex justify-between items-center w-full"
              >
                <div className="flex items-center gap-2">
                  <homeLink.icon className="size-5 shrink-0" />
                  <span>{homeLink.title}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel>Incidents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {incidentsLinks.map((item) => {
                const isNewIncidentFlow = pathname.startsWith("/incidents/new");

                let isActive;
                if (item.url.includes("/new")) {
                  isActive = isNewIncidentFlow;
                } else {
                  isActive =
                    (pathname === "/incidents" || pathname.startsWith("/incidents/")) &&
                    !isNewIncidentFlow;
                }

                const isIncidentParent = item.url === "/incidents";
                const count = isIncidentParent ? unreadIncidentsCount : 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(isActive && activeClass)}
                    >
                      <Link
                        href={item.url}
                        className="flex justify-between items-center w-full"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="size-5 shrink-0" />
                          <span>{item.title}</span>
                        </div>
                        {count > 0 && (
                          <Badge className="h-5 w-5 flex items-center justify-center p-0">
                            {count}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {dbUser.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin Dashboard">
                    <div
                      className={cn(
                        !open &&
                          pathname.startsWith("/dashboard") &&
                          activeClass,
                        "flex items-center gap-2"
                      )}
                    >
                      <LayoutDashboardIcon className="size-5 shrink-0" />
                      <span>Dashboard</span>
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    {adminSubLinks.map((link) => {
                      const isActive = pathname === link.url;
                      return (
                        <SidebarMenuSubItem key={link.url}>
                          <SidebarMenuSubButton
                            asChild
                            className={cn(isActive && activeClass)}
                          >
                            <Link href={link.url}>
                              <link.icon className="size-5 shrink-0" />
                              <span>{link.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Departments</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupsDepartmentLink.map((item) => {
                const isActive = pathname === item.url;
                const count = notificationCounts[item.url] || 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(isActive && activeClass)}
                    >
                      <Link
                        href={item.url}
                        className="flex justify-between items-center w-full"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="size-5 shrink-0" />
                          <span>{item.title}</span>
                        </div>
                        {count > 0 && (
                          <Badge className="h-5 w-5 flex items-center justify-center p-0">
                            {count}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="h-full">
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Saved Messages"
                  className={cn(
                    pathname === `/direct-chat/${dbUser.clerkId}` && activeClass
                  )}
                >
                  <Link
                    href={`/direct-chat/${dbUser.clerkId}`}
                    className="flex items-center gap-2"
                  >
                    <BookmarkIcon className="size-5 shrink-0" />
                    <span>Saved Messages</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {usersFromDB.map((user) => {
                const url = `/direct-chat/${user.clerkId}`;
                const isActive = pathname === url;
                const count = notificationCounts[url] || 0;
                return (
                  <SidebarMenuItem key={user.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={user.username || "User"}
                      className={cn(isActive && activeClass)}
                    >
                      <Link
                        href={url}
                        className="flex justify-between items-center w-full"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="size-5">
                            <AvatarImage
                              src={user.imageUrl || ""}
                              alt={user.username || "user"}
                            />
                            <AvatarFallback>
                              {user.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.username}</span>
                        </div>
                        {count > 0 && (
                          <Badge className="h-5 w-5 flex items-center justify-center p-0">
                            {count}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* User profile button or other items can go here */}
      </SidebarFooter>
    </Sidebar>
  );
}
