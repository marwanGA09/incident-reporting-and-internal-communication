import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StatsCards } from "./StatsCards";
import { IncidentFeed } from "./IncidentFeed";
import { Charts } from "./Charts";

export default function HomePage() {
  return (
    <div className="p-6 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/incidents/new">
          <Button>Report New Incident</Button>
        </Link>
      </div>
      <StatsCards />
      <IncidentFeed />
      <Charts />
    </div>
  );
}
