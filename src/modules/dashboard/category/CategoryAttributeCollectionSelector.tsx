import { useTranslation } from "next-i18next";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { MultiCombobox } from "@/components/ui/multi-combobox";
import { useUser } from "@/context/user-context";
import useGetAttributeCollectionQuery from "@/hooks/api/attribute/collection/useGetAttributeCollectionQuery";
import useGetAttributeCollectionsQuery from "@/hooks/api/attribute/collection/useGetAttributeCollectionsQuery";

import { CategoryAttributeItem } from "./CategoryAttributeSelector";
import { SelectedAttributeItem } from "./SelectedAttributeItem";

export interface CategoryAttributeCollectionSelectorProps {
  onChange: (attributeItems: CategoryAttributeItem[]) => void;
  initialItems?: CategoryAttributeItem[];
}

interface AttributeCollectionItemDetails {
  attribute: {
    id: string;
    name: string;
    type: string;
    description?: string;
    presets?: string[];
  };
  is_required: boolean;
}

interface AttributeCollectionResponse {
  data: {
    attribute_collections?: Array<{
      id: string;
      name: string;
    }>;
    id?: string;
    name?: string;
    description?: string;
    attribute_items?: AttributeCollectionItemDetails[];
  };
  metadata: {
    success: boolean;
    code: string;
    message: string;
    server_time: number;
    correlation_id: string;
  };
}

/**
 * Simplified component to select attribute collections for categories without value input
 */
export const CategoryAttributeCollectionSelector: React.FC<
  CategoryAttributeCollectionSelectorProps
