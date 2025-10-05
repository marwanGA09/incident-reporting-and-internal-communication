"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { Users, AlertTriangle } from "lucide-react";
import Link from "next/link";
export function AdminNavigationBar() {
  return (
    <NavigationMenuPrimitive>
      <NavigationMenuList className="flex gap-4">
        <NavigationMenuItem>
          <Link href="/dashboard/users" passHref>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Users
            </Button>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/dashboard/incidents" passHref>
            <Button variant="outline" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Incidents
            </Button>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenuPrimitive>
  );
}
