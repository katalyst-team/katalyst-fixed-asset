import { Filter, X } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";

import { formatAttributeName, UniqueAttribute } from "./utils/attributeUtils";

interface AttributeColumnHeaderProps {
  attribute: UniqueAttribute;
  attributeDefinition?: AttributeItemType | null;
  currentFilters: Record<string, string[]>;
  onFilterChange: (attributeId: string, values: string[]) => void;
}

const AttributeColumnHeader: React.FC<AttributeColumnHeaderProps> = ({
  attribute,
  attributeDefinition,
  currentFilters,
  onFilterChange,
}) => {
  const { t } = useTranslation(["common", "ledger-product"]);
  const [open, setOpen] = React.useState(false);
  const [selectedValues, setSelectedValues] = React.useState<string[]>(
    currentFilters[attribute.id] || []
  );
  const [inputValue, setInputValue] = React.useState("");

  // Sync with external filter changes
  React.useEffect(() => {
    setSelectedValues(currentFilters[attribute.id] || []);
  }, [currentFilters, attribute.id]);

  const attributeType = React.useMemo<AttributeTypeEnum>(() => {
    const candidate = attributeDefinition?.type ?? attribute.type;
    if (Object.values(AttributeTypeEnum).includes(candidate as AttributeTypeEnum)) {
      return candidate as AttributeTypeEnum;
    }
    return AttributeTypeEnum.TEXT;
  }, [attribute.type, attributeDefinition?.type]);

  // Format names that follow KBM pattern (uppercase with underscores) regardless of source
  const shouldFormatName = (name: string): boolean => {
    return name.includes("_") && name === name.toUpperCase();
  };

  const rawName = attributeDefinition?.name ?? attribute.name;
  const attributeName = shouldFormatName(rawName) ? formatAttributeName(rawName) : rawName;
  const presetOptions = React.useMemo<string[]>(() => {
    if (!attributeDefinition?.presets || attributeDefinition.presets.length === 0) {
      return [];
    }
    return attributeDefinition.presets;
  }, [attributeDefinition?.presets]);

  const hasActiveFilter = selectedValues.length > 0;

  const handleValueToggle = (value: string, checked: boolean) => {
    const newValues = checked
      ? [...selectedValues, value]
      : selectedValues.filter((v) => v !== value);
    setSelectedValues(newValues);
  };

  const handleInputAdd = () => {
    if (!inputValue.trim()) return;
    if (!selectedValues.includes(inputValue)) {
      const newValues = [...selectedValues, inputValue];
      setSelectedValues(newValues);
    }
    setInputValue("");
  };

  const handleRemoveValue = (value: string) => {
    const newValues = selectedValues.filter((v) => v !== value);
    setSelectedValues(newValues);
  };

  const handleApply = () => {
    onFilterChange(attribute.id, selectedValues);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedValues([]);
    onFilterChange(attribute.id, []);
    setOpen(false);
  };

  const renderFilterInput = () => {
    switch (attributeType) {
      case AttributeTypeEnum.SELECT:
      case AttributeTypeEnum.CHECKBOX:
        if (presetOptions.length === 0) {
          return (
            <div className="text-sm text-muted-foreground">
              {t("ledger-product:filter.noPresetsAvailable", "No preset values available")}
            </div>
          );
        }
        return (
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-2">
              {presetOptions.map((preset) => (
                <div key={preset} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedValues.includes(preset)}
                    id={`${attribute.id}-${preset}`}
                    onCheckedChange={(checked) =>
                      handleValueToggle(preset, checked as boolean)
                    }
                  />
                  <Label
                    className="text-sm cursor-pointer"
                    htmlFor={`${attribute.id}-${preset}`}
                  >
                    {preset}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        );

      case AttributeTypeEnum.BOOLEAN:
        return (
          <div className="space-y-2">
            {["true", "false"].map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedValues.includes(value)}
                  id={`${attribute.id}-${value}`}
                  onCheckedChange={(checked) =>
                    handleValueToggle(value, checked as boolean)
                  }
                />
                <Label
                  className="text-sm cursor-pointer"
                  htmlFor={`${attribute.id}-${value}`}
                >
                  {value === "true"
                    ? t("common:yes", "Yes")
                    : t("common:no", "No")}
                </Label>
              </div>
            ))}
          </div>
        );

      case AttributeTypeEnum.TEXT:
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder={t(
                  "ledger-product:filter.enterTextValue",
                  "Enter text value..."
                )}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleInputAdd();
                  }
                }}
              />
              <Button size="sm" type="button" onClick={handleInputAdd}>
                {t("common:add", "Add")}
              </Button>
            </div>
          </div>
        );

      case AttributeTypeEnum.NUMBER:
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder={t(
                  "ledger-product:filter.enterNumberValue",
                  "Enter number value..."
                )}
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleInputAdd();
                  }
                }}
              />
              <Button size="sm" type="button" onClick={handleInputAdd}>
                {t("common:add", "Add")}
              </Button>
            </div>
          </div>
        );

      case AttributeTypeEnum.DATE:
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="date"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button size="sm" type="button" onClick={handleInputAdd}>
                {t("common:add", "Add")}
              </Button>
            </div>
          </div>
        );

      case AttributeTypeEnum.DATETIME:
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="datetime-local"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button size="sm" type="button" onClick={handleInputAdd}>
                {t("common:add", "Add")}
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-muted-foreground">
            {t(
              "ledger-product:filter.attributeTypeNotSupported",
              "This attribute type is not supported for filtering"
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{attributeName}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className="h-6 w-6 p-0"
            size="sm"
            variant={hasActiveFilter ? "default" : "ghost"}
          >
            <Filter className="h-3 w-3" />
            {hasActiveFilter && (
              <span className="sr-only">
                {t("ledger-product:filter.activeFilter", "Active filter")}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[320px] p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">
                {t("ledger-product:filter.filterBy", "Filter by")} {attributeName}
              </h4>
              <Badge className="text-xs" variant="outline">
                {attributeType}
              </Badge>
            </div>

            {/* Show selected values as badges */}
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((value) => (
                  <Badge key={value} className="text-xs" variant="secondary">
                    {value}
                    <Button
                      className="ml-1 h-3 w-3 p-0 hover:bg-destructive"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveValue(value)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {renderFilterInput()}

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={handleClear}>
                {t("common:clear", "Clear")}
              </Button>
              <Button size="sm" onClick={handleApply}>
                {t("common:apply", "Apply")}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AttributeColumnHeader;
