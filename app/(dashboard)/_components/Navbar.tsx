// import { UserButton } from "@clerk/nextjs";

import { NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import Link from "next/link";

// function Navbar() {
//   return (
//     <div className="h-full p-4 border-b flex items-center  shadow-sm">
//     <p>  Nav bar</p>
//     <UserButton/>
//     </div>
//   );
// }

// export default Navbar;



import {
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"; // or from '@radix-ui/react-navigation-menu'
import { UserButton } from "@clerk/nextjs";

export function NavigationMenu() {
  return (
    <NavigationMenuPrimitive>
      <NavigationMenuList >
        <NavigationMenuItem >
          <NavigationMenuLink asChild >
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
    </NavigationMenuPrimitive>
  );
}
