"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { Label } from "../ui/label";
export interface InputDateProps {
  label?: string;
  onSelect?: (date?: Date) => void;
}
export function InputDate(props: InputDateProps) {
  const [date, setDate] = React.useState<Date>();
  const handleSelect = React.useCallback(
    (date?: Date) => {
      setDate(date);
      if (props.onSelect) {
        props.onSelect(date);
      }
    },
    [props]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-col gap-2">
          {props.label && <Label>{props.label}</Label>}
          <Button
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            variant={"outline"}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className=" w-full p-0">
        <Calendar
          initialFocus
          className="w-full"
          mode="single"
          selected={date}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
