import { Grid2X2Check, ShieldCheckIcon, ShieldPlusIcon } from "lucide-react";

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
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

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
const groupsDeparmentLink = [
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
  const User = await currentUser();
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
          <SidebarGroupLabel>Deparments Groups</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupsDeparmentLink.map((item) => (
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
              {groupsDeparmentLink.map((item) => (
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
        {User?.publicMetadata.role === "admin" && (
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
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  );
}
