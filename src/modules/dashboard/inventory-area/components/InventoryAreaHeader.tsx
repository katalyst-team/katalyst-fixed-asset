import { Filter, Search } from "lucide-react";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import ExportButton from "@/components/shared/ExportButton";
import InventoryDateFilter from "@/components/shared/InventoryDateFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multiSelect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/context/user-context";
import useGetInventoryAreaListQuery from "@/hooks/api/inventory-area/useGetInventoryAreaListQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import {
  StockMovementType,
  StockMovementTypeDirectionEnum,
} from "@/services/stockMovement/getStockMovementDataService";
import {
  InventoryAreaFilterOptions,
  InventoryAreaSortOption,
} from "@/types/inventory-area";
import { formatStockMovementTypeName } from "@/utils/stockMovementType";

interface InventoryAreaHeaderProps {
  initialFilters?: InventoryAreaFilterOptions;
  selectedStoreId: string;
  setSelectedStoreId: (id: string) => void;
  storeOptions: { label: string; value: string }[];
  onApplyFilters: (filters: InventoryAreaFilterOptions) => void;
}

const InventoryAreaHeader: React.FC<InventoryAreaHeaderProps> = ({
  initialFilters,
  selectedStoreId,
  setSelectedStoreId,
  storeOptions,
  onApplyFilters,
}) => {
  const { t } = useTranslation("inventory-area");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [query, setQuery] = useState("");
  const [rfidName, setRfidName] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [sort, setSort] = useState<InventoryAreaSortOption | "">("");
  const [stockMovementTypeId, setStockMovementTypeId] = useState("");
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({
    organizationId,
  });
  const { data: sectionsData } = useGetInventoryAreaListQuery({
    enabled: Boolean(organizationId && selectedStoreId),
    filters: {
      ...(stockMovementTypeId && { stock_movement_type_id: stockMovementTypeId }),
      ...(dateFrom && { start_date: dateFrom }),
      ...(dateTo && { end_date: dateTo }),
    },
    organizationId,
    storeId: selectedStoreId,
  });

  const sortOptions = [
    { label: t("filter.options.name"), value: "NAME" },
    { label: t("filter.options.quantityAsc"), value: "QUANTITY_ASC" },
    { label: t("filter.options.quantityDesc"), value: "QUANTITY_DESC" },
  ];

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

  React.useEffect(() => {
    setQuery(initialFilters?.query ?? "");
    setRfidName(initialFilters?.rfid_name ?? "");
    setSelectedAreas(initialFilters?.section_ids ?? []);
    setSort(initialFilters?.sort ?? "");
    setStockMovementTypeId(initialFilters?.stock_movement_type_id ?? "");
    setDateFrom(initialFilters?.start_date);
    setDateTo(initialFilters?.end_date);
  }, [
    initialFilters?.section_ids,
    initialFilters?.end_date,
    initialFilters?.query,
    initialFilters?.rfid_name,
    initialFilters?.sort,
    initialFilters?.start_date,
    initialFilters?.stock_movement_type_id,
  ]);

  const buildFilters = () => ({
    ...(query && { query }),
    ...(rfidName && { rfid_name: rfidName }),
    ...(selectedAreas.length > 0 && { section_ids: selectedAreas }),
    ...(sort && { sort }),
    ...(stockMovementTypeId && { stock_movement_type_id: stockMovementTypeId }),
    ...(dateFrom && { start_date: dateFrom }),
    ...(dateTo && { end_date: dateTo }),
  });

  const handleSearch = () => {
    onApplyFilters(buildFilters());
  };

  const handleApplyFilters = () => {
    onApplyFilters(buildFilters());
    setIsPopoverOpen(false);
  };

  const handleResetFilters = () => {
    setSort("");
    setQuery("");
    setRfidName("");
    setSelectedAreas([]);
    onApplyFilters({
      ...(stockMovementTypeId && { stock_movement_type_id: stockMovementTypeId }),
    });
  };

  const handleDateChange = (from?: string, to?: string) => {
    setDateFrom(from);
    setDateTo(to);
    onApplyFilters({
      ...(query && { query }),
      ...(rfidName && { rfid_name: rfidName }),
      ...(selectedAreas.length > 0 && { section_ids: selectedAreas }),
      ...(sort && { sort }),
      ...(stockMovementTypeId && { stock_movement_type_id: stockMovementTypeId }),
      ...(from && { start_date: from }),
      ...(to && { end_date: to }),
    });
  };

  const handleStockMovementTypeChange = (value: string) => {
    setStockMovementTypeId(value);
    onApplyFilters({
      ...(query && { query }),
      ...(rfidName && { rfid_name: rfidName }),
      ...(selectedAreas.length > 0 && { section_ids: selectedAreas }),
      ...(sort && { sort }),
      ...(value && { stock_movement_type_id: value }),
      ...(dateFrom && { start_date: dateFrom }),
      ...(dateTo && { end_date: dateTo }),
    });
  };

  const activeFiltersCount = [sort].filter(Boolean).length;
  const areaOptions = React.useMemo(
    () => {
      let sections = sectionsData?.data?.sections ?? [];
      if (rfidName) {
        sections = sections.filter((s) => s.quantity > 0);
      }
      const dynamicAreas = sections
        .map((section) => ({ label: section.name, value: section.id }))
        .filter((section) => Boolean(section.label) && Boolean(section.value));

      return dynamicAreas;
    },
    [sectionsData?.data?.sections, rfidName],
  );

  const handleAreaChange = (values: string[]) => {
    setSelectedAreas(values);
    onApplyFilters({
      ...(query && { query }),
      ...(rfidName && { rfid_name: rfidName }),
      ...(values.length > 0 && { section_ids: values }),
      ...(sort && { sort }),
      ...(stockMovementTypeId && { stock_movement_type_id: stockMovementTypeId }),
      ...(dateFrom && { start_date: dateFrom }),
      ...(dateTo && { end_date: dateTo }),
    });
  };

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("header.subtitle")}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="w-full">
            <Combobox
              options={storeOptions}
              placeholder={t("header.selectStore")}
              value={selectedStoreId}
              onSelect={(value) => setSelectedStoreId(value || "")}
            />
          </div>
          <div className="w-full">
            <Combobox
              options={stockMovementTypeOptions}
              placeholder={t("filter.stockMovementType.placeholder")}
              value={stockMovementTypeId}
              onSelect={(value) => handleStockMovementTypeChange(value || "")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <MultiSelect
              className="w-full"
              defaultValue={selectedAreas}
              options={areaOptions}
              placeholder={t("filter.area.placeholder", "Search Area")}
              onValueChange={handleAreaChange}
            />
          </div>
          <div className="lg:col-span-4">
            <div className="flex w-full gap-2">
              <Input
                className="h-9 w-full"
                placeholder={t("header.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                className="h-9 shrink-0"
                size="sm"
                variant="outline"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2">
              <Input
                className="h-9 w-full"
                placeholder={t("header.searchRfidPlaceholder", "Search RFID Name")}
                value={rfidName}
                onChange={(e) => setRfidName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button className="relative h-9 min-w-[110px]" size="sm" variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {t("filter.button")}
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -right-2 -top-2 flex justify-center items-center h-5 w-5 rounded-full p-0 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56">
                  <div className="space-y-4">
                    <h4 className="font-medium leading-none">
                      {t("filter.title")}
                    </h4>
                    <div className="space-y-2">
                      <Label>{t("filter.sort.label")}</Label>
                      <Combobox
                        options={sortOptions}
                        placeholder={t("filter.sort.placeholder")}
                        value={sort}
                        onSelect={(value) =>
                          setSort((value as InventoryAreaSortOption) || "")
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={handleApplyFilters}
                      >
                        {t("filter.apply")}
                      </Button>
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="outline"
                        onClick={handleResetFilters}
                      >
                        {t("filter.reset")}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <InventoryDateFilter
                dateFrom={dateFrom}
                dateTo={dateTo}
                onChange={handleDateChange}
              />
              <ExportButton
                className="h-9 min-w-[110px]"
                inventoryAreaFilters={buildFilters()}
                inventoryAreaStoreId={selectedStoreId}
                type="inventory-area"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAreaHeader;
