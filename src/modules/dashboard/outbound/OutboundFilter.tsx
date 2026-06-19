/* eslint-disable simple-import-sort/imports */
 
"use client";

import { Filter } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { SelectCombobox } from "@/components/ui/select-combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/context/user-context";
import useGetEmployeeDataQuery from "@/hooks/api/employee/getEmployeeDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import useGetStoreAreaDataQuery from "@/hooks/api/store/useGetStoreAreaDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { OutboundFilterOptions } from "@/types/outbound";
import { RfidCategory, RfidType } from "@/types/rfid";
import { formatStockMovementTypeName } from "@/utils/stockMovementType";
import { calculateTimeframeDates, timeframeOptions as originalTimeframeOptions } from "@/utils/timeframe";

import { useOutboundStore } from "./store";

const OutboundFilter: React.FC = () => {
  const { t } = useTranslation("outbound");
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { currentFilters, resetPagination, setFilters } = useOutboundStore(
    useShallow((state) => ({
      currentFilters: state.filters,
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
    }))
  );

  const getFiltersKey = React.useCallback(
    (filters: OutboundFilterOptions) => JSON.stringify(filters ?? {}),
    []
  );

  const handleSetFilters = React.useCallback(
    (filters: OutboundFilterOptions) => {
      resetPagination();
      setFilters(filters);
    },
    [resetPagination, setFilters]
  );

  // API Data Fetching
  const {
    data: stockMovementTypesData,
    isLoading: isLoadingStockMovementTypes,
  } = useGetStockMovementTypesQuery({
    organizationId,
  });

  // Get store data for store selection when selectedTeam is "0"
  const { data: storeData, isLoading: isLoadingStores } = useGetStoreDataQuery({
    organizationId,
  });

  // Get employee data for editor filter
  const { data: employeeData, isLoading: isLoadingEmployees } = useGetEmployeeDataQuery({
    organizationId,
  });

  // State Management
  const [stockMovementTypeIds, setStockMovementTypeIds] = React.useState<
    string[]
  >([]);
  const [sectionId, setSectionId] = React.useState<string | undefined>("all");
  const [rfidCategory, setRfidCategory] = React.useState<string | undefined>(
    "all"
  );
  const [rfidType, setRfidType] = React.useState<string | undefined>("all");
  const [timeframe, setTimeframe] = React.useState<string>("all");
  const [lastUpdatedStart, setLastUpdatedStart] = React.useState<string>("");
  const [lastUpdatedEnd, setLastUpdatedEnd] = React.useState<string>("");
  const [orderDirection, setOrderDirection] = React.useState<string | undefined>("DESC");
  const [editorAorId, setEditorAorId] = React.useState<string | undefined>("all");
  const [selectedStoreForSection, setSelectedStoreForSection] = React.useState<string | undefined>("all");
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  // Determine which store ID to use for fetching areas
  const storeIdForAreas = React.useMemo(() => {
    if (selectedTeam !== "0") {
      return selectedTeam; // Use selected team as store
    } else {
      return selectedStoreForSection === "all" ? "" : selectedStoreForSection;
    }
  }, [selectedTeam, selectedStoreForSection]);

  const { data: storeAreaData, isLoading: isLoadingStoreAreas } =
    useGetStoreAreaDataQuery({
      organizationId,
      storeId: storeIdForAreas || "",
    });

  const lastUpdatedStartDate = React.useMemo(
    () => (lastUpdatedStart ? new Date(lastUpdatedStart) : undefined),
    [lastUpdatedStart]
  );
  const lastUpdatedEndDate = React.useMemo(
    () => (lastUpdatedEnd ? new Date(lastUpdatedEnd) : undefined),
    [lastUpdatedEnd]
  );

  function toStartOfDayISO(d?: Date): string | "" {
    if (!d) return "";
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy.toISOString();
  }

  function toEndOfDayISO(d?: Date): string | "" {
    if (!d) return "";
    const copy = new Date(d);
    copy.setHours(23, 59, 59, 999);
    return copy.toISOString();
  }

  // Options for dropdowns
  const stockMovementTypeOptions = React.useMemo(() => {
    if (!stockMovementTypesData) return [];
    // Filter for OUTBOUND types only
    return stockMovementTypesData.filter(
      (type) => type.direction === "OUTBOUND"
    );
  }, [stockMovementTypesData]);

  const stockMovementTypeMultiOptions = React.useMemo(
    () =>
      stockMovementTypeOptions.map((type) => ({
        label: formatStockMovementTypeName(type.name ?? type.id),
        value: type.id,
      })),
    [stockMovementTypeOptions]
  );

  // Order direction options
  const orderDirectionOptions = [
    { label: t("filter.options.allDirections", "Default"), value: "all" },
    { label: t("filter.options.newest", "Newest First"), value: "DESC" },
    { label: t("filter.options.oldest", "Oldest First"), value: "ASC" },
  ];

  // Employee options for editor filter
  const employeeOptions = React.useMemo(() => {
    const options = [
      { label: t("filter.options.allEditors", "All Editors"), value: "all" },
    ];
    if (employeeData?.data?.account_organizations) {
      options.push(
        ...employeeData.data.account_organizations.map((employee) => ({
          label: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        }))
      );
    }
    return options;
  }, [employeeData, t]);

  // Store options for store selection (when selectedTeam is "0")
  const storeOptions = React.useMemo(() => {
    const options = [
      { label: t("filter.options.selectStore", "Select Store"), value: "all" },
    ];
    if (storeData?.data?.stores) {
      options.push(
        ...storeData.data.stores.map((store) => ({
          label: store.name,
          value: store.id,
        }))
      );
    }
    return options;
  }, [storeData, t]);

  const storeAreaOptions = React.useMemo(() => {
    const options = [
      { label: t("filter.options.allAreas", "All Areas"), value: "all" },
    ];
    if (storeAreaData?.data?.sections) {
      options.push(
        ...storeAreaData.data.sections.map((area) => ({
          label: area.name,
          value: area.id,
        }))
      );
    }
    return options;
  }, [storeAreaData, t]);

  const rfidCategoryOptions = [
    {
      label: t("filter.options.allRfidCategories", "All RFID Categories"),
      value: "all",
    },
    { label: t("rfidCategory.single", "Single"), value: RfidCategory.SINGLE },
    {
      label: t("rfidCategory.package", "Package"),
      value: RfidCategory.PACKAGE,
    },
  ];

  const rfidTypeOptions = [
    { label: t("filter.options.allRfidTypes", "All RFID Types"), value: "all" },
    { label: t("rfidType.reusable", "Reusable"), value: RfidType.REUSABLE },
    {
      label: t("rfidType.disposable", "Disposable"),
      value: RfidType.DISPOSABLE,
    },
  ];

  // Custom timeframe options without 30 days
  const timeframeOptions = React.useMemo(() => {
    return originalTimeframeOptions.filter(option => option.value !== "30D");
  }, []);

  // Handle timeframe selection
  const handleTimeframeChange = React.useCallback((selectedTimeframe: string) => {
    setTimeframe(selectedTimeframe);
    
    if (selectedTimeframe === "all") {
      setLastUpdatedStart("");
      setLastUpdatedEnd("");
    } else {
      const dates = calculateTimeframeDates(selectedTimeframe);
      if (dates) {
        setLastUpdatedStart(dates.startDate);
        setLastUpdatedEnd(dates.endDate);
      }
    }
  }, []);

  // selection handled via MultiCombobox onValueChange

  const handleApply = () => {
    const filters: OutboundFilterOptions = {
      editor_aor_id: editorAorId === "all" ? undefined : editorAorId,
      last_updated_end: lastUpdatedEnd || undefined,
      last_updated_start: lastUpdatedStart || undefined,
      order_direction:
        orderDirection === "all" ? "DESC" : (orderDirection as "ASC" | "DESC"),
      rfid_category:
        rfidCategory === "all" ? undefined : (rfidCategory as RfidCategory),
      rfid_type: rfidType === "all" ? undefined : (rfidType as RfidType),
      section_id: sectionId === "all" ? undefined : sectionId,
      selected_store_for_section:
        selectedStoreForSection === "all" ? undefined : selectedStoreForSection,
      stock_movement_type_ids:
        stockMovementTypeIds.length > 0 ? stockMovementTypeIds : undefined,
    };
    if (getFiltersKey(filters) !== getFiltersKey(currentFilters)) {
      handleSetFilters(filters);
    }
    setIsPopoverOpen(false);
  };

  const handleReset = () => {
    setStockMovementTypeIds([]);
    setSectionId("all");
    setRfidCategory("all");
    setRfidType("all");
    setTimeframe("all");
    setLastUpdatedStart("");
    setLastUpdatedEnd("");
    setOrderDirection("DESC");
    setEditorAorId("all");
    setSelectedStoreForSection("all");
    if (getFiltersKey({}) !== getFiltersKey(currentFilters)) {
      handleSetFilters({});
    }
    setIsPopoverOpen(false);
  };

  const hasActiveFilters =
    stockMovementTypeIds.length > 0 ||
    sectionId !== "all" ||
    rfidCategory !== "all" ||
    rfidType !== "all" ||
    timeframe !== "all" ||
    lastUpdatedStart ||
    lastUpdatedEnd ||
    orderDirection !== "DESC" ||
    editorAorId !== "all" ||
    (selectedTeam === "0" && selectedStoreForSection !== "all");

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {t("filter.button", "Filter")}
          {hasActiveFilters && (
            <Badge className="ml-2 h-4 w-4 p-0 text-xs" variant="secondary">
              !
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[500px] p-0 flex flex-col max-h-[80vh]">
        <div className="p-4 border-b bg-background">
          <h2 className="font-semibold">
            {t("filter.title", "Filter Options")}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Timeframe Selector */}
          <Combobox
            label={t("filter.timeframe", "Time Range")}
            options={timeframeOptions}
            placeholder={t("filter.timeframePlaceholder", "Select time range...")}
            value={timeframe}
            onSelect={(value) => handleTimeframeChange(value || "all")}
          />

          {/* Date Range Filters */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("filter.lastUpdatedStart", "Last Updated Start")}
            </Label>
            <DatePicker
              buttonClassName="w-full"
              className="w-full"
              id="lastUpdatedStart"
              placeholder={t("filter.lastUpdatedStart", "Last Updated Start")}
              value={lastUpdatedStartDate}
              onChangeAction={(d) => setLastUpdatedStart(toStartOfDayISO(d))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("filter.lastUpdatedEnd", "Last Updated End")}
            </Label>
            <DatePicker
              buttonClassName="w-full"
              className="w-full"
              id="lastUpdatedEnd"
              placeholder={t("filter.lastUpdatedEnd", "Last Updated End")}
              value={lastUpdatedEndDate}
              onChangeAction={(d) => setLastUpdatedEnd(toEndOfDayISO(d))}
            />
          </div>

          {/* Order Direction Selection */}
          <Combobox
            label={t("filter.orderDirection", "Sort Order")}
            options={orderDirectionOptions}
            placeholder={t("filter.orderDirectionPlaceholder", "Select sort order...")}
            value={orderDirection}
            onSelect={setOrderDirection}
          />

          {/* Editor/Operator Selection */}
          <Combobox
            label={t("filter.editor", "Editor/Operator")}
            options={employeeOptions}
            placeholder={
              isLoadingEmployees
                ? t("loading", "Loading...")
                : t("filter.editorPlaceholder", "Select editor...")
            }
            value={editorAorId}
            onSelect={setEditorAorId}
          />

          {/* Store Selection - Only show when selectedTeam is "0" */}
          {selectedTeam === "0" && (
            <Combobox
              label={t("filter.store", "Store")}
              options={storeOptions}
              placeholder={
                isLoadingStores
                  ? t("loading", "Loading...")
                  : t("filter.storePlaceholder", "Select store...")
              }
              value={selectedStoreForSection}
              onSelect={setSelectedStoreForSection}
            />
          )}

          {/* Store Area Selection - Show when: 1) selectedTeam !== "0" OR 2) selectedTeam === "0" AND store is selected */}
          {(selectedTeam !== "0" || (selectedTeam === "0" && selectedStoreForSection !== "all")) && (
            <SelectCombobox
              label={t("filter.storeArea", "Store Area")}
              options={storeAreaOptions}
              placeholder={
                isLoadingStoreAreas
                  ? t("loading", "Loading...")
                  : t("filter.storeAreaPlaceholder", "Select store area...")
              }
              value={sectionId}
              onSelect={setSectionId}
            />
          )}

          {/* RFID Category Selection */}
          <Combobox
            label={t("filter.rfidCategory", "RFID Category")}
            options={rfidCategoryOptions}
            placeholder={t(
              "filter.rfidCategoryPlaceholder",
              "Select RFID category..."
            )}
            value={rfidCategory}
            onSelect={setRfidCategory}
          />

          {/* RFID Type Selection */}
          <Combobox
            label={t("filter.rfidType", "RFID Type")}
            options={rfidTypeOptions}
            placeholder={t("filter.rfidTypePlaceholder", "Select RFID type...")}
            value={rfidType}
            onSelect={setRfidType}
          />

          {/* Status filter removed intentionally */}

          {/* Stock Movement Types Selection */}
          <MultiCombobox
            disabled={isLoadingStockMovementTypes}
            emptyMessage={t(
              "filter.noStockMovementTypes",
              "No stock movement types available"
            )}
            label={t("filter.stockMovementTypes", "Stock Movement Types")}
            options={stockMovementTypeMultiOptions}
            placeholder={
              isLoadingStockMovementTypes
                ? t("loading", "Loading...")
                : t(
                    "filter.stockMovementTypesPlaceholder",
                    "Select stock movement types..."
                  )
            }
            selectedValues={stockMovementTypeIds}
            onValueChange={setStockMovementTypeIds}
          />

        </div>
        <div className="border-t bg-background p-4">
          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleReset}>
              {t("filter.reset", "Reset")}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPopoverOpen(false)}>
                {t("filter.cancel", "Cancel")}
              </Button>
              <Button onClick={handleApply}>{t("filter.apply", "Apply")}</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default OutboundFilter;
