"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

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

export interface ComboboxOptionsProps {
  value: string;
  label: string;
}

export interface ComboboxProps {
  defaultValue?: string;
  disabled?: boolean;
  isRequired?: boolean;
  label?: string;
  onSearchChange?: (value: string) => void;
  onSelect: (value?: string) => void;
  options: ComboboxOptionsProps[];
  placeholder: string;
  value?: string;
}

export function Combobox(props: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  
  // Support both controlled and uncontrolled usage
  const isControlled = props.value !== undefined;
  const [internalValue, setInternalValue] = React.useState(props.defaultValue || "");
  
  const value = isControlled ? (props.value || "") : internalValue;
  
  // For controlled components, sync internal value when prop changes
  React.useEffect(() => {
    if (isControlled && props.value !== internalValue) {
      setInternalValue(props.value || "");
    }
  }, [isControlled, props.value, internalValue]);
  
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
            disabled={props.disabled}
            role="combobox"
            variant="outline"
          >
            {value
              ? props.options.find((option) => option.value === value)?.label
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
              onValueChange={props.onSearchChange}
            />
            <CommandList className="w-full max-w-full">
              <CommandEmpty className="w-full">No option found.</CommandEmpty>
              <CommandGroup className="w-full">
                {props.options.map((option) => (
                  <CommandItem
                    key={option.value}
                    keywords={[option.label]}
                    value={option.value}
                    onSelect={(currentValue) => {
                      const selectedOption = props.options.find(
                        (opt) =>
                          opt.value.toLowerCase().trim() ===
                          currentValue.toLowerCase().trim()
                      );

                      if (selectedOption) {
                        const newValue =
                          selectedOption.value === value ? "" : selectedOption.value;

                        if (!isControlled) {
                          setInternalValue(newValue);
                        }

                        props.onSelect(newValue || undefined);
                      }

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
