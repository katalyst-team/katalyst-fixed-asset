/* eslint-disable simple-import-sort/imports */
/* eslint-disable max-lines */
"use client";

import { Filter } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import type { ParsedUrlQueryInput } from "querystring";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SelectCombobox } from "@/components/ui/select-combobox";
import { useUser } from "@/context/user-context";
import useGetEmployeeDataQuery from "@/hooks/api/employee/getEmployeeDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import useGetStoreAreaDataQuery from "@/hooks/api/store/useGetStoreAreaDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { LedgerFilter } from "@/types/ledger";
import { RfidCategory, RfidType } from "@/types/rfid";
import { formatStockMovementTypeName } from "@/utils/stockMovementType";
import { calculateTimeframeDates, timeframeOptions as originalTimeframeOptions } from "@/utils/timeframe";

interface LedgerV2FilterProps {
  onApply: (filters: LedgerFilter) => void;
}

const LedgerV2Filter: React.FC<LedgerV2FilterProps> = ({ onApply }) => {
  const { t } = useTranslation("ledger");
  const { tokenPayload, selectedTeam } = useUser();
  const router = useRouter();
  const organizationId = tokenPayload?.organization_id ?? "";

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
  const { data: employeeData, isLoading: isLoadingEmployees } =
    useGetEmployeeDataQuery({
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
  const [orderDirection, setOrderDirection] = React.useState<
    string | undefined
  >("DESC");
  const [editorAorId, setEditorAorId] = React.useState<string | undefined>(
    "all"
  );
  const [selectedStoreForSection, setSelectedStoreForSection] = React.useState<
    string | undefined
  >("all");
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
    // Filter for INBOUND types only
    return stockMovementTypesData.filter(
      (type) => type.direction === "INBOUND"
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
    return originalTimeframeOptions.filter((option) => option.value !== "30D");
  }, []);

  // Initialize from URL once
  const hasInitializedFromUrlRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (!router.isReady || hasInitializedFromUrlRef.current) return;
    hasInitializedFromUrlRef.current = true;
    const q = router.query as Record<string, string | string[]>;
    const urlStockTypes = q.stock_movement_type_ids;
    const stockIds = Array.isArray(urlStockTypes)
      ? urlStockTypes
      : urlStockTypes
        ? [urlStockTypes]
        : [];
    const urlSectionId =
      typeof q.section_id === "string" ? q.section_id : undefined;
    const urlRfidCategory =
      typeof q.rfid_category === "string" ? q.rfid_category : undefined;
    const urlRfidType =
      typeof q.rfid_type === "string" ? q.rfid_type : undefined;
    const urlStart =
      typeof q.last_updated_start === "string" ? q.last_updated_start : "";
    const urlEnd =
      typeof q.last_updated_end === "string" ? q.last_updated_end : "";
    const urlOrderDirection =
      typeof q.order_direction === "string" ? q.order_direction : undefined;
    const urlEditorAorId =
      typeof q.editor_aor_id === "string" ? q.editor_aor_id : undefined;
    const urlSelectedStore =
      typeof q.selected_store_for_section === "string"
        ? q.selected_store_for_section
        : undefined;
    const urlTimeframe = typeof q.timeframe === "string" ? q.timeframe : "all";

    // Determine store selection with priority: URL > selectedTeam > "all"
    let storeSelection = "all";
    if (urlSelectedStore && urlSelectedStore !== "all") {
      storeSelection = urlSelectedStore;
    } else if (selectedTeam !== "0") {
      storeSelection = selectedTeam;
    }

    setStockMovementTypeIds(stockIds as string[]);
    setSectionId(urlSectionId ?? "all");
    setRfidCategory((urlRfidCategory as string | undefined) ?? "all");
    setRfidType((urlRfidType as string | undefined) ?? "all");
    setTimeframe(urlTimeframe);
    setLastUpdatedStart(urlStart);
    setLastUpdatedEnd(urlEnd);
    setOrderDirection(urlOrderDirection ?? "DESC");
    setEditorAorId(urlEditorAorId ?? "all");
    setSelectedStoreForSection(storeSelection);

    const hydratedFilters: LedgerFilter = {
      editor_aor_id:
        urlEditorAorId && urlEditorAorId !== "all" ? urlEditorAorId : undefined,
      last_updated_end: urlEnd || undefined,
      last_updated_start: urlStart || undefined,
      order_direction:
        urlOrderDirection && urlOrderDirection !== "all"
          ? (urlOrderDirection as "ASC" | "DESC")
          : "DESC",
      rfid_category:
        urlRfidCategory && urlRfidCategory !== "all"
          ? (urlRfidCategory as RfidCategory)
          : undefined,
      rfid_type:
        urlRfidType && urlRfidType !== "all"
          ? (urlRfidType as RfidType)
          : undefined,
      section_id:
        urlSectionId && urlSectionId !== "all" ? urlSectionId : undefined,
      selected_store_for_section:
        storeSelection !== "all" ? storeSelection : undefined,
      stock_movement_type_ids:
        stockIds.length > 0 ? (stockIds as string[]) : undefined,
    };
    onApply(hydratedFilters);
  }, [router.isReady, router.query, onApply, selectedTeam]);

  const handleApply = () => {
    const filters: LedgerFilter = {
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

    // Sync to URL
    const nextQuery: ParsedUrlQueryInput = { ...router.query };
    delete nextQuery.editor_aor_id;
    delete nextQuery.last_updated_start;
    delete nextQuery.last_updated_end;
    delete nextQuery.order_direction;
    delete nextQuery.section_id;
    delete nextQuery.stock_movement_type_ids;
    delete nextQuery.rfid_category;
    delete nextQuery.rfid_type;
    delete nextQuery.selected_store_for_section;
    delete nextQuery.timeframe;

    if (filters.editor_aor_id) nextQuery.editor_aor_id = filters.editor_aor_id;
    if (filters.last_updated_start)
      nextQuery.last_updated_start = filters.last_updated_start;
    if (filters.last_updated_end)
      nextQuery.last_updated_end = filters.last_updated_end;
    if (filters.order_direction)
      nextQuery.order_direction = filters.order_direction;
    if (filters.section_id) nextQuery.section_id = filters.section_id;
    if (filters.stock_movement_type_ids)
      nextQuery.stock_movement_type_ids = filters.stock_movement_type_ids;
    if (filters.rfid_category) nextQuery.rfid_category = filters.rfid_category;
    if (filters.rfid_type) nextQuery.rfid_type = filters.rfid_type;
    if (filters.selected_store_for_section)
      nextQuery.selected_store_for_section = filters.selected_store_for_section;
    if (timeframe !== "all") nextQuery.timeframe = timeframe;

    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
    });
    onApply(filters);
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
    const nextQuery: ParsedUrlQueryInput = { ...router.query };
    delete nextQuery.editor_aor_id;
    delete nextQuery.last_updated_start;
    delete nextQuery.last_updated_end;
    delete nextQuery.order_direction;
    delete nextQuery.section_id;
    delete nextQuery.stock_movement_type_ids;
    delete nextQuery.rfid_category;
    delete nextQuery.rfid_type;
    delete nextQuery.selected_store_for_section;
    delete nextQuery.timeframe;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
    });
    // Apply empty filters to trigger API refetch
    onApply({});
    setIsPopoverOpen(false);
  };

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
      <PopoverContent
        align="end"
        className="w-[500px] p-0 flex flex-col max-h-[80vh]"
      >
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
            placeholder={t(
              "filter.timeframePlaceholder",
              "Select time range..."
            )}
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
            placeholder={t(
              "filter.orderDirectionPlaceholder",
              "Select sort order..."
            )}
            value={orderDirection}
            onSelect={setOrderDirection}
          />

          {/* Editor/Operator Selection */}
          <Combobox
            label={t("filter.editor", "Editor/Operator")}
            options={employeeOptions}
            placeholder={
              isLoadingEmployees
                ? t("common.loading", "Loading...")
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
                  ? t("common.loading", "Loading...")
                  : t("filter.storePlaceholder", "Select store...")
              }
              value={selectedStoreForSection}
              onSelect={setSelectedStoreForSection}
            />
          )}

          {/* Store Area Selection - Show when: 1) selectedTeam !== "0" OR 2) selectedTeam === "0" AND store is selected */}
          {(selectedTeam !== "0" ||
            (selectedTeam === "0" && selectedStoreForSection !== "all")) && (
            <SelectCombobox
              label={t("filter.storeArea", "Store Area")}
              options={storeAreaOptions}
              placeholder={
                isLoadingStoreAreas
                  ? t("common.loading", "Loading...")
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
                ? t("common.loading", "Loading...")
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
              <Button onClick={handleApply}>
                {t("filter.apply", "Apply")}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LedgerV2Filter;
