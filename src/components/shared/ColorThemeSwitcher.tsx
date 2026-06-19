"use client";

import { Check, Palette } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserPreferences } from "@/context/user-preferences-context";

const COLOR_THEMES = [
  {
    colors: {
      primary: "217 91% 60%",
      primaryDark: "224 76% 48%",
      primaryLight: "214 95% 87%",
      secondary: "28 90% 55%",
    },
    id: "blue",
    name: "Deep Blue & Orange",
  },
  {
    colors: {
      primary: "173 80% 40%",
      primaryDark: "160 70% 35%",
      primaryLight: "167 85% 89%",
      secondary: "220 13% 18%",
    },
    id: "green",
    name: "Forest Green & Charcoal",
  },
  {
    colors: {
      primary: "249 90% 66%",
      primaryDark: "250 75% 55%",
      primaryLight: "250 95% 90%",
      secondary: "35 92% 55%",
    },
    id: "indigo",
    name: "Indigo & Amber",
  },
  {
    colors: {
      primary: "199 89% 48%",
      primaryDark: "200 85% 40%",
      primaryLight: "204 94% 94%",
      secondary: "215 25% 27%",
    },
    id: "slate",
    name: "Slate & Cyan",
  },
  {
    colors: {
      primary: "270 76% 53%",
      primaryDark: "270 70% 45%",
      primaryLight: "270 90% 92%",
      secondary: "173 80% 40%",
    },
    id: "purple",
    name: "Purple & Teal",
  },
] as const;

type ColorThemeId = (typeof COLOR_THEMES)[number]["id"];

export function ColorThemeSwitcher() {
  const { preferences, setColorTheme, isLoading } = useUserPreferences();
  const activeTheme = preferences?.color_theme ?? "blue";

  const applyTheme = React.useCallback((themeId: ColorThemeId) => {
    const theme = COLOR_THEMES.find((t) => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;

    root.style.setProperty("--primary", theme.colors.primary);
    root.style.setProperty("--brand", theme.colors.primary);
    root.style.setProperty("--brand-2", theme.colors.primaryDark);
    root.style.setProperty("--brand-soft", theme.colors.primaryLight);
    root.style.setProperty("--brand-ink", theme.colors.primaryDark);
    root.style.setProperty("--accent", theme.colors.secondary);

    setColorTheme(themeId);
  }, [setColorTheme]);

  React.useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme, applyTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="ks-btn ks-btn-icon" disabled={isLoading} size="icon" variant="ghost">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch color theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {COLOR_THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
          >
            <div
              className="mr-2 h-4 w-4 rounded-full border"
              style={{
                backgroundColor: `hsl(${theme.colors.primary})`,
              }}
            />
            <span>{theme.name}</span>
            {activeTheme === theme.id && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
