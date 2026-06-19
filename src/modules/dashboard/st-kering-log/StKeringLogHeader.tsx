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
import { useUser } from "@/context/user-context";
import { ColumnDefinition } from "@/hooks/useColumnVisibility";

import { StoreSelector } from "./components/StoreSelector";
import StKeringLogFilter from "./StKeringLogFilter";
import { useStKeringLogStore } from "./store";

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

interface StKeringLogHeaderProps {
  allColumns: ColumnDefinition[];
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
  visibleColumnIds: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

const StKeringLogHeader: React.FC<StKeringLogHeaderProps> = ({
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
  const { t } = useTranslation(["common", "st-kering-log"]);
  const { hasMultipleStores, selectedTeam } = useUser();

  const {
    setFilters,
    filters,
    itemLimit,
    setItemLimit,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    currentPage,
  } = useStKeringLogStore();

  const urlInitialized = useRef(false);

  const [selectedStoreId, setSelectedStoreId] = useState<string>(() => {
    if (filters.assigned_store_id && filters.assigned_store_id !== "0") {
      return filters.assigned_store_id;
    }
    return !hasMultipleStores && selectedTeam && selectedTeam !== "0" ? selectedTeam : "0";
  });

  useEffect(() => {
    if (
      !hasMultipleStores &&
      selectedTeam &&
      selectedTeam !== "0" &&
      selectedStoreId === "0"
    ) {
      setSelectedStoreId(selectedTeam);
      setFilters({ ...filters, assigned_store_id: selectedTeam });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam]);

  const [rfidSearchValue, setRfidSearchValue] = useState(filters.rfid_name ?? "");
  const [internalCodeValue, setInternalCodeValue] = useState(
    filters.internal_code ?? "",
  );

  useEffect(() => {
    if (!router.isReady || urlInitialized.current) return;
    urlInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    const urlFilters: Record<string, string | undefined> = {};
    if (q.rfid_name) { urlFilters.rfid_name = q.rfid_name; setRfidSearchValue(q.rfid_name); }
    if (q.internal_code) { urlFilters.internal_code = q.internal_code; setInternalCodeValue(q.internal_code); }
    if (q.assigned_store_id) { urlFilters.assigned_store_id = q.assigned_store_id; setSelectedStoreId(q.assigned_store_id); }
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

  useEffect(() => {
    setRfidSearchValue(filters.rfid_name ?? "");
  }, [filters.rfid_name]);

  useEffect(() => {
    setInternalCodeValue(filters.internal_code ?? "");
  }, [filters.internal_code]);

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
    <div className="flex flex-wrap items-center gap-2">
      <StoreSelector
        value={selectedStoreId}
        onChange={(newValue) => {
          setSelectedStoreId(newValue);
          setCurrentPage(1);
          setFilters({
            ...filters,
            assigned_store_id: newValue === "0" ? undefined : newValue,
            cursor: undefined,
          });
          const nextQuery = { ...router.query };
          if (newValue && newValue !== "0") nextQuery.assigned_store_id = newValue;
          else delete nextQuery.assigned_store_id;
          router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
        }}
      />
      <Input
        className="w-[180px]"
        placeholder={t(
          "st-kering-log:filter.rfidSearchPlaceholder",
          "Search RFID...",
        )}
        value={rfidSearchValue}
        onChange={(event) => setRfidSearchValue(event.target.value)}
      />
      <Input
        className="w-[180px]"
        placeholder={t(
          "st-kering-log:filter.internalCodePlaceholder",
          "Enter internal code...",
        )}
        value={internalCodeValue}
        onChange={(event) => setInternalCodeValue(event.target.value)}
      />
      <ColumnVisibility
        columns={allColumns}
        visibleColumnIds={visibleColumnIds}
        onHideAll={onHideAll}
        onShowAll={onShowAll}
        onToggleColumn={onToggleColumn}
      />
      <StKeringLogFilter />
      <ExportButton
        productFilters={filters}
        type="st-kering-log"
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

export default StKeringLogHeader;
