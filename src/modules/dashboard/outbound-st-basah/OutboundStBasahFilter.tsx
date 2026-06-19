/* eslint-disable max-lines, simple-import-sort/imports */
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
import { useUrlFilterSync } from "@/hooks/useUrlFilterSync";
import { deserializeArray, deserializeString, serializeArray } from "@/utils/urlFilter";

import { useOutboundStBasahStore } from "./store";

const OutboundStBasahFilter: React.FC = () => {
  const { t } = useTranslation("outbound");
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { currentFilters, resetPagination, setFilters } = useOutboundStBasahStore(
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

  const {
    data: stockMovementTypesData,
    isLoading: isLoadingStockMovementTypes,
  } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const { data: storeData, isLoading: isLoadingStores } = useGetStoreDataQuery({
    organizationId,
  });

  const { data: employeeData, isLoading: isLoadingEmployees } = useGetEmployeeDataQuery({
    organizationId,
  });

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

  const storeIdForAreas = React.useMemo(() => {
    if (selectedTeam !== "0") {
      return selectedTeam;
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

  const stockMovementTypeOptions = React.useMemo(() => {
    if (!stockMovementTypesData) return [];
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

  const orderDirectionOptions = [
    { label: t("filter.options.allDirections", "Default"), value: "all" },
    { label: t("filter.options.newest", "Newest First"), value: "DESC" },
    { label: t("filter.options.oldest", "Oldest First"), value: "ASC" },
  ];

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

  const timeframeOptions = React.useMemo(() => {
    return originalTimeframeOptions.filter(option => option.value !== "30D");
  }, []);

  const fromQuery = React.useCallback(
    (q: Record<string, string | string[] | undefined>): Partial<OutboundFilterOptions> => ({
      editor_aor_id: deserializeString(q.editor_aor_id),
      internal_code: deserializeString(q.internal_code),
      last_updated_end: deserializeString(q.last_updated_end),
      last_updated_start: deserializeString(q.last_updated_start),
      order_direction: deserializeString(q.order_direction) as "ASC" | "DESC" | undefined,
      rfid_category: deserializeString(q.rfid_category) as RfidCategory | undefined,
      rfid_name: deserializeString(q.rfid_name),
      rfid_type: deserializeString(q.rfid_type) as RfidType | undefined,
      section_id: deserializeString(q.section_id),
      selected_store_for_section: deserializeString(q.selected_store_for_section),
      stock_movement_type_ids: deserializeArray(q.stock_movement_type_ids),
    }),
    [],
  );

  const toQuery = React.useCallback(
    (filters: OutboundFilterOptions): Record<string, string | string[] | undefined> => {
      const q: Record<string, string | string[] | undefined> = {};
      if (filters.editor_aor_id) q.editor_aor_id = filters.editor_aor_id;
      if (filters.internal_code) q.internal_code = filters.internal_code;
      if (filters.last_updated_end) q.last_updated_end = filters.last_updated_end;
      if (filters.last_updated_start) q.last_updated_start = filters.last_updated_start;
      if (filters.order_direction && filters.order_direction !== "DESC")
        q.order_direction = filters.order_direction;
      if (filters.rfid_category) q.rfid_category = filters.rfid_category;
      if (filters.rfid_name) q.rfid_name = filters.rfid_name;
      if (filters.rfid_type) q.rfid_type = filters.rfid_type;
      if (filters.section_id) q.section_id = filters.section_id;
      if (filters.selected_store_for_section)
        q.selected_store_for_section = filters.selected_store_for_section;
      const serializedTypes = serializeArray(filters.stock_movement_type_ids ?? []);
      if (serializedTypes) q.stock_movement_type_ids = serializedTypes;
      return q;
    },
    [],
  );

  const onInit = React.useCallback(
    (urlFilters: Partial<OutboundFilterOptions>) => {
      if (urlFilters.stock_movement_type_ids?.length)
        setStockMovementTypeIds(urlFilters.stock_movement_type_ids);
      if (urlFilters.section_id) setSectionId(urlFilters.section_id);
      if (urlFilters.rfid_category) setRfidCategory(urlFilters.rfid_category);
      if (urlFilters.rfid_type) setRfidType(urlFilters.rfid_type);
      if (urlFilters.last_updated_start) {
        setLastUpdatedStart(urlFilters.last_updated_start);
        setTimeframe("custom");
      }
      if (urlFilters.last_updated_end) setLastUpdatedEnd(urlFilters.last_updated_end);
      if (urlFilters.order_direction) setOrderDirection(urlFilters.order_direction);
      if (urlFilters.editor_aor_id) setEditorAorId(urlFilters.editor_aor_id);
      if (urlFilters.selected_store_for_section)
        setSelectedStoreForSection(urlFilters.selected_store_for_section);

      const hasFilters = Object.values(urlFilters).some(
        (v) => v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true),
      );
      if (hasFilters) {
        handleSetFilters({
          editor_aor_id: urlFilters.editor_aor_id,
          internal_code: urlFilters.internal_code,
          last_updated_end: urlFilters.last_updated_end,
          last_updated_start: urlFilters.last_updated_start,
          order_direction: urlFilters.order_direction ?? "DESC",
          rfid_category: urlFilters.rfid_category,
          rfid_name: urlFilters.rfid_name,
          rfid_type: urlFilters.rfid_type,
          section_id: urlFilters.section_id,
          selected_store_for_section: urlFilters.selected_store_for_section,
          stock_movement_type_ids: urlFilters.stock_movement_type_ids?.length
            ? urlFilters.stock_movement_type_ids
            : undefined,
        });
      }
    },
    [handleSetFilters],
  );

  const { syncToUrl } = useUrlFilterSync<OutboundFilterOptions>({
    fromQuery,
    onInit,
    toQuery,
  });

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
    syncToUrl({ ...filters, internal_code: currentFilters.internal_code, rfid_name: currentFilters.rfid_name });
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
    handleSetFilters({});
    syncToUrl({} as OutboundFilterOptions);
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

          <Combobox
            label={t("filter.timeframe", "Time Range")}
            options={timeframeOptions}
            placeholder={t("filter.timeframePlaceholder", "Select time range...")}
            value={timeframe}
            onSelect={(value) => handleTimeframeChange(value || "all")}
          />

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

          <Combobox
            label={t("filter.orderDirection", "Sort Order")}
            options={orderDirectionOptions}
            placeholder={t("filter.orderDirectionPlaceholder", "Select sort order...")}
            value={orderDirection}
            onSelect={setOrderDirection}
          />

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

          <Combobox
            label={t("filter.rfidType", "RFID Type")}
            options={rfidTypeOptions}
            placeholder={t("filter.rfidTypePlaceholder", "Select RFID type...")}
            value={rfidType}
            onSelect={setRfidType}
          />

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

export default OutboundStBasahFilter;
