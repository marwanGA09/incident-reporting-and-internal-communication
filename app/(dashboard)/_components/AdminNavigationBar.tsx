import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

import {
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"; // or from '@radix-ui/react-navigation-menu'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function AdminNavigationBar() {
  return (
    <NavigationMenuPrimitive>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <button className="data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4">
                    Create new Department
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create new Deparment</DialogTitle>
                    <DialogDescription>
                      Create new Deparment that can have group chats in the
                      system. this department can take incident report from user
                      of this system{" "}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="name-1">Deparment name</Label>
                      <Input id="name-1" name="name" placeholder="IT" />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="username-1">email</Label>
                      <Input
                        id="username-1"
                        name="username"
                        type="email"
                        defaultValue="it@obn.com"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          </NavigationMenuLink>
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
