"use client";

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useRef, useState } from "react";

import ColumnVisibility from "@/components/shared/ColumnVisibility";
import ExportButton from "@/components/shared/ExportButton";
import PaginationCursor from "@/components/shared/PaginationCursor";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDefinition } from "@/hooks/useColumnVisibility";

import LaminaLogCategoryFilter from "./components/LaminaLogCategoryFilter";
import LaminaLogDateAttributeFilter from "./LaminaLogDateAttributeFilter";
import { useLaminaLogStore } from "./store";

const COLUMN_ID_INTERNAL_CODE = "internalCode";
const COLUMN_ID_RFID_EPC = "rfidEpc";
const COLUMN_ID_RFID_NAME = "rfidName";
const COLUMN_ID_CATEGORY = "category";

const SEARCH_DEBOUNCE_MS = 400;

const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface LaminaLogHeaderProps {
  allColumns: ColumnDefinition[];
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
  visibleColumnIds: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

const LaminaLogHeader: React.FC<LaminaLogHeaderProps> = ({
  allColumns,
  nextCursor,
  onHideAll,
  onShowAll,
  onToggleColumn,
  prevCursor,
  totalCount,
  visibleColumnIds,
}) => {
  const router = useRouter();
  const { t } = useTranslation(["common", "lamina-log"]);

  const {
    setFilters,
    filters,
    itemLimit,
    setItemLimit,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    currentPage,
  } = useLaminaLogStore();

  const urlInitialized = useRef(false);

  const [rfidSearchValue, setRfidSearchValue] = useState(filters.rfid_name ?? "");
  const [internalCodeValue, setInternalCodeValue] = useState(
    filters.internal_code ?? "",
  );

  // Initialize filters and search inputs from URL on mount (once)
  useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    const urlFilters: Record<string, string | undefined> = {};
    if (q.rfid_name) { urlFilters.rfid_name = q.rfid_name; setRfidSearchValue(q.rfid_name); }
    if (q.internal_code) { urlFilters.internal_code = q.internal_code; setInternalCodeValue(q.internal_code); }
    if (q.query_date_attributes) {
      urlFilters.query_date_attributes = q.query_date_attributes;
    }
    if (Object.keys(urlFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...urlFilters }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const debouncedRfidSearch = useDebouncedValue(
    rfidSearchValue,
    SEARCH_DEBOUNCE_MS,
  );
  const debouncedInternalCode = useDebouncedValue(
    internalCodeValue,
    SEARCH_DEBOUNCE_MS,
  );

  // Sync local state with filters from store
  useEffect(() => {
    setRfidSearchValue(filters.rfid_name ?? "");
  }, [filters.rfid_name]);

  useEffect(() => {
    setInternalCodeValue(filters.internal_code ?? "");
  }, [filters.internal_code]);

  // Debounced RFID search effect
  useEffect(() => {
    const nextRfidName =
      debouncedRfidSearch.trim() === "" ? undefined : debouncedRfidSearch;
    const currentRfidName = filters.rfid_name ?? undefined;

    if (currentRfidName === nextRfidName) {
      return;
    }

    setFilters((prev) => ({
      ...prev,
      rfid_name: nextRfidName,
    }));
    const nextQuery = { ...router.query };
    if (nextRfidName) nextQuery.rfid_name = nextRfidName;
    else delete nextQuery.rfid_name;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedRfidSearch]);

  // Debounced internal code effect
  useEffect(() => {
    const nextInternalCode =
      debouncedInternalCode.trim() === "" ? undefined : debouncedInternalCode;
    const currentInternalCode = filters.internal_code ?? undefined;

    if (currentInternalCode === nextInternalCode) {
      return;
    }

    setFilters((prev) => ({
      ...prev,
      internal_code: nextInternalCode,
    }));
    const nextQuery = { ...router.query };
    if (nextInternalCode) nextQuery.internal_code = nextInternalCode;
    else delete nextQuery.internal_code;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInternalCode]);

  return (
    <div className="flex w-full gap-2 flex-wrap items-center">
      {(visibleColumnIds.has(COLUMN_ID_RFID_EPC) ||
        visibleColumnIds.has(COLUMN_ID_RFID_NAME)) && (
        <Input
          className="w-full sm:w-[220px] sm:flex-none"
          placeholder={t(
            "lamina-log:filter.rfidSearchPlaceholder",
            "Search RFID...",
          )}
          value={rfidSearchValue}
          onChange={(event) => setRfidSearchValue(event.target.value)}
        />
      )}
      {visibleColumnIds.has(COLUMN_ID_INTERNAL_CODE) && (
        <Input
          className="w-full sm:w-[220px] sm:flex-none"
          placeholder={t(
            "lamina-log:filter.internalCodePlaceholder",
            "Enter internal code...",
          )}
          value={internalCodeValue}
          onChange={(event) => setInternalCodeValue(event.target.value)}
        />
      )}
      <ColumnVisibility
        columns={allColumns}
        visibleColumnIds={visibleColumnIds}
        onHideAll={onHideAll}
        onShowAll={onShowAll}
        onToggleColumn={onToggleColumn}
      />
      {visibleColumnIds.has(COLUMN_ID_CATEGORY) && <LaminaLogCategoryFilter />}
      <LaminaLogDateAttributeFilter />
      <ExportButton
        productFilters={filters}
        type="lamina-log"
      />
      <Select
        value={String(itemLimit)}
        onValueChange={(value) => {
           setItemLimit(Number(value));
           setCurrentPage(1);
           setFilters((prev) => ({ ...prev, cursor: undefined }));
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
        currentPage={currentPage}
        hasNextPage={Boolean(nextCursor)}
        hasPrevPage={Boolean(prevCursor)}
        limit={itemLimit}
        totalCount={totalCount}
        onNext={() => {
          goToNextPage();
          setFilters((prev) => ({
            ...prev,
            cursor: nextCursor,
          }));
        }}
        onPrev={() => {
          goToPrevPage();
          setFilters((prev) => ({
            ...prev,
            cursor: prevCursor,
          }));
        }}
      />
    </div>
  );
};

export default LaminaLogHeader;
