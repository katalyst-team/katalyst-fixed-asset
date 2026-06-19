"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DatePickerProps = {
  buttonClassName?: string;
  className?: string;
  disabled?: boolean;
  format?: "long" | "short";
  id?: string;
  maxDate?: Date;
  minDate?: Date;
  onChangeAction: (date?: Date) => void;
  placeholder?: string;
  value?: Date;
};

function formatDate(date: Date | undefined, format: "long" | "short" = "long"): string {
  if (!date) return "";
  
  if (format === "short") {
    // Return dd/mm/yyyy format
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined): boolean {
  if (!date) return false;
  return !isNaN(date.getTime());
}

export function DatePicker({
  buttonClassName,
  className,
  disabled,
  format = "long",
  id,
  maxDate,
  minDate,
  placeholder = "June 01, 2025",
  value,
  onChangeAction,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value);
  const [textValue, setTextValue] = React.useState<string>(formatDate(value, format));

  React.useEffect(() => {
    setTextValue(formatDate(value, format));
    setMonth(value);
  }, [value, format]);

  const isDisabled = React.useCallback(
    (date: Date) => {
      if (disabled) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    },
    [disabled, minDate, maxDate]
  );

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="relative flex w-full gap-2">
        <Input
          className={cn("bg-background pr-10", buttonClassName)}
          disabled={disabled}
          id={id}
          placeholder={placeholder}
          value={textValue}
          onChange={(e) => {
            const nextText = e.target.value;
            setTextValue(nextText);
            
            let parsed: Date | undefined;
            
            if (format === "short") {
              // Try to parse dd/mm/yyyy format
              const dateParts = nextText.split("/");
              if (dateParts.length === 3) {
                const [day, month, year] = dateParts.map(Number);
                if (day && month && year && day <= 31 && month <= 12) {
                  parsed = new Date(year, month - 1, day);
                }
              }
            } else {
              // Use default Date parsing for long format
              parsed = new Date(nextText);
            }
            
            if (isValidDate(parsed) && !isDisabled(parsed!)) {
              onChangeAction(parsed);
              setMonth(parsed);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              className="absolute right-2 top-1/2 size-6 -translate-y-1/2"
              disabled={disabled}
              id={`${id ?? "date"}-picker`}
              variant="ghost"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            alignOffset={-8}
            className="w-auto overflow-hidden p-0"
            sideOffset={10}
          >
            <Calendar
              captionLayout="dropdown"
              disabled={isDisabled}
              mode="single"
              month={month}
              selected={value}
              onMonthChange={setMonth}
              onSelect={(date) => {
                onChangeAction(date ?? undefined);
                setTextValue(formatDate(date, format));
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
