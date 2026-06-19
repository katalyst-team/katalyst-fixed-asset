"use client";

import { Check, ChevronDown, Columns, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColumnDefinition } from "@/hooks/useColumnVisibility";
import { cn } from "@/lib/utils";

interface ColumnVisibilityProps {
  columns: ColumnDefinition[];
  visibleColumnIds: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  isInitialized?: boolean;
}

const ColumnVisibility: React.FC<ColumnVisibilityProps> = ({
  columns,
  visibleColumnIds,
  onToggleColumn,
  onShowAll,
  onHideAll,
  isInitialized = true,
}) => {
  const { t } = useTranslation("common");

  const handleToggle = useCallback(
    (columnId: string) => {
      onToggleColumn(columnId);
    },
    [onToggleColumn]
  );

  if (!isInitialized) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Columns className="mr-2 h-4 w-4" />
          {t("columnVisibility.button", "Columns")}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <div className="flex flex-col">
          {/* Header with actions */}
          <div className="flex items-center justify-between border-b p-3">
            <span className="text-sm font-medium">
              {t("columnVisibility.title", "Show Columns")}
            </span>
            <div className="flex gap-1">
              <Button
                className="h-7 px-2 text-xs"
                size="sm"
                variant="ghost"
                onClick={onShowAll}
              >
                <Eye className="mr-1 h-3 w-3" />
                {t("columnVisibility.showAll", "All")}
              </Button>
              <Button
                className="h-7 px-2 text-xs"
                size="sm"
                variant="ghost"
                onClick={onHideAll}
              >
                <EyeOff className="mr-1 h-3 w-3" />
                {t("columnVisibility.hideAll", "None")}
              </Button>
            </div>
          </div>

          {/* Column list */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {columns.map((column) => {
              const isVisible = visibleColumnIds.has(column.id);

              return (
                <div
                  key={column.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    !isVisible && "opacity-50"
                  )}
                  onClick={() => handleToggle(column.id)}
                >
                  <Checkbox
                    checked={isVisible}
                    className="pointer-events-none"
                  />
                  <span className="flex-1 truncate">{column.label}</span>
                  {isVisible && (
                    <Check className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer with count */}
          <div className="border-t p-2 text-center">
            <span className="text-xs text-muted-foreground">
              {t("columnVisibility.showing", "Showing {{count}} of {{total}} columns", {
                count: Array.from(visibleColumnIds).filter((id) =>
                  columns.some((col) => col.id === id)
                ).length,
                total: columns.length,
              })}
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColumnVisibility;
