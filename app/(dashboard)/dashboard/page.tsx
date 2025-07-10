// import React from "react";
// import { DepartmentsScroll } from "./_components/DepartmentsScroll";
// import { AdminNavigationBar } from "./_components/AdminNavigationBar";
// import { IncidentCategoryScroll } from "./_components/IncidentCategoryScroll";

// function page() {
//   return (
//     <div className="p-4">
//       <h1 className="text-4xl text-green-500 pl-8 pt-4 italic">
//         Admin Dashboard
//       </h1>
//       <AdminNavigationBar />
//       <div className="flex items-center justify-between  py-5">
//         <div className="flex items-center gap-4">
//           {/* <h2 className="text-3xl my-4">Departments</h2> */}
//           <DepartmentsScroll />
//           <IncidentCategoryScroll />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default page;
import React from "react";
import { DepartmentsScroll } from "./_components/DepartmentsScroll";
import { AdminNavigationBar } from "./_components/AdminNavigationBar";
import { IncidentCategoryScroll } from "./_components/IncidentCategoryScroll";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground ">
      <div className="border-b bg-card shadow-sm p-6  pl-24">
        <h1 className="text-3xl font-bold text-green-600 italic">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage departments, categories, and more
        </p>
      </div>

      <div className="max-w-6xl px-4  py-8 space-y-8">
        <section className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Quick Actions</h2>
          <AdminNavigationBar />
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="  p-6 space-y-4">
            <h2 className="text-xl font-semibold">Departments</h2>
            <DepartmentsScroll />
          </div>

          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Incident Categories</h2>
            <IncidentCategoryScroll />
          </div>
        </section>
      </div>
    </div>
  );
}
