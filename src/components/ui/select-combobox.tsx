"use client";

import * as React from "react";

import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export interface SelectComboboxOptionsProps {
  value: string;
  label: string;
}

export interface SelectComboboxProps {
  options: SelectComboboxOptionsProps[];
  onSelect: (value?: string) => void;
  placeholder: string;
  label?: string;
  disabled?: boolean;
  isRequired?: boolean;
  value?: string;
  defaultValue?: string;
}

export function SelectCombobox(props: SelectComboboxProps) {
  const isControlled = props.value !== undefined;
  const [internalValue, setInternalValue] = React.useState(
    props.defaultValue || ""
  );

  const value = isControlled ? props.value || "" : internalValue;

  React.useEffect(() => {
    if (isControlled && props.value !== internalValue) {
      setInternalValue(props.value || "");
    }
  }, [isControlled, props.value, internalValue]);

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    props.onSelect(newValue || undefined);
  };

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
      <Select
        disabled={props.disabled}
        value={value}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={props.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {props.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
