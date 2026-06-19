"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserPreferences } from "@/context/user-preferences-context";

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  const { preferences, setTheme: setUserTheme, isLoading } = useUserPreferences();

  const handleSetTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    setUserTheme(newTheme);
  };

  const currentTheme = preferences?.theme ?? theme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="ks-btn ks-btn-icon" disabled={isLoading} size="icon" variant="ghost">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSetTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {currentTheme === "light" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {currentTheme === "dark" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {currentTheme === "system" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
