"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useRef } from "react";

import ColumnVisibility from "@/components/shared/ColumnVisibility";
import ExportButton from "@/components/shared/ExportButton";
import InventoryDateFilter from "@/components/shared/InventoryDateFilter";
import PaginationCursor from "@/components/shared/PaginationCursor";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetInventoryQuery from "@/hooks/api/inventory/useGetInventoryQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { ColumnDefinition } from "@/hooks/useColumnVisibility";

import InventoryFilter from "./InventoryFilter";
import { useInventoryStore } from "./store/InventoryStore";

interface InventoryHeaderProps {
  allColumns: ColumnDefinition[];
  visibleColumnIds: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  allColumns,
  visibleColumnIds,
  onToggleColumn,
  onShowAll,
  onHideAll,
}) => {
  const router = useRouter();
  const urlStoreInitialized = useRef(false);
  const urlDatesInitialized = useRef(false);
  const { tokenPayload, selectedTeam, hasMultipleStores } = useUser();
  const {
    filters,
    setFilters,
    itemLimit,
    setItemLimit,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    selectedStoreId,
    setSelectedStoreId,
    resetPagination,
    currentPage,
  } = useInventoryStore();

  // Fetch store data
  const { data: storeData } = useGetStoreDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  // Store options with "All stores" option (only when user has multiple stores)
  const storeOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [];
    if (hasMultipleStores) {
      options.push({ label: "All stores", value: "0" });
    }
    if (storeData?.data?.stores) {
      options.push(
        ...storeData.data.stores.map((store) => ({
          label: store.name,
          value: store.id,
        }))
      );
    }
    return options;
  }, [storeData, hasMultipleStores]);

  // Initialize selectedStoreId — priority: URL > localStorage > selectedTeam
  useEffect(() => {
    if (selectedStoreId) return;
    if (!storeData?.data?.stores) return;

    // Priority 1: URL param (once, when router is ready)
    if (router.isReady && !urlStoreInitialized.current) {
      urlStoreInitialized.current = true;
      const q = router.query as Record<string, string | undefined>;
      if (q.store_id) {
        const isValid =
          q.store_id === "0" ||
          storeData.data.stores.some((store) => store.id === q.store_id);
        if (isValid) {
          setSelectedStoreId(q.store_id);
          return;
        }
      }
    }

    // Priority 2: localStorage
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("selectedStoreId_inventory");
      if (storedId) {
        const isValidStore =
          storedId === "0" ||
          storeData.data.stores.some((store) => store.id === storedId);
        if (isValidStore) {
          setSelectedStoreId(storedId);
          return;
        } else {
          localStorage.removeItem("selectedStoreId_inventory");
        }
      }
    }

    if (selectedTeam) {
      setSelectedStoreId(selectedTeam);
    } else if (storeData.data.stores.length > 0) {
      setSelectedStoreId("0");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam, storeData, selectedStoreId, setSelectedStoreId, router.isReady]);

  // Initialize date filters from URL on mount (once)
  useEffect(() => {
    if (!router.isReady || urlDatesInitialized.current) return;
    urlDatesInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    if (q.start_date || q.end_date) {
      setFilters((prev) => ({
        ...prev,
        end_date: q.end_date,
        start_date: q.start_date,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Persist selectedStoreId to localStorage whenever it changes
  useEffect(() => {
    if (selectedStoreId && typeof window !== "undefined") {
      localStorage.setItem("selectedStoreId_inventory", selectedStoreId);
    }
  }, [selectedStoreId]);

  // Handle store change
  const handleStoreChange = (storeId: string) => {
    const nextStoreId = storeId || "0";
    setSelectedStoreId(nextStoreId);
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      store_id: nextStoreId !== "0" ? nextStoreId : undefined,
    }));
    resetPagination();
    const nextQuery = { ...router.query };
    if (nextStoreId && nextStoreId !== "0") nextQuery.store_id = nextStoreId;
    else delete nextQuery.store_id;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  };

  const requestFilters = useMemo(
    () => ({
      ...filters,
      cursor: filters.cursor ?? undefined,
      limit: itemLimit,
    }),
    [filters, itemLimit]
  );

  const { data: inventoryData } = useGetInventoryQuery({
    filters: requestFilters,
    organizationId: tokenPayload?.organization_id ?? "",
  });

  return (
    <div className="flex flex-col lg:flex-row w-full justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Combobox
          options={storeOptions}
          placeholder="Select store..."
          value={selectedStoreId}
          onSelect={(value) => handleStoreChange(value || "0")}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ColumnVisibility
          columns={allColumns}
          visibleColumnIds={visibleColumnIds}
          onHideAll={onHideAll}
          onShowAll={onShowAll}
          onToggleColumn={onToggleColumn}
        />
        <InventoryDateFilter
          dateFrom={filters.start_date}
          dateTo={filters.end_date}
          onChange={(dateFrom, dateTo) => {
            setFilters((prev) => ({
              ...prev,
              cursor: undefined,
              end_date: dateTo,
              start_date: dateFrom,
            }));
            resetPagination();
            const nextQuery = { ...router.query };
            if (dateFrom) nextQuery.start_date = dateFrom; else delete nextQuery.start_date;
            if (dateTo) nextQuery.end_date = dateTo; else delete nextQuery.end_date;
            router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
          }}
        />
        <InventoryFilter />
        <ExportButton inventoryFilters={filters} type="inventory" />
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
          hasNextPage={Boolean(inventoryData?.pagination?.next_cursor)}
          hasPrevPage={Boolean(inventoryData?.pagination?.prev_cursor)}
          limit={itemLimit}
          totalCount={inventoryData?.pagination?.total_count ?? undefined}
          onNext={() => {
            goToNextPage();
            setFilters((prev) => ({
              ...prev,
              cursor: inventoryData?.pagination?.next_cursor,
            }));
          }}
          onPrev={() => {
            goToPrevPage();
            setFilters((prev) => ({
              ...prev,
              cursor: inventoryData?.pagination?.prev_cursor,
            }));
          }}
        />
      </div>
    </div>
  );
};

export default InventoryHeader;
