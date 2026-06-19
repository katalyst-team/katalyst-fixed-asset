import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonEdit from "@/components/shared/ButtonEdit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  StockMovementDirection,
  StockMovementType,
} from "@/services/stock-movement-types/getStockMovementTypesService";
import { StockMovementTypeDirectionEnum } from "@/services/stockMovement/getStockMovementDataService";
import { convertToTitleCase } from "@/utils/text";

import { LEDGER_STOCK_MOVEMENT_DIRECTION } from "../constants";
import EditStockMovementTypeModal from "./EditStockMovementTypeModal";

interface StockMovementTypesTableProps {
  data: StockMovementType[];
  onDelete: (id: string) => void;
  directionFilter?: StockMovementDirection;
}

const StockMovementTypesTable: React.FC<StockMovementTypesTableProps> = ({
  data,
  onDelete,
  directionFilter,
}) => {
  const { t } = useTranslation("stock-movement-types");
  const [editingItem, setEditingItem] = useState<StockMovementType | null>(null);

  const getDirectionBadgeColor = (direction: StockMovementDirection) => {
    switch (direction) {
      case StockMovementTypeDirectionEnum.INBOUND:
        return "bg-green-100 text-green-800";
      case StockMovementTypeDirectionEnum.OUTBOUND:
        return "bg-blue-100 text-blue-800";
      case StockMovementTypeDirectionEnum.LEDGER:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredData = React.useMemo(
    () =>
      data
        .filter((item) => item.direction !== LEDGER_STOCK_MOVEMENT_DIRECTION)
        .filter((item) => {
          // Apply direction filter if set
          if (!directionFilter) return true;
          return item.direction === directionFilter;
        })
        .sort((a, b) => {
          // Primary sort: direction (alphabetically)
          const directionCompare = a.direction.localeCompare(b.direction);
          if (directionCompare !== 0) return directionCompare;

          // Secondary sort: name (alphabetically)
          return a.name.localeCompare(b.name);
        }),
    [data, directionFilter]
  );

  return (
    <>
      <div className="w-full max-w-[91vw] lg:max-w-full overflow-x-auto">
        <Table className="rounded-md border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">{t("table.header.no")}</TableHead>
              <TableHead>{ t("table.header.name")}</TableHead>
              <TableHead>{t("table.header.direction")}</TableHead>
              <TableHead className="w-[100px]">{t("table.header.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{convertToTitleCase(item.name)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDirectionBadgeColor(
                      item.direction
                    )}`}
                  >
                    {t(`directions.${item.direction.toLowerCase()}`)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex h-full gap-2">
                    <ButtonEdit
                      onClick={() => setEditingItem(item)}
                    />
                    <ButtonDelete
                      onSubmit={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingItem && (
        <EditStockMovementTypeModal
          isOpen={!!editingItem}
          item={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
};

export default StockMovementTypesTable;
