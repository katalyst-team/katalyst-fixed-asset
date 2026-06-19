import { ArrowLeft, MapPin, Search } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import ExportButton from "@/components/shared/ExportButton";
import InventoryDateFilter from "@/components/shared/InventoryDateFilter";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/user-context";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import {
  StockMovementType,
  StockMovementTypeDirectionEnum,
} from "@/services/stockMovement/getStockMovementDataService";
import { InventoryAreaDetailFilterOptions } from "@/types/inventory-area";
import { formatStockMovementTypeName } from "@/utils/stockMovementType";

interface DetailInventoryAreaHeaderProps {
  sectionName: string;
  currentFilters: InventoryAreaDetailFilterOptions;
  onApplyFilters: (filters: InventoryAreaDetailFilterOptions) => void;
  storeId: string;
  sectionId: string;
  stockMovementTypeIds?: string[];
}

const DetailInventoryAreaHeader: React.FC<DetailInventoryAreaHeaderProps> = ({
  sectionName,
  currentFilters,
  onApplyFilters,
  sectionId,
  stockMovementTypeIds,
  storeId,
}) => {
  const { t } = useTranslation("inventory-area");
  const router = useRouter();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [query, setQuery] = useState(currentFilters.query || "");
  const [dateFrom, setDateFrom] = useState(currentFilters.start_date);
  const [dateTo, setDateTo] = useState(currentFilters.end_date);
  const [stockMovementTypeId, setStockMovementTypeId] = useState(
    stockMovementTypeIds?.[0] || ""
  );

  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const stockMovementTypeOptions = React.useMemo(
    () => [
      { label: t("filter.stockMovementType.all", "All Types"), value: "" },
      ...(stockMovementTypesData ?? [])
        .filter((type: StockMovementType) => type.direction === StockMovementTypeDirectionEnum.INBOUND)
        .map((type: StockMovementType) => ({
          label: formatStockMovementTypeName(type.name),
          value: type.id,
        })),
    ],
    [stockMovementTypesData, t],
  );

  const handleSearch = () => {
    onApplyFilters({ ...currentFilters, cursor: undefined, query });
  };

  const handleDateChange = (from?: string, to?: string) => {
    setDateFrom(from);
    setDateTo(to);
    onApplyFilters({
      ...currentFilters,
      cursor: undefined,
      end_date: to,
      start_date: from,
    });
  };

  const handleStockMovementTypeChange = (value: string) => {
    setStockMovementTypeId(value);
    onApplyFilters({
      ...currentFilters,
      cursor: undefined,
      stock_movement_type_ids: value ? [value] : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <Button
        className="gap-2 text-muted-foreground hover:text-foreground"
        size="sm"
        variant="ghost"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("detail.back")}
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading tracking-tight">
              {sectionName || "—"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("detail.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
          <div className="flex gap-2">
            <Input
              className="w-full md:w-64"
              placeholder={t("detail.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button size="sm" variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Combobox
            options={stockMovementTypeOptions}
            placeholder={t("filter.stockMovementType.placeholder")}
            value={stockMovementTypeId}
            onSelect={(value) => handleStockMovementTypeChange(value || "")}
          />
          <InventoryDateFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={handleDateChange}
          />
          <ExportButton
            inventoryAreaDetailFilters={{
              end_date: dateTo,
              query: currentFilters.query,
              start_date: dateFrom,
              stock_movement_type_ids: stockMovementTypeId ? [stockMovementTypeId] : undefined,
            }}
            inventoryAreaDetailSectionId={sectionId}
            inventoryAreaDetailStoreId={storeId}
            type="inventory-area-detail"
          />
        </div>
      </div>
    </div>
  );
};

export default DetailInventoryAreaHeader;
