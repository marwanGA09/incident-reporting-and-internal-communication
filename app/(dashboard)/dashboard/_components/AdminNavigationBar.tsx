"use client";

import {
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { CreateDepartmentDialog } from "./CreateDepartmentDialog";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import Link from "next/link";

export function AdminNavigationBar() {
  return (
    <NavigationMenuPrimitive>
      <NavigationMenuList>
        <NavigationMenuItem>
          <CreateDepartmentDialog />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <CreateCategoryDialog />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/dashboard/users" passHref>
            <span className={navigationMenuTriggerStyle()}>Users</span>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/dashboard/departments" passHref>
            <span className={navigationMenuTriggerStyle()}>Departments</span>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/dashboard/categories" passHref>
            <span className={navigationMenuTriggerStyle()}>Categories</span>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/dashboard/incidents" passHref>
            <a className={navigationMenuTriggerStyle()}>Incidents</a>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/dashboard/analytics" passHref>
            <a className={navigationMenuTriggerStyle()}>Analytics</a>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenuPrimitive>
  );
}
