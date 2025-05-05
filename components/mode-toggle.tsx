"use client";

import { Laptop, Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropDrawer,
  DropDrawerContent,
  DropDrawerItem,
  DropDrawerTrigger,
} from "@/components/ui/dropdrawer";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropDrawer>
      <DropDrawerTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropDrawerTrigger>
      <DropDrawerContent align="end">
        <DropDrawerItem
          onClick={() => setTheme("light")}
          icon={<Sun className="h-4 w-4" />}
        >
          Light
        </DropDrawerItem>
        <DropDrawerItem
          onClick={() => setTheme("dark")}
          icon={<Moon className="h-4 w-4" />}
        >
          Dark
        </DropDrawerItem>
        <DropDrawerItem
          onClick={() => setTheme("system")}
          icon={<Laptop className="h-4 w-4" />}
        >
          System
        </DropDrawerItem>
      </DropDrawerContent>
    </DropDrawer>
  );
}
