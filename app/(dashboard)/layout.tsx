import React from "react";
import { NavigationMenu } from "./_components/Navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/Sidebar";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // <div className="h-full">
    //   <div className="mt-[120px] bg-blue-800">
    //     <div className="bg-red-400 hidden md:flex flex-col  w-56 fixed inset-y-0 mt-[80px] z-50">
    //       <h1>side bar</h1>
    //     </div>
    //     <main className="bg-green-600 md:pl-56 pt-[18px] ">
    //       <h1>main</h1>
    //       {children}
    //     </main>
    //   </div>
    // </div>

    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-screen flex flex-col">
        <div className=" bg-amber-600 h-[80px] flex items-center justify-end  px-6  inset-y-0 w-full z-50 ">
          <NavigationMenu />
        </div>
        <SidebarTrigger />
        <div className="abslute top-[80px] bottom-0 bg-blue-600 flex-grow">
          <h1>sjksf</h1>
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

export default DashboardLayout;
