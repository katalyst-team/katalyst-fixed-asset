"use client";

import ButtonDetail from "@/components/shared/ButtonDetail";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { InventoryItem as InventoryItemType } from "@/types/inventory";

import {
  formatAttributeValues,
  getDisplayAttributeValues,
  InventoryCommonAttribute,
} from "./utils";

// Column IDs for inventory
const COLUMN_ID_NO = "no";
const COLUMN_ID_PRODUCT_NAME = "productName";
const COLUMN_ID_INTERNAL_CODE = "internalCode";
const COLUMN_ID_STORE = "store";
const COLUMN_ID_CATEGORY = "category";
const COLUMN_ID_AMOUNT = "amount";
const COLUMN_ID_AGING = "aging";
const COLUMN_ID_ACTION = "action";

interface InventoryItemProps {
  commonAttributes: InventoryCommonAttribute[];
  isColumnVisible: (columnId: string) => boolean;
  item: InventoryItemType;
  num: number;
  selectedStoreId?: string;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  commonAttributes,
  isColumnVisible,
  item,
  num,
  selectedStoreId,
}) => {
  return (
    <TableRow>
      {isColumnVisible(COLUMN_ID_NO) && <TableCell>{num}</TableCell>}
      {isColumnVisible(COLUMN_ID_PRODUCT_NAME) && (
        <TableCell>{item.name}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_INTERNAL_CODE) && (
        <TableCell className="font-mono text-xs">
          {item.internal_code ?? "-"}
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_STORE) && (
        <TableCell>{item.store_name || "-"}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_CATEGORY) && (
        <TableCell>
          {item.categories && item.categories.length > 0
            ? item.categories?.map((category) => category.name).join(", ")
            : "-"}
        </TableCell>
      )}
      {isColumnVisible(COLUMN_ID_AMOUNT) && (
        <TableCell>{item.quantity}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_AGING) && (
        <TableCell>{item.aging}</TableCell>
      )}
      {isColumnVisible(COLUMN_ID_ACTION) && (
        <TableCell>
          <ButtonDetail
            href={
              selectedStoreId
                ? `/dashboard/inventory/store/${selectedStoreId}/${item.id}`
                : `/dashboard/inventory/${item.id}`
            }
          />
        </TableCell>
      )}
      {/* Dynamic attribute columns */}
      {commonAttributes.map((attribute) => {
        const columnId = `attr-${attribute.id}`;
        if (!isColumnVisible(columnId)) {
          return null;
        }
        const displayValues = getDisplayAttributeValues(item.attributes, attribute.id);
        const formattedValue = formatAttributeValues(displayValues);

        return (
          <TableCell key={attribute.id} className="min-w-[120px]">
            {formattedValue !== "-" ? (
              <div className="flex flex-wrap gap-1">
                {displayValues.map((value, index) => (
                  <Badge
                    key={`${value}-${index}`}
                    className="text-xs"
                    variant="secondary"
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export default InventoryItem;
