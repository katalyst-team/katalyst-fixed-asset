import { X } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";

interface AttributeFilterSectionProps {
  attributes: AttributeItemType[];
  isLoadingAttributes: boolean;
  selectedAttributes: Record<string, string[]>;
  attributeInputValues: Record<string, string>;
  onAttributeValueChange: (attributeId: string, value: string, checked: boolean) => void;
  onAttributeInputChange: (attributeId: string, value: string) => void;
  onAddAttributeInputValue: (attributeId: string) => void;
  onRemoveAttributeFilter: (attributeId: string) => void;
}

const AttributeFilterSection: React.FC<AttributeFilterSectionProps> = ({
  attributes,
  isLoadingAttributes,
  selectedAttributes,
  attributeInputValues,
  onAttributeValueChange,
  onAttributeInputChange,
  onAddAttributeInputValue,
  onRemoveAttributeFilter,
}) => {
  const { t } = useTranslation(["common", "ledger-product"]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {t("ledger-product:filter.attributes", "Attributes")}
      </Label>
      {isLoadingAttributes ? (
        <div className="text-sm text-muted-foreground">
          {t("common:loading", "Loading...")}
        </div>
      ) : attributes.length > 0 ? (
        <ScrollArea className="h-[200px] w-full border rounded-md p-2">
          <div className="space-y-3">
            {attributes.map((attribute) => (
              <div key={attribute.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    {attribute.name}
                  </Label>
                  <Badge className="text-xs" variant="outline">
                    {attribute.type}
                  </Badge>
                </div>

                {/* Show selected values as badges */}
                {selectedAttributes[attribute.id]?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedAttributes[attribute.id].map((value) => (
                      <Badge
                        key={value}
                        className="text-xs"
                        variant="secondary"
                      >
                        {value}
                        <Button
                          className="ml-1 h-3 w-3 p-0 hover:bg-destructive"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            onAttributeValueChange(
                              attribute.id,
                              value,
                              false
                            )
                          }
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                    <Button
                      className="h-5 text-xs"
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveAttributeFilter(attribute.id)}
                    >
                      Clear all
                    </Button>
                  </div>
                )}

                {/* Attribute value selection based on type */}
                {attribute.type === AttributeTypeEnum.SELECT ||
                attribute.type === AttributeTypeEnum.CHECKBOX ? (
                  attribute.presets && attribute.presets.length > 0 ? (
                    <div className="space-y-1 pl-2">
                      {attribute.presets.map((preset) => (
                        <div
                          key={preset}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={
                              selectedAttributes[attribute.id]?.includes(
                                preset
                              ) || false
                            }
                            id={`${attribute.id}-${preset}`}
                            onCheckedChange={(checked) =>
                              onAttributeValueChange(
                                attribute.id,
                                preset,
                                checked as boolean
                              )
                            }
                          />
                          <Label
                            className="text-sm"
                            htmlFor={`${attribute.id}-${preset}`}
                          >
                            {preset}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground pl-2">
                      {t(
                        "ledger-product:filter.noPresetsAvailable",
                        "No preset values available"
                      )}
                    </div>
                  )
                ) : attribute.type === AttributeTypeEnum.BOOLEAN ? (
                  <div className="space-y-1 pl-2">
                    {["true", "false"].map((value) => (
                      <div
                        key={value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={
                            selectedAttributes[attribute.id]?.includes(
                              value
                            ) || false
                          }
                          id={`${attribute.id}-${value}`}
                          onCheckedChange={(checked) =>
                            onAttributeValueChange(
                              attribute.id,
                              value,
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          className="text-sm"
                          htmlFor={`${attribute.id}-${value}`}
                        >
                          {value === "true"
                            ? t("common:yes", "Yes")
                            : t("common:no", "No")}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : attribute.type === AttributeTypeEnum.TEXT ? (
                  <div className="space-y-2 pl-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t(
                          "ledger-product:filter.enterTextValue",
                          "Enter text value..."
                        )}
                        value={attributeInputValues[attribute.id] || ""}
                        onChange={(e) =>
                          onAttributeInputChange(
                            attribute.id,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            onAddAttributeInputValue(attribute.id);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        type="button"
                        onClick={() =>
                          onAddAttributeInputValue(attribute.id)
                        }
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ) : attribute.type === AttributeTypeEnum.NUMBER ? (
                  <div className="space-y-2 pl-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t(
                          "ledger-product:filter.enterNumberValue",
                          "Enter number value..."
                        )}
                        type="number"
                        value={attributeInputValues[attribute.id] || ""}
                        onChange={(e) =>
                          onAttributeInputChange(
                            attribute.id,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            onAddAttributeInputValue(attribute.id);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        type="button"
                        onClick={() =>
                          onAddAttributeInputValue(attribute.id)
                        }
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ) : attribute.type === AttributeTypeEnum.DATE ? (
                  <div className="space-y-2 pl-2">
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={attributeInputValues[attribute.id] || ""}
                        onChange={(e) =>
                          onAttributeInputChange(
                            attribute.id,
                            e.target.value
                          )
                        }
                      />
                      <Button
                        size="sm"
                        type="button"
                        onClick={() =>
                          onAddAttributeInputValue(attribute.id)
                        }
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ) : attribute.type === AttributeTypeEnum.DATETIME ? (
                  <div className="space-y-2 pl-2">
                    <div className="flex gap-2">
                      <Input
                        type="datetime-local"
                        value={attributeInputValues[attribute.id] || ""}
                        onChange={(e) =>
                          onAttributeInputChange(
                            attribute.id,
                            e.target.value
                          )
                        }
                      />
                      <Button
                        size="sm"
                        type="button"
                        onClick={() =>
                          onAddAttributeInputValue(attribute.id)
                        }
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground pl-2">
                    {t(
                      "ledger-product:filter.attributeTypeNotSupported",
                      "This attribute type is not supported for filtering"
                    )}
                  </div>
                )}

                {attributes.indexOf(attribute) <
                  attributes.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-sm text-muted-foreground">
          {t("ledger-product:filter.noAttributes", "No attributes available")}
        </div>
      )}
    </div>
  );
};

export default AttributeFilterSection;
