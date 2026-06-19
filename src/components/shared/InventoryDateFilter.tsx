"use client";

import { format, parseISO } from "date-fns";
import { CalendarDays, CalendarIcon, X } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface InventoryDateFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onChange: (dateFrom?: string, dateTo?: string) => void;
}

const toStartOfDayISO = (date: Date): string => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString();
};

const toEndOfDayISO = (date: Date): string => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy.toISOString();
};

const getPresets = () => {
  const today = new Date();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const monday = new Date(today);
  const day = today.getDay();
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return [
    { dateFrom: toStartOfDayISO(today), dateTo: toEndOfDayISO(today), key: "today", label: "Today" },
    {
      dateFrom: toStartOfDayISO(yesterday),
      dateTo: toEndOfDayISO(yesterday),
      key: "yesterday",
      label: "Yesterday",
    },
    {
      dateFrom: toStartOfDayISO(monday),
      dateTo: toEndOfDayISO(today),
      key: "thisWeek",
      label: "This Week",
    },
    {
      dateFrom: toStartOfDayISO(firstOfMonth),
      dateTo: toEndOfDayISO(today),
      key: "thisMonth",
      label: "This Month",
    },
  ];
};

const fmtDisplay = (iso: string): string => {
  try {
    return format(parseISO(iso), "dd/MM/yyyy");
  } catch {
    return iso;
  }
};

const formatLabel = (dateFrom?: string, dateTo?: string): string | null => {
  if (!dateFrom && !dateTo) return null;
  const match = getPresets().find(
    (p) => p.dateFrom === dateFrom && p.dateTo === dateTo
  );
  if (match) return match.label;
  if (dateFrom && dateTo) return `${fmtDisplay(dateFrom)} – ${fmtDisplay(dateTo)}`;
  if (dateFrom) return `From ${fmtDisplay(dateFrom)}`;
  if (dateTo) return `Until ${fmtDisplay(dateTo)}`;
  return null;
};

const InventoryDateFilter = ({
  dateFrom,
  dateTo,
  onChange,
}: InventoryDateFilterProps) => {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(dateFrom ?? "");
  const [customTo, setCustomTo] = useState(dateTo ?? "");
  const [activePresetKey, setActivePresetKey] = useState<string | null>(() => {
    const presets = getPresets();
    return presets.find((p) => p.dateFrom === dateFrom && p.dateTo === dateTo)?.key ?? null;
  });

  useEffect(() => {
    if (!dateFrom && !dateTo) setActivePresetKey(null);
  }, [dateFrom, dateTo]);

  const presets = getPresets();
  const activeLabel = formatLabel(dateFrom, dateTo);
  const isActive = Boolean(dateFrom || dateTo);

  const handlePreset = (key: string, from: string, to: string) => {
    setActivePresetKey(key);
    onChange(from, to);
    setCustomFrom(from);
    setCustomTo(to);
    setOpen(false);
  };

  const handleCustomApply = () => {
    setActivePresetKey(null);
    onChange(customFrom || undefined, customTo || undefined);
    setOpen(false);
  };

  const handleClear = () => {
    setActivePresetKey(null);
    onChange(undefined, undefined);
    setCustomFrom("");
    setCustomTo("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="relative h-8" size="sm" variant="outline">
          <CalendarDays className="mr-2 h-4 w-4" />
          {activeLabel ?? t("dateFilter.label", "Date")}
          {isActive && (
            <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
              1
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="space-y-3">
          <p className="text-sm font-medium">
            {t("dateFilter.title", "Filter by Date")}
          </p>

          <div className="grid grid-cols-2 gap-1">
            {presets.map((preset) => {
              const isSelected = activePresetKey === preset.key;
              return (
                <Button
                  key={preset.key}
                  className="h-8 text-xs"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handlePreset(preset.key, preset.dateFrom, preset.dateTo)}
                >
                  {t(`dateFilter.${preset.key}`, preset.label)}
                </Button>
              );
            })}
          </div>

          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground">
              {t("dateFilter.custom", "Custom Range")}
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("dateFilter.from", "From")}</Label>
              <Collapsible>
                <CollapsibleTrigger className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-xs hover:bg-accent hover:text-accent-foreground">
                  <span>{customFrom ? format(parseISO(customFrom), "dd/MM/yyyy") : <span className="text-muted-foreground">dd/mm/yyyy</span>}</span>
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 rounded-md border bg-background shadow-md">
                  <Calendar
                    initialFocus
                    mode="single"
                    selected={customFrom ? parseISO(customFrom) : undefined}
                    onSelect={(date) => {
                      if (date) setCustomFrom(toStartOfDayISO(date));
                    }}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("dateFilter.to", "To")}</Label>
              <Collapsible>
                <CollapsibleTrigger className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-xs hover:bg-accent hover:text-accent-foreground">
                  <span>{customTo ? format(parseISO(customTo), "dd/MM/yyyy") : <span className="text-muted-foreground">dd/mm/yyyy</span>}</span>
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 rounded-md border bg-background shadow-md">
                  <Calendar
                    initialFocus
                    mode="single"
                    selected={customTo ? parseISO(customTo) : undefined}
                    onSelect={(date) => {
                      if (date) setCustomTo(toEndOfDayISO(date));
                    }}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
            <Button className="h-8 w-full" size="sm" onClick={handleCustomApply}>
              {t("dateFilter.apply", "Apply")}
            </Button>
          </div>

          {isActive && (
            <Button
              className="h-8 w-full"
              size="sm"
              variant="ghost"
              onClick={handleClear}
            >
              <X className="mr-1 h-3 w-3" />
              {t("dateFilter.clear", "Clear Date Filter")}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InventoryDateFilter;