> = ({ onChange }) => {
  const { t } = useTranslation(["category", "sku", "common"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  // Track currently selected collection ID
  const [selectedCollection, setSelectedCollection] = useState<string>("");

  // Track modified attributes from collection (user can edit required status)
  // Using Record<string, boolean | null> to handle removed attributes
  const [modifiedAttributes, setModifiedAttributes] = useState<
    Record<string, boolean | null>
  >({});

  // Get collections list
  const { data: collectionsData } = useGetAttributeCollectionsQuery({
    enabled: Boolean(organizationId),
    organizationId,
  }) as { data?: AttributeCollectionResponse; isLoading: boolean };

  // Get collection details when a collection is selected
  const { data: collectionDetails } = useGetAttributeCollectionQuery({
    attributeCollectionId: selectedCollection, // Fixed parameter name from collectionId to attributeCollectionId
    enabled: Boolean(selectedCollection && organizationId),
    organizationId,
  }) as { data?: AttributeCollectionResponse; isLoading: boolean };

  // Helper function to generate cleaned attribute items from collection details and modifications
  // Can accept an override for modifiedAttributes for immediate updates
  const generateAttributeItems = useCallback(
    (modifiedOverride?: Record<string, boolean | null>) => {
      if (!collectionDetails?.data?.attribute_items) {
        return [];
      }

      const currentModified = modifiedOverride ?? modifiedAttributes;

      return collectionDetails.data.attribute_items
        .filter((item) => {
          // Filter out removed attributes (those set to null in modifiedAttributes)
          return currentModified[item.attribute.id] !== null;
        })
        .map((item) => {
          const attributeId = item.attribute.id;
          // Use modified required status if it exists, otherwise use original
          const isRequired = currentModified[attributeId] ?? item.is_required;

          return {
            attribute_id: attributeId, // Changed from id to attribute_id to match CategoryAttributeItem type
            is_required: isRequired,
          };
        });
    },
    [collectionDetails, modifiedAttributes]
  );

  // Helper function to determine if an attribute is required
  const isAttributeRequired = useCallback(
    (attributeId: string): boolean => {
      // If attribute is in modified attributes and not null, use that value
      if (
        attributeId in modifiedAttributes &&
        modifiedAttributes[attributeId] !== null
      ) {
        return modifiedAttributes[attributeId] as boolean;
      }

      // Otherwise find original value in collection details
      const attributeItem = collectionDetails?.data?.attribute_items?.find(
        (item: AttributeCollectionItemDetails) =>
          item.attribute.id === attributeId
      );

      // Return original value or false if not found
      return attributeItem?.is_required || false;
    },
    [modifiedAttributes, collectionDetails]
  );

  // Toggle required/optional for an attribute
  const handleToggleRequired = useCallback(
    (attributeId: string) => {
      setModifiedAttributes((prev) => {
        // Get current modified state or fallback to original state if not modified
        const currentIsRequired =
          prev[attributeId] ??
          collectionDetails?.data?.attribute_items?.find(
            (item) => item.attribute.id === attributeId
          )?.is_required ??
          false;

        const newModified = {
          ...prev,
          [attributeId]: !currentIsRequired,
        };

        // Directly update parent with new attribute items
        if (collectionDetails?.data) {
          const attributeItems = generateAttributeItems(newModified);
          onChange(attributeItems);
        }

        return newModified;
      });
    },
    [collectionDetails, generateAttributeItems, onChange]
  );

  // Remove an attribute from the selection
  const handleRemoveAttribute = useCallback(
    (attributeId: string) => {
      setModifiedAttributes((prev) => {
        const newModified = {
          ...prev,
          // Mark as 'removed' by setting to null - will be filtered out when sending to parent
          [attributeId]: null,
        };

        // Directly update parent with new attribute items
        if (collectionDetails?.data) {
          const attributeItems = generateAttributeItems(newModified);
          onChange(attributeItems);
        }

        return newModified;
      });
    },
    [collectionDetails, generateAttributeItems, onChange]
  );

  // Handler for collection dropdown selection
  const handleCollectionChange = useCallback(
    (collectionId: string) => {
      if (collectionId === selectedCollection) return;

      setSelectedCollection(collectionId);
      // Reset modified attributes when collection changes
      setModifiedAttributes({});

      if (!collectionId) {
        // If no collection selected, send empty array
        onChange([]);
      } else if (collectionDetails?.data?.attribute_items) {
        // If we already have collection details, update parent immediately
        // This ensures the Create Category button can be enabled
        const attributeItems = generateAttributeItems();
        onChange(attributeItems);
      }
    },
    [onChange, selectedCollection, collectionDetails, generateAttributeItems]
  );

  // Prepare collection options for the multi-combobox
  const collectionOptions = useMemo(() => {
    return (
      collectionsData?.data?.attribute_collections?.map((collection) => ({
        description: "",
        label: collection.name,
        presets: [],
        type: "collection",
        value: collection.id,
      })) ?? []
    );
  }, [collectionsData]);

  // Add a useEffect to handle the case when collection details load after selection
  // This ensures attributes are sent to parent when API response arrives
  useEffect(() => {
    if (selectedCollection && collectionDetails?.data?.attribute_items) {
      const attributeItems = generateAttributeItems();
      onChange(attributeItems);
    }
    // ESLINT DISABLE TO AVOID NEVER ENDING LOOP
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollection, collectionDetails]);

  return (
    <div className="space-y-4">
      {/* Collection dropdown */}
      <div>
        <label
          className="block text-sm font-medium text-muted-foreground mb-1"
          htmlFor="attribute-collection-select"
        >
          {t(
            "category:modal.create.attributeCollection",
            "Attribute Collection"
          )}
        </label>
        <MultiCombobox
          options={collectionOptions}
          placeholder={t(
            "category:modal.create.selectAttributeCollection",
            "Select an attribute collection"
          )}
          selectedValues={selectedCollection ? [selectedCollection] : []}
          onValueChange={(values) => {
            if (values.length > 0) {
              handleCollectionChange(values[0]);
            } else {
              handleCollectionChange("");
            }
          }}
        />
      </div>

      {/* Collection details */}
      {selectedCollection && collectionDetails?.data && (
        <div className="space-y-2">
          {/* Collection information */}
          <div className="bg-accent p-4 rounded-md space-y-1">
            <h3 className="font-semibold">{collectionDetails.data.name}</h3>
            {collectionDetails.data.description && (
              <p className="text-sm text-muted-foreground">
                {collectionDetails.data.description}
              </p>
            )}
          </div>

          {/* Attributes from collection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {t("category:modal.create.attributes", "Attributes")}
            </label>

            {collectionDetails.data.attribute_items &&
            collectionDetails.data.attribute_items.length > 0 ? (
              <div className="max-h-64 overflow-auto rounded-md border bg-muted/20">
                <div className="space-y-2 p-2">
                  {collectionDetails.data.attribute_items
                    .filter((item) => {
                      // Filter out items marked as removed
                      return (
                        !(item.attribute.id in modifiedAttributes) ||
                        modifiedAttributes[item.attribute.id] !== null
                      );
                    })
                    .map((item) => {
                      const isRequired = isAttributeRequired(item.attribute.id);

                      return (
                        <SelectedAttributeItem
                          key={item.attribute.id}
                          description={item.attribute.description || ""}
                          id={item.attribute.id}
                          isRequired={isRequired}
                          name={item.attribute.name}
                          type={item.attribute.type}
                          onDelete={(id) => handleRemoveAttribute(id)}
                          onToggleRequired={(id) => handleToggleRequired(id)}
                        />
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground border rounded-md">
                {t(
                  "category:modal.create.noAttributesInCollection",
                  "No attributes in this collection."
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
