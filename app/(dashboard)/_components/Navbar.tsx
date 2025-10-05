"use client";
import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

import {
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"; // or from '@radix-ui/react-navigation-menu'
import { UserButton } from "@clerk/nextjs";

export function NavigationMenu() {
  return (
    <div className="h-full">
      <NavigationMenuPrimitive>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/incidents">Incidents</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/chat">Chat</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem className="pl-4">
            <NavigationMenuLink asChild>
              <UserButton />
            </NavigationMenuLink>
          </NavigationMenuItem>
          {/* Add more items here */}
        </NavigationMenuList>
      </NavigationMenuPrimitive>{" "}
    </div>
  );
}
