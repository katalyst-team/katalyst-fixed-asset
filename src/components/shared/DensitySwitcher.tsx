"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserPreferences } from "@/context/user-preferences-context";

type Density = "comfortable" | "compact";

interface DensityContextValue {
  density: Density;
  setDensity: (density: Density) => void;
}

const DensityContext = React.createContext<DensityContextValue | undefined>(
  undefined,
);

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const { preferences, setDensity } = useUserPreferences();
  const density = preferences?.density ?? "comfortable";

  React.useEffect(() => {
    const root = document.documentElement;
    if (density === "compact") {
      root.classList.add("density-compact");
      root.classList.remove("density-comfortable");
    } else {
      root.classList.add("density-comfortable");
      root.classList.remove("density-compact");
    }
  }, [density]);

  const handleSetDensity = (newDensity: Density) => {
    setDensity(newDensity);
  };

  return (
    <DensityContext.Provider value={{ density, setDensity: handleSetDensity }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  const context = React.useContext(DensityContext);
  if (!context) {
    throw new Error("useDensity must be used within DensityProvider");
  }
  return context;
}

export function DensitySwitcher() {
  const { density, setDensity } = useDensity();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="ks-btn ks-btn-icon" size="icon" variant="ghost">
          <LayoutGrid className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch layout density</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setDensity("comfortable")}>
          <LayoutList className="mr-2 h-4 w-4" />
          <span>Comfortable</span>
          {density === "comfortable" && <div className="ml-auto h-4 w-4 rounded-full bg-current" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setDensity("compact")}>
          <LayoutGrid className="mr-2 h-4 w-4" />
          <span>Compact</span>
          {density === "compact" && <div className="ml-auto h-4 w-4 rounded-full bg-current" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
