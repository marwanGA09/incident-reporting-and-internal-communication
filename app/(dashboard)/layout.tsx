import React from 'react';
import Sidebar from './_components/Sidebar';
import { NavigationMenu } from './_components/Navbar';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      <div className="h-[60px] flex items-center justify-end  px-6 fixed inset-y-0 w-full z-50 bg-amber-50 ">
        <NavigationMenu />
      </div>
      <div className="hidden md:flex flex-col h-full w-56 fixed inset-y-0 mt-[60px] z-50">
        <Sidebar />
      </div>
      <main className="md:pl-56 pt-[18px] h-full">{children}</main>
    </div>
  );
}

export default DashboardLayout;
