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

import { createDeparment } from "@/app/lib/actions";
import { useRef, useState, useTransition } from "react";

export function AdminNavigationBar() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false); // 🔁 Dialog control

  const changeDialog = (state: boolean) => {
    setOpen(state);
  };

  function handleSubmit(formData: FormData) {
    startTransition(() => {
      createDeparment(formData)
        .then(() => {
          formRef.current?.reset();
          changeDialog(false);
        })
        .catch((err) => {
          console.error("Failed to create department:", err);
        });
    });
  }
  return (
    <NavigationMenuPrimitive>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Dialog open={open}>
              <DialogTrigger asChild>
                <button
                  onClick={() => changeDialog(true)}
                  className="data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4"
                >
                  Create new Department
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create new Department</DialogTitle>
                  <DialogDescription>
                    This department will be able to receive incidents and
                    messages.
                  </DialogDescription>
                </DialogHeader>
                <form
                  ref={formRef}
                  action={handleSubmit}
                  className="grid gap-4 py-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="name">Department name</Label>
                    <Input id="name" name="name" placeholder="IT" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="it@obn.com"
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => changeDialog(false)}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Creating..." : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
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
