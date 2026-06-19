"use client";

import { Filter } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RfidCategory, RfidOrderBy, RfidSortBy, RfidStatus, RfidType } from "@/types/rfid";

import { useEpcStore } from "./store";

interface EpcFilterOptions {
  category?: RfidCategory;
  epcs?: string[];
  is_used?: boolean;
  order_by?: RfidOrderBy;
  rfid_name?: string;
  sort_by?: RfidSortBy;
  status?: RfidStatus;
  type?: RfidType;
}

const EpcFilter: React.FC = () => {
  const { t } = useTranslation("epc");
  const router = useRouter();
  const urlInitialized = React.useRef(false);
  const { currentFilters, resetPagination, setFilters } = useEpcStore(
    useShallow((state) => ({
      currentFilters: state.filters,
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
    })),
  );

  const getFiltersKey = React.useCallback(
    (filters: EpcFilterOptions) => JSON.stringify(filters ?? {}),
    [],
  );

  const handleSetFilters = React.useCallback(
    (filters: EpcFilterOptions) => {
      resetPagination();
      setFilters(filters);
    },
    [resetPagination, setFilters],
  );

  // State Management
  const [rfidType, setRfidType] = React.useState<string | undefined>("all");
  const [rfidCategory, setRfidCategory] = React.useState<string | undefined>("all");
  const [rfidStatus, setRfidStatus] = React.useState<string | undefined>("all");
  const [isUsed, setIsUsed] = React.useState<string | undefined>("all");
  const [epcCodes, setEpcCodes] = React.useState<string>(currentFilters.epcs?.join(", ") || "");
  const [sortBy, setSortBy] = React.useState<string>("all");
  const [orderBy, setOrderBy] = React.useState<string>("all");
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  // Initialize from URL once
  React.useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    if (q.rfid_type) setRfidType(q.rfid_type);
    if (q.rfid_category) setRfidCategory(q.rfid_category);
    if (q.status) setRfidStatus(q.status);
    if (q.is_used) setIsUsed(q.is_used);
    if (q.epcs) setEpcCodes(q.epcs);
    if (q.sort_by) setSortBy(q.sort_by);
    if (q.order_by) setOrderBy(q.order_by);

    const hasFilters = q.rfid_type || q.rfid_category || q.status || q.is_used || q.epcs || q.sort_by || q.order_by;
    if (hasFilters) {
      const epcArray = q.epcs ? q.epcs.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
      handleSetFilters({
        category: q.rfid_category !== "all" ? (q.rfid_category as RfidCategory) : undefined,
        epcs: epcArray,
        is_used: q.is_used === "all" ? undefined : q.is_used === "true" ? true : q.is_used === "false" ? false : undefined,
        order_by: q.order_by !== "all" ? (q.order_by as RfidOrderBy) : undefined,
        sort_by: q.sort_by !== "all" ? (q.sort_by as RfidSortBy) : undefined,
        status: q.status !== "all" ? (q.status as RfidStatus) : undefined,
        type: q.rfid_type !== "all" ? (q.rfid_type as RfidType) : undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Filter options
  const rfidTypeOptions = [
    { label: t("filter.options.allTypes", "All Types"), value: "all" },
    { label: t("type.reusable", "Reusable"), value: RfidType.REUSABLE },
    { label: t("type.disposable", "Disposable"), value: RfidType.DISPOSABLE },
  ];

  const rfidCategoryOptions = [
    {
      label: t("filter.options.allCategories", "All Categories"),
      value: "all",
    },
    { label: t("category.single", "Single"), value: RfidCategory.SINGLE },
    { label: t("category.package", "Package"), value: RfidCategory.PACKAGE },
  ];

  const rfidStatusOptions = [
    { label: t("filter.options.allStatuses", "All Statuses"), value: "all" },
    { label: t("status.active", "Active"), value: RfidStatus.ACTIVE },
    { label: t("status.inactive", "Inactive"), value: RfidStatus.INACTIVE },
  ];

  const isUsedOptions = [
    {
      label: t("filter.options.allUsageStates", "All Usage States"),
      value: "all",
    },
    { label: t("isUsed.yes", "Yes"), value: "true" },
    { label: t("isUsed.no", "No"), value: "false" },
  ];

  const sortByOptions = [
    { label: t("filter.options.none", "None"), value: "all" },
    { label: t("filter.sortBy.cycleCount", "Cycle Count"), value: "cycle_count" },
    { label: t("filter.sortBy.name", "Name"), value: "name" },
  ];

  const orderByOptions = [
    { label: t("filter.options.none", "None"), value: "all" },
    { label: t("filter.orderBy.asc", "Ascending"), value: "asc" },
    { label: t("filter.orderBy.desc", "Descending"), value: "desc" },
  ];

  const handleApply = () => {
    const epcArray = epcCodes.split(",").map((s) => s.trim()).filter(Boolean);
    const filters: EpcFilterOptions = {
      category: rfidCategory === "all" ? undefined : (rfidCategory as RfidCategory),
      epcs: epcArray.length > 0 ? epcArray : undefined,
      is_used: isUsed === "all" ? undefined : isUsed === "true",
      order_by: orderBy === "all" ? undefined : (orderBy as RfidOrderBy),
      rfid_name: currentFilters.rfid_name,
      sort_by: sortBy === "all" ? undefined : (sortBy as RfidSortBy),
      status: rfidStatus === "all" ? undefined : (rfidStatus as RfidStatus),
      type: rfidType === "all" ? undefined : (rfidType as RfidType),
    };

    if (getFiltersKey(filters) !== getFiltersKey(currentFilters)) {
      handleSetFilters(filters);
    }

    // Sync to URL
    const nextQuery = { ...router.query };
    delete nextQuery.rfid_type;
    delete nextQuery.rfid_category;
    delete nextQuery.status;
    delete nextQuery.is_used;
    delete nextQuery.epcs;
    delete nextQuery.sort_by;
    delete nextQuery.order_by;
    if (filters.type) nextQuery.rfid_type = filters.type;
    if (filters.category) nextQuery.rfid_category = filters.category;
    if (filters.status) nextQuery.status = filters.status;
    if (filters.is_used !== undefined) nextQuery.is_used = String(filters.is_used);
    if (filters.epcs?.length) nextQuery.epcs = filters.epcs.join(",");
    if (filters.sort_by) nextQuery.sort_by = filters.sort_by;
    if (filters.order_by) nextQuery.order_by = filters.order_by;
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });

    setIsPopoverOpen(false);
  };

  const handleReset = () => {
    setRfidType("all");
    setRfidCategory("all");
    setRfidStatus("all");
    setIsUsed("all");
    setEpcCodes("");
    setSortBy("all");
    setOrderBy("all");

    const preserved = { rfid_name: currentFilters.rfid_name };
    if (getFiltersKey(preserved) !== getFiltersKey(currentFilters)) {
      handleSetFilters(preserved);
    }

    // Clear URL params
    const nextQuery = { ...router.query };
    delete nextQuery.rfid_type;
    delete nextQuery.rfid_category;
    delete nextQuery.status;
    delete nextQuery.is_used;
    delete nextQuery.epcs;
    delete nextQuery.sort_by;
    delete nextQuery.order_by;
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });

    setIsPopoverOpen(false);
  };

  const hasActiveFilters =
    rfidType !== "all" ||
    rfidCategory !== "all" ||
    rfidStatus !== "all" ||
    isUsed !== "all" ||
    epcCodes.trim().length > 0 ||
    sortBy !== "all" ||
    orderBy !== "all";

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
        className="w-[400px] p-0 flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b bg-background">
          <h2 className="font-semibold">
            {t("filter.title", "Filter Options")}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* RFID Type Selection */}
          <Combobox
            label={t("filter.type", "RFID Type")}
            options={rfidTypeOptions}
            placeholder={t("filter.typePlaceholder", "Select RFID type...")}
            value={rfidType}
            onSelect={setRfidType}
          />

          {/* RFID Category Selection */}
          <Combobox
            label={t("filter.category", "RFID Category")}
            options={rfidCategoryOptions}
            placeholder={t(
              "filter.categoryPlaceholder",
              "Select RFID category...",
            )}
            value={rfidCategory}
            onSelect={setRfidCategory}
          />

          {/* RFID Status Selection */}
          <Combobox
            label={t("filter.status", "Status")}
            options={rfidStatusOptions}
            placeholder={t("filter.statusPlaceholder", "Select status...")}
            value={rfidStatus}
            onSelect={setRfidStatus}
          />

          {/* Is Used Selection */}
          <Combobox
            label={t("filter.isUsed", "Usage Status")}
            options={isUsedOptions}
            placeholder={t(
              "filter.isUsedPlaceholder",
              "Select usage status...",
            )}
            value={isUsed}
            onSelect={setIsUsed}
          />

          {/* EPC Codes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("filter.epcCodes", "EPC Codes")}
            </Label>
            <Input
              className="h-9"
              placeholder={t("filter.epcCodesPlaceholder", "Enter EPC codes, comma separated...")}
              value={epcCodes}
              onChange={(e) => setEpcCodes(e.target.value)}
            />
          </div>

          {/* Sort By Selection */}
          <Combobox
            label={t("filter.sortBy.label", "Sort By")}
            options={sortByOptions}
            placeholder={t("filter.sortBy.placeholder", "Select sort by...")}
            value={sortBy}
            onSelect={(value) => setSortBy(value || "all")}
          />

          {/* Order By Selection */}
          <Combobox
            label={t("filter.orderBy.label", "Order By")}
            options={orderByOptions}
            placeholder={t("filter.orderBy.placeholder", "Select order...")}
            value={orderBy}
            onSelect={(value) => setOrderBy(value || "all")}
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

export default EpcFilter;
