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
          <Link href="/dashboard/users" legacyBehavior passHref>
            <a className={navigationMenuTriggerStyle()}>Users</a>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenuPrimitive>
  );
}
