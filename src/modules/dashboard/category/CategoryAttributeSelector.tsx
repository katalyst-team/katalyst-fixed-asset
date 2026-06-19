import { useTranslation } from "next-i18next";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { MultiCombobox } from "@/components/ui/multi-combobox";
import { useUser } from "@/context/user-context";
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";

import { SelectedAttributeItem } from "./SelectedAttributeItem";

export interface AttributeOption {
  label: string;
  value: string;
  type?: string;
  presets?: string[];
  description?: string;
}

export interface CategoryAttributeItem {
  attribute_id: string;
  is_required: boolean;
}

export interface CategoryAttributeSelectorProps {
  onChange: (attributeItems: CategoryAttributeItem[]) => void;
  initialItems?: CategoryAttributeItem[];
}

/**
 * Simplified component to select attributes for categories without value input
 */
export const CategoryAttributeSelector: React.FC<
  CategoryAttributeSelectorProps
> = ({ onChange, initialItems = [] }) => {
  const { t } = useTranslation(["category", "sku", "common"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";

  // State for selected attributes where the key is the attribute ID
  // and the value is whether it's required (true) or optional (false)
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, boolean>
  >({});

  // Track selected attribute IDs for the multi-combobox
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>(
    initialItems.map((item) => item.attribute_id)
  );

  // Initialize selected attributes from initial items
  useEffect(() => {
    const initialSelectedAttributes: Record<string, boolean> = {};
    initialItems.forEach((item) => {
      initialSelectedAttributes[item.attribute_id] = item.is_required;
    });
    setSelectedAttributes(initialSelectedAttributes);
    setSelectedAttributeIds(initialItems.map((item) => item.attribute_id));
  }, [initialItems, setSelectedAttributeIds]);

  // Get all available attributes
  const { data: attributeData } = useGetAttributeDataQuery({
    enabled: Boolean(organizationId),
    limit: 10000,
    organizationId,
  });

  // Initialize available attributes when data loads
  const attributes = attributeData;

  // Helper function to create and call onChange with current attributes
  const updateParent = useCallback(
    (attributes: Record<string, boolean>) => {
      const items = Object.entries(attributes).map(([id, required]) => ({
        attribute_id: id,
        is_required: required,
      }));
      onChange(items);
    },
    [onChange]
  );

  // Handle attribute selection/deselection in the multi-combobox
  const handleAttributeSelect = useCallback(
    (attributeIds: string[]) => {
      setSelectedAttributeIds(attributeIds);

      const newAttributes = {} as Record<string, boolean>;

      attributeIds.forEach((id) => {
        if (!(id in selectedAttributes)) {
          newAttributes[id] = true; // Default to required for new attributes
        }
      });

      // Update selected attributes state if there are new selections
      if (Object.keys(newAttributes).length > 0) {
        setSelectedAttributes((prev) => {
          const updatedAttributes = {
            ...prev,
            ...newAttributes,
          };

          // Call onChange with the updated list
          updateParent(updatedAttributes);

          return updatedAttributes;
        });
      }

      // Remove deselected attributes
      const attributesToRemove = Object.keys(selectedAttributes).filter(
        (id) => !attributeIds.includes(id)
      );

      if (attributesToRemove.length > 0) {
        setSelectedAttributes((prev) => {
          const updatedAttributes = { ...prev };
          attributesToRemove.forEach((id) => {
            delete updatedAttributes[id];
          });

          // Call onChange with the updated list
          updateParent(updatedAttributes);

          return updatedAttributes;
        });
      }
    },
    [selectedAttributes, setSelectedAttributeIds, updateParent]
  );

  // Prepare attribute options including selection status
  const attributeOptions = useMemo(() => {
    return (
      (attributes?.data?.attributes || []).map((attr) => ({
        description: attr.description || "",
        label: attr.name,
        presets: attr.presets || [],
        type: attr.type,
        value: attr.id,
      })) ?? []
    );
  }, [attributes]);

  return (
    <div className="space-y-4">
      {/* Attribute selector */}
      <div className="grid gap-2">
        <MultiCombobox
          options={attributeOptions}
          placeholder={t(
            "sku:modal.addSku.selectAttribute",
            "Select an attribute"
          )}
          selectedValues={selectedAttributeIds}
          onValueChange={handleAttributeSelect}
        />
      </div>

      {/* Selected attributes display */}
      {Object.keys(selectedAttributes).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-medium text-sm">
              {t(
                "category.attributes.selected_attributes",
                "Selected Attributes"
              )}
            </label>
          </div>

          <div className="max-h-64 overflow-auto rounded-md border bg-muted/20">
            <div className="space-y-2 p-2">
              {Object.entries(selectedAttributes).map(
                ([attributeId, isRequired]) => {
                  // Get the attribute details
                  const attribute = attributes?.data?.attributes?.find(
                    (attr) => attr.id === attributeId
                  );

                  if (!attribute) return null;

                  return (
                    <SelectedAttributeItem
                      key={attributeId}
                      description={attribute.description}
                      id={attributeId}
                      isRequired={isRequired}
                      name={attribute.name}
                      type={attribute.type}
                      onDelete={(id) => {
                        setSelectedAttributes((prev) => {
                          const updated = { ...prev };
                          delete updated[id];
                          updateParent(updated);

                          // Also update the selected IDs for the multi-combobox
                          setSelectedAttributeIds((ids) =>
                            ids.filter((itemId) => itemId !== id)
                          );

                          return updated;
                        });
                      }}
                      onToggleRequired={(id) => {
                        setSelectedAttributes((prev) => {
                          const updated = {
                            ...prev,
                            [id]: !prev[id],
                          };
                          updateParent(updated);
                          return updated;
                        });
                      }}
                    />
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}
      {Object.keys(selectedAttributes).length === 0 && (
        <div className="text-center p-4 text-muted-foreground border rounded-md">
          {t(
            "category:modal.create.noAttributesSelected",
            "No attributes selected. Please select attributes from the dropdown above."
          )}
        </div>
      )}
    </div>
  );
};
