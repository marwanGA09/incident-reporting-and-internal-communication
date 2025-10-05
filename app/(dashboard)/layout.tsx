import React from "react";
import { NavigationMenu } from "./_components/Navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/Sidebar";
import UserMetadataGuard from "../_components/UserMetadataGuard";
import { currentUser } from "@clerk/nextjs/server";
import { NotificationBell } from "./_components/NotificationBell";

async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) return null;
  return (
    <UserMetadataGuard>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="w-full h-screen flex flex-col">
          <div className="bg-primary-foreground h-[80px] flex items-center justify-between px-6 inset-y-0 w-full z-10">
            <div className="flex items-center gap-x-2 h-full">
              <SidebarTrigger />
              <div className="flex items-center gap-x-2 ml-4">
                <img
                  src="/obn-logo.png"
                  alt="OBN Logo"
                  className="h-8 w-auto"
                />
                {/* <span className="text-xl font-bold">OBN</span> */}
              </div>
            </div>
            <div className="flex items-center gap-x-4 h-full">
              <NotificationBell />
            </div>
          </div>
          <div className="inset-y-0 w-full">
            <div className="w-full overflow-y-auto">{children}</div>
          </div>
        </main>
      </SidebarProvider>
    </UserMetadataGuard>
  );
}

export default DashboardLayout;
