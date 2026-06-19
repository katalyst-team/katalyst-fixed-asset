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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ComboboxOptionsProps {
  value: string;
  label: string;
}

export interface MultiComboboxProps {
  options: ComboboxOptionsProps[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  placeholder: string;
  containerClassName?: string;
  disabled?: boolean;
  emptyMessage?: string;
  isRequired?: boolean;
  label?: string;
}

export function MultiCombobox({
  options,
  selectedValues,
  onValueChange,
  placeholder,
  containerClassName,
  disabled,
  emptyMessage = "No options available",
  isRequired,
  label,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onValueChange(selectedValues.filter((v) => v !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  const selectedLabels = selectedValues.map((value) => {
    const option = options.find((o) => o.value === value);
    return option ? option.label : value;
  });

  return (
    <div className={cn("flex w-full flex-col gap-2", containerClassName)}>
      {label && (
        <Label>
          {label}
          {isRequired && <span className="text-red-500 text-base">*</span>}
        </Label>
      )}
      <Popover modal={false} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="w-full items-start justify-between gap-2 h-auto min-h-10 py-2 text-foreground"
            disabled={disabled}
            role="combobox"
            variant="outline"
          >
            <div className="flex flex-1 flex-wrap items-start gap-1 text-left">
              {selectedValues.length > 0 ? (
                selectedLabels.map((labelText) => (
                  <span
                    key={labelText}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground"
                  >
                    {labelText}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground/90">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0" onWheel={(e) => e.stopPropagation()}>
          <Command className="w-full">
            <CommandInput placeholder={placeholder} />
            <CommandList className="max-h-64 overflow-y-auto">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup className="w-full">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
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
