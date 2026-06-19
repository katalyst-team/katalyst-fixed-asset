import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, InputProps } from "@/components/ui/input";
import { Label, LabelProps } from "@/components/ui/label";

export interface InputWithLabelProps extends InputProps {
  labelProps?: LabelProps;
  label?: string;
  isRequired?: boolean;
  isPassword?: boolean;
}

export function InputWithLabel(props: InputWithLabelProps) {
  const { isPassword, ...inputProps } = props;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid w-full items-center gap-2">
      <Label {...props.labelProps}>
        {props.label}
        {props.isRequired && <span className="text-red-500 text-base">*</span>}
      </Label>
      <div className="relative">
        <Input
          {...inputProps}
          type={isPassword ? (showPassword ? "text" : "password") : props.type}
        />
        {isPassword && (
          <Button
            className="absolute right-0 top-0 h-full px-3"
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
