import { useTranslation } from "next-i18next";
import React, { useCallback, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetAttributeCollectionQuery from "@/hooks/api/attribute/collection/useGetAttributeCollectionQuery";
import useGetAttributeCollectionsQuery from "@/hooks/api/attribute/collection/useGetAttributeCollectionsQuery";
import { AttributeTypeEnum } from "@/types/attribute";

// Local imports
import { AttributeItem } from "./AttributeSelector";
import { AttributeValueInput } from "./AttributeValueInput";

export interface AttributeCollectionSelectorProps {
  onChange: (attributeItems: AttributeItem[]) => void;
  initialItems?: AttributeItem[];
}

export interface AttributeCollectionItemDetails {
  attribute: {
    id: string;
    name: string;
    type: string;
    description?: string;
    presets?: string[];
  };
  is_required: boolean;
}

interface AttributeCollectionItem {
  id: string;
  name: string;
  description?: string;
  attribute_items?: AttributeCollectionItemDetails[];
}

interface AttributeCollectionResponse {
  data: {
    attribute_collections?: Array<{
      id: string;
      name: string;
    }>;
    attribute_collection?: AttributeCollectionItem;
  };
}

export const AttributeCollectionSelector: React.FC<
  AttributeCollectionSelectorProps
> = ({ onChange, initialItems = [] }) => {
  const { t } = useTranslation(["sku"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  // Create a map of initial items for easier lookup
  const initialItemsMap = Object.fromEntries(
    (initialItems || []).map((item) => [item.attribute_id, item.values])
  );

  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [attributeValues, setAttributeValues] =
    useState<Record<string, string | number | string[]>>(initialItemsMap);

  // Get collections list
  const { data: collectionsData, isLoading: isLoadingCollections } =
    useGetAttributeCollectionsQuery({
      enabled: Boolean(organizationId),
      organizationId,
    }) as { data?: AttributeCollectionResponse; isLoading: boolean };

  // Get selected collection details
  const { data: collectionDetails, isLoading: isLoadingDetails } =
    useGetAttributeCollectionQuery({
      attributeCollectionId: selectedCollection,
      enabled: Boolean(organizationId && selectedCollection),
      organizationId,
    }) as { data?: AttributeCollectionResponse; isLoading: boolean };

  const handleCollectionChange = (collectionId: string) => {
    setSelectedCollection(collectionId);
    setAttributeValues(initialItemsMap);

    // When collection changes, update parent with initial values for this collection
    if (collectionId) {
      const attributeItems: AttributeItem[] = Object.entries(
        initialItemsMap
      ).map(([attributeId, values]) => ({
        attribute_id: attributeId,
        values,
      }));
      onChange(attributeItems);
    } else {
      // If no collection selected, send empty array
      onChange([]);
    }
  };

  const handleAttributeValueChange = useCallback(
    (
      attributeId: string,
      attributeType: string,
      value: string | number | string[]
    ) => {
      let attributeValue: string | number | string[] = value;

      if (attributeType === AttributeTypeEnum.NUMBER) {
        attributeValue =
          typeof value === "number"
            ? value
            : typeof value === "string"
              ? parseInt(value, 10)
              : 0;
      } else if (attributeType === AttributeTypeEnum.CHECKBOX) {
        attributeValue = Array.isArray(value) ? value : [value.toString()];
      } else {
        attributeValue =
          typeof value === "string"
            ? value
            : Array.isArray(value)
              ? value[0]
              : value.toString();
      }

      setAttributeValues((prev) => ({
        ...prev,
        [attributeId]: attributeValue,
      }));

      const attributeItems = Object.entries({
        ...attributeValues,
        [attributeId]: attributeValue,
      }).map(([attrId, vals]) => ({
        attribute_id: attrId,
        values: vals,
      }));

      onChange(attributeItems);
    },
    [onChange, attributeValues]
  );

  if (isLoadingCollections) {
    return (
      <div>
        {t("modal.addSku.loadingCollections", "Loading collections...")}
      </div>
    );
  }

  if (
    !collectionsData?.data?.attribute_collections ||
    collectionsData.data.attribute_collections.length === 0
  ) {
    return (
      <Alert variant="default">
        <AlertDescription>
          {t("modal.addSku.noCollections", "No attribute collections found.")}
        </AlertDescription>
      </Alert>
    );
  }

  const collectionOptions = collectionsData.data.attribute_collections.map(
    (collection) => ({
      label: collection.name,
      value: collection.id,
    })
  );

  return (
    <div className="space-y-4">
      <Select value={selectedCollection} onValueChange={handleCollectionChange}>
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={t(
              "modal.addSku.selectCollection",
              "Select a collection"
            )}
          />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-[200px]">
            {collectionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>

      {selectedCollection && isLoadingDetails && (
        <div className="p-4 text-center">
          {t(
            "modal.addSku.loadingCollectionDetails",
            "Loading collection details..."
          )}
        </div>
      )}

      {selectedCollection &&
        !isLoadingDetails &&
        collectionDetails?.data?.attribute_collection?.attribute_items &&
        collectionDetails.data.attribute_collection.attribute_items.length >
          0 && (
          <ScrollArea className="h-[300px] pr-4 -mr-4">
            <div className="space-y-4">
              {collectionDetails.data.attribute_collection.attribute_items.map(
                (item) => (
                  <div
                    key={item.attribute.id}
                    className="grid gap-2 border p-3 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.attribute.name}</span>
                      {item.is_required && (
                        <span className="text-destructive text-sm">*</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.attribute.description ||
                        t("modal.addSku.noDescription", "No description")}
                    </div>
                    <AttributeValueInput
                      attribute={{
                        created_at: "",
                        description: item.attribute.description || "",
                        id: item.attribute.id,
                        name: item.attribute.name,
                        presets: item.attribute.presets || [],
                        type: item.attribute.type as AttributeTypeEnum,
                        unit: null,
                        updated_at: "",
                      }}
                      initialValue={attributeValues[item.attribute.id] || []}
                      onChange={(value) =>
                        handleAttributeValueChange(
                          item.attribute.id,
                          item.attribute.type,
                          value
                        )
                      }
                    />
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        )}

      {selectedCollection &&
        !isLoadingDetails &&
        (!collectionDetails?.data?.attribute_collection?.attribute_items ||
          collectionDetails.data.attribute_collection.attribute_items.length ===
            0) && (
          <Alert variant="default">
            <AlertDescription>
              {t(
                "modal.addSku.collectionEmpty",
                "This collection has no attributes."
              )}
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
};
