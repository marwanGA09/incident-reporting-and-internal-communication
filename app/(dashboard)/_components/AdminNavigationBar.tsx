import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

import {
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"; // or from '@radix-ui/react-navigation-menu'

export function AdminNavigationBar() {
  return (
    <NavigationMenuPrimitive>
      <NavigationMenuList>
        <NavigationMenuItem>
            <button>Create new Department</button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/chat">Chat</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Add more items here */}
      </NavigationMenuList>
    </NavigationMenuPrimitive>
  );
}
