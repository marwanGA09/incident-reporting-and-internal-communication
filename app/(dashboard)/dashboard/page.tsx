import { AdminNavigationBar } from "./_components/AdminNavigationBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentTable } from "./departments/_components/DepartmentTable";
import { CategoryTable } from "./categories/_components/CategoryTable";
import { IncidentsByDepartmentChart } from "./analytics/_components/IncidentsByDepartmentChart";
import { IncidentsByCategoryChart } from "./analytics/_components/IncidentsByCategoryChart";
import { CreateDepartmentDialog } from "./_components/CreateDepartmentDialog";
import { CreateCategoryDialog } from "./_components/CreateCategoryDialog";
import {
  getDepartments,
  getIncidentCategories,
  getIncidentsByDepartment,
  getIncidentsByCategory,
} from "@/app/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const departments = await getDepartments();
  const categories = await getIncidentCategories();
  const incidentsByDepartment = await getIncidentsByDepartment();
  const incidentsByCategory = await getIncidentsByCategory();

  return (
    <div className="p-6">
      <div className="border-b bg-card shadow-sm p-6">
        <h1 className="text-3xl font-bold text-green-600 italic">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage departments, categories, and more
        </p>
      </div>

      <div className="py-8 space-y-8">
        <section className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Quick Actions</h2>
          <AdminNavigationBar />
        </section>

        <Tabs defaultValue="departments" className="w-full">
          <TabsList>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="departments">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Manage Departments</h2>
              <CreateDepartmentDialog />
            </div>
            <DepartmentTable departments={departments} />
          </TabsContent>

          <TabsContent value="categories">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Manage Categories</h2>
              <CreateCategoryDialog />
            </div>
            <CategoryTable categories={categories} />
          </TabsContent>

          <TabsContent value="analytics">
            <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Incidents by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <IncidentsByDepartmentChart data={incidentsByDepartment} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Incidents by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <IncidentsByCategoryChart data={incidentsByCategory} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
