import React from "react";
import { AdminNavigationBar } from "../_components/AdminNavigationBar";

function page() {
  return (
    <div className="p-4">
      <h1 className="text-4xl text-green-500 pl-8 pt-4 italic">
        Admin Dashboard
      </h1>
      <AdminNavigationBar />
      {/* <div className="flex items-center justify-between"></div> */}
    </div>
  );
}

export default page;
