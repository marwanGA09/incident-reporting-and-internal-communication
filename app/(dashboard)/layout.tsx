import React from "react";
import { NavigationMenu } from "./_components/Navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/Sidebar";
import UserMetadataGuard from "../_components/UserMetadataGuard";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserMetadataGuard>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
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

export default DashboardLayout;
