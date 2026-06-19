"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { Label } from "./label";

export interface ComboboxCreatableOptionsProps {
  value: string;
  label: string;
}

export interface ComboboxCreatableProps {
  options: ComboboxCreatableOptionsProps[];
  onSelect: (value?: string) => void;
  placeholder: string;
  label?: string;
  isRequired?: boolean;
  value?: string;
}

export function ComboboxCreatable(props: ComboboxCreatableProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(props.value || "");
  const [inputValue, setInputValue] = React.useState("");

  // Update value when props.value changes
  useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value);
    }
  }, [props.value]);

  return (
    <div className="flex flex-col gap-2">
      {props.label && (
        <Label>
          {props.label}
          {props.isRequired && (
            <span className="text-red-500 text-base">*</span>
          )}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="w-full justify-between"
            role="ComboboxCreatable"
            variant="outline"
          >
            {value
              ? props.options.find((option) => option.value === value)?.label ||
                value
              : props.placeholder}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="min-w-[var(--radix-popper-anchor-width)] w-full max-w-full p-0"
        >
          <Command className="w-full max-w-full">
            <CommandInput
              className="w-full max-w-full"
              placeholder={props.placeholder}
              onValueChange={setInputValue}
            />
            <CommandList className="w-full max-w-full max-h-[300px] overflow-y-auto">
              <CommandEmpty className="w-full p-2">
                <Button
                  className="w-full justify-start text-left font-normal"
                  variant="ghost"
                  onClick={() => {
                    if (inputValue) {
                      setValue(inputValue);
                      props.onSelect(inputValue);
                      setOpen(false);
                    }
                  }}
                >
                  Create &ldquo;{inputValue}&rdquo;
                </Button>
              </CommandEmpty>
              <CommandGroup className="w-full">
                {props.options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      const isDeselect = option.value === value;
                      setValue(isDeselect ? "" : option.value);
                      props.onSelect(isDeselect ? undefined : option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
