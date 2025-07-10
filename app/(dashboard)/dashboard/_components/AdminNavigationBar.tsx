"use client";

import {
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { CreateDepartmentDialog } from "./CreateDepartmentDialog";
import { CreateCategoryDialog } from "./CreateCategoryDialog";

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
          {/* <CreateSomethingNewDialog /> */}
          <CreateDepartmentDialog />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/chat">Chat</Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenuPrimitive>
  );
}
