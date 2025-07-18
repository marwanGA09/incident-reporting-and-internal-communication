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
  console.log(`${user?.publicMetadata?.departmentId}`);
  console.log(
    "DKLJF",
    (await getDepartments()).map((dep) => {
      return {
        title: dep.name,
        url: `/group-chat/${dep.id}`,
        icon: BlendIcon,
      };
    })
  );
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
  // if (!isLoaded) return;
  if (!user) return;
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
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatLink.map((item) => (
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
