import React from "react";
import { DepartmentsScroll } from "./_components/DepartmentsScroll";
import { AdminNavigationBar } from "./_components/AdminNavigationBar";

function page() {
  return (
    <div className="p-4">
      <h1 className="text-4xl text-green-500 pl-8 pt-4 italic">
        Admin Dashboard
      </h1>
      <AdminNavigationBar />
      <div className="flex items-center justify-between  py-5">
        <div className="flex items-center flex-col">
          {/* <h2 className="text-3xl my-4">Departments</h2> */}
          <DepartmentsScroll />
        </div>
      </div>
    </div>
  );
}

export default page;
