import { Trash2 } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SelectedAttributeItemProps {
  id: string;
  name: string;
  type?: string;
  description?: string;
  isRequired: boolean;
  onToggleRequired: (id: string) => void;
  onDelete: (id: string) => void;
  showRequired?: boolean;
}

/**
 * A reusable component to display selected attribute items with toggle switch and delete button
 */
export const SelectedAttributeItem: React.FC<SelectedAttributeItemProps> = ({
  id,
  name,
  type,
  description,
  isRequired,
  onToggleRequired,
  onDelete,
  showRequired = true,
}) => {
  return (
    <div
      key={id}
      className="grid w-full grid-cols-[1fr_auto] items-center gap-2 p-3 border rounded-lg bg-muted/30"
    >
      <div className="flex items-center gap-2 min-w-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col min-w-0 cursor-default">
                <span className="font-medium text-sm truncate">{name}</span>
                {description && (
                  <span className="text-xs text-muted-foreground truncate">{description}</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{name}</p>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {type && (
          <Badge className="shrink-0 text-xs" variant="outline">
            {type}
          </Badge>
        )}
        {showRequired && isRequired && (
          <Badge className="shrink-0 text-xs" variant="destructive">
            Required
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={isRequired}
          onCheckedChange={() => onToggleRequired(id)}
        />
        <Button
          className="border border-destructive"
          size="icon"
          variant="outline"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="text-destructive" />
        </Button>
      </div>
    </div>
  );
};
