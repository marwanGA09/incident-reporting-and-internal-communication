import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, MessageCircle, AlertTriangle, BarChart } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-h-w-screen bg-gray-700 dark:bg-neutral-900 w-[80%] sm:w-[100%] md:w-[100%] lg:w-[100%]  h-auto p-6 rounded-2xl shadow-lg aspect-video w-96">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Incident Reporting & Communication
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Stay informed. Report quickly. Communicate effectively.
          </p>
        </header>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Report Incident */}
          <Card className="bg-white dark:bg-neutral-800 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" /> Report Incident
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Quickly log safety or operational incidents.
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Report Now
              </Button>
            </CardContent>
          </Card>

          {/* Internal Communication */}
          <Card className="bg-white dark:bg-neutral-800 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <MessageCircle className="h-5 w-5" /> Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Send updates and collaborate with your team.
              </p>
              <Link href="/" />
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Open Chat
              </Button>
            </CardContent>
          </Card>

          {/* Reports & Analytics */}
          <Card className="bg-white dark:bg-neutral-800 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <BarChart className="h-5 w-5" /> Reported Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Track incidents & communication analytics.
              </p>
              <Link href="/incidents">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
// End of the updated code for the home page component