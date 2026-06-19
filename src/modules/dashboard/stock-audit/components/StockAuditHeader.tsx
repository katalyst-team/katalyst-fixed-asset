import { useTranslation } from "next-i18next";
import React from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import { StockMovementTypeDirectionEnum } from "@/services/stockMovement/getStockMovementDataService";
import { StockAuditFilterOptions } from "@/types/stock-audit";
import { formatStockMovementTypeName } from "@/utils/stockMovementType";

import StockAuditFilter from "./StockAuditFilter";

interface StockAuditHeaderProps {
  goToNextPage: () => void;
  goToPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  itemsPerPage: number;
  selectedStoreId: string;
  setItemsPerPage: (limit: number) => void;
  setSelectedStoreId: (id: string) => void;
  stockMovementTypeName?: string;
  storeOptions: { label: string; value: string }[];
  onApplyFilters: (filters: StockAuditFilterOptions) => void;
  onCreateAudit: () => void;
  onStockMovementTypeChange: (value: string) => void;
}

const StockAuditHeader: React.FC<StockAuditHeaderProps> = ({
  goToNextPage,
  goToPrevPage,
  hasNextPage,
  hasPrevPage,
  itemsPerPage,
  selectedStoreId,
  setItemsPerPage,
  setSelectedStoreId,
  stockMovementTypeName,
  storeOptions,
  onApplyFilters,
  onCreateAudit,
  onStockMovementTypeChange,
}) => {
  const { t } = useTranslation("stock-audit");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({ organizationId });

  const stockMovementTypeOptions = React.useMemo(() => {
    const options = [{ label: t("filter.options.allTypes"), value: "all" }];
    if (stockMovementTypesData) {
      options.push(
        ...stockMovementTypesData
          .filter((smt) => smt.direction === StockMovementTypeDirectionEnum.INBOUND)
          .map((smt) => ({
            label: formatStockMovementTypeName(smt.name),
            value: smt.name,
          })),
      );
    }
    return options;
  }, [stockMovementTypesData, t]);

  return (
    <div className="flex flex-col lg:flex-row w-full justify-between gap-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <Combobox
          options={storeOptions}
          placeholder="Select store..."
          value={selectedStoreId}
          onSelect={(value) => setSelectedStoreId(value || "0")}
        />
        <Button size="sm" onClick={onCreateAudit}>
          {t("buttons.startAudit")}
        </Button>
        <Combobox
          options={stockMovementTypeOptions}
          placeholder={t("filter.stockMovementType.placeholder", "All types")}
          value={stockMovementTypeName || "all"}
          onSelect={(value) => onStockMovementTypeChange(value ?? "all")}
        />
      </div>

      <div className="flex flex-col lg:items-center lg:flex-row gap-2">
        <StockAuditFilter
          currentStoreId={selectedStoreId}
          onApply={onApplyFilters}
        />
        <Select
          value={String(itemsPerPage)}
          onValueChange={(value) => {
            setItemsPerPage(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue placeholder="List" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="200">200</SelectItem>
            <SelectItem value="500">500</SelectItem>
            <SelectItem value="1000">1000</SelectItem>
          </SelectContent>
        </Select>
        <PaginationCursor
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onNext={goToNextPage}
          onPrev={goToPrevPage}
        />
      </div>
    </div>
  );
};

export default StockAuditHeader;
