import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";

import { AttributeValueInput } from "./AttributeValueInput";

// Define AttributeItem interface to match the updated API requirements
export interface AttributeItem {
  attribute_id: string;
  values: string | number | string[];
}

export interface AttributeSelectorProps {
  onChange: (attributeItems: AttributeItem[]) => void;
  initialItems?: AttributeItem[];
}

/**
 * Component to select individual attributes and their values
 */
export const AttributeSelector = ({
  onChange,
  initialItems = [],
}: AttributeSelectorProps) => {
  const { t } = useTranslation(["product", "sku"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  // Create a map of attribute values for easier lookup
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string | number | string[]>
  >(
    Object.fromEntries(
      (initialItems || []).map((item) => [item.attribute_id, item.values])
    )
  );

  // Track which attributes the user has selected to add
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>(
    []
  );
  const [availableAttributes, setAvailableAttributes] = useState<
    Array<AttributeItemType>
  >([]);

  // Get all available attributes
  const { data: attributeData } = useGetAttributeDataQuery({
    enabled: Boolean(organizationId),
    limit: 10000,
    organizationId,
  });

  // Handler for attribute value changes
  const handleAttributeValueChange = useCallback(
    (
      attributeId: string,
      attributeType: string,
      value: string | number | string[]
    ) => {
      let attributeValue: string | number | string[] = value;

      // Handle different attribute types
      if (attributeType === AttributeTypeEnum.NUMBER) {
        // For NUMBER, we store a single number value
        attributeValue =
          typeof value === "number"
            ? value
            : typeof value === "string"
              ? parseInt(value, 10)
              : 0;
      } else if (attributeType === AttributeTypeEnum.CHECKBOX) {
        // For CHECKBOX, we store as string[]
        attributeValue = Array.isArray(value) ? value : [value.toString()];
      } else {
        // For other types, we store as string
        attributeValue =
          typeof value === "string"
            ? value
            : Array.isArray(value)
              ? value[0]
              : value.toString();
      }

      setSelectedAttributes((prev) => {
        const updatedAttributes = { ...prev, [attributeId]: attributeValue };

        // Call onChange directly with the updated attributes
        const attributeItems: AttributeItem[] = Object.entries(
          updatedAttributes
        ).map(([attrId, vals]) => ({
          attribute_id: attrId,
          values: vals,
        })) as AttributeItem[];
        onChange(attributeItems);

        return updatedAttributes;
      });
    },
    [onChange]
  );

  // Initialize selected attributes when data loads
  useEffect(() => {
    if (attributeData?.data.attributes) {
      const initialSelectedIds = initialItems.map((item) => item.attribute_id);
      setSelectedAttributeIds(initialSelectedIds);

      const filtered = (attributeData.data.attributes || []).filter((attr) =>
        initialSelectedIds.includes(attr.id)
      );
      setAvailableAttributes(filtered);
    }
  }, [attributeData, initialItems]);

  // Add a new attribute to the selection
  const handleAddAttribute = (attributeId: string) => {
    const attribute = (attributeData?.data.attributes || []).find(
      (attr) => attr.id === attributeId
    );
    if (!attribute) return;

    if (!selectedAttributeIds.includes(attributeId)) {
      setSelectedAttributeIds((prev) => [...prev, attributeId]);
      setAvailableAttributes((prev) => [...prev, attribute]);

      // Initialize with empty values
      handleAttributeValueChange(attributeId, attribute.type, []);
    }
  };

  // Remove an attribute from the selection
  const handleRemoveAttribute = (attributeId: string) => {
    setSelectedAttributeIds((prev) => prev.filter((id) => id !== attributeId));
    setAvailableAttributes((prev) =>
      prev.filter((attr) => attr.id !== attributeId)
    );

    // Update parent form by removing this attribute
    setSelectedAttributes((prev) => {
      const updated = { ...prev };
      delete updated[attributeId];

      // Format attribute values based on their types for the API
      const attributeItems: AttributeItem[] = Object.entries(updated).map(
        ([attrId, vals]) => ({
          attribute_id: attrId,
          values: vals,
        })
      );
      onChange(attributeItems);

      return updated;
    });
  };

  // Get attribute options that haven't been selected yet
  const attributeOptions =
    (attributeData?.data.attributes || [])
      .filter((attr) => !selectedAttributeIds.includes(attr.id))
      .map((attr) => ({
        label: attr.name,
        value: attr.id,
      })) || [];

  return (
    <div className="space-y-4">
      {/* Attribute selector */}
      <div className="grid gap-2">
        <Select onValueChange={handleAddAttribute}>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={t(
                "modal.addSku.selectAttribute",
                "Select an attribute"
              )}
            />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {attributeOptions.length > 0 ? (
                attributeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-muted-foreground">
                  {t(
                    "modal.addSku.noMoreAttributes",
                    "No more attributes available"
                  )}
                </div>
              )}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      {/* Selected attributes */}
      <ScrollArea className="h-[300px] pr-4 -mr-4">
        <div className="space-y-4">
          {availableAttributes.map((attribute) => (
            <div
              key={attribute.id}
              className="grid gap-2 border p-3 rounded-md"
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">{attribute.name}</div>
                <button
                  className="text-sm text-destructive hover:underline"
                  type="button"
                  onClick={() => handleRemoveAttribute(attribute.id)}
                >
                  {t("modal.addSku.remove", "Remove")}
                </button>
              </div>
              <div className="text-sm text-muted-foreground">
                {attribute.description ||
                  t("modal.addSku.noDescription", "No description")}
              </div>
              <AttributeValueInput
                attribute={attribute}
                initialValue={selectedAttributes[attribute.id] || []}
                onChange={(value) =>
                  handleAttributeValueChange(
                    attribute.id,
                    attribute.type,
                    value
                  )
                }
              />
            </div>
          ))}

          {availableAttributes.length === 0 && (
            <div className="text-center p-4 text-muted-foreground border rounded-md">
              {t(
                "modal.addSku.noAttributesSelected",
                "No attributes selected. Please select attributes from the dropdown above."
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
