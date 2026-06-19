"use client";

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";

import ColumnVisibility from "@/components/shared/ColumnVisibility";
import ExportButton from "@/components/shared/ExportButton";
import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import { ColumnDefinition } from "@/hooks/useColumnVisibility";
import { StockMovementType } from "@/services/stockMovement/getStockMovementDataService";

import { StoreSelector } from "./components/StoreSelector";
import OutboundLogFilter from "./OutboundLogFilter";
import { useOutboundLogStore } from "./store";

interface OutboundLogHeaderProps {
  allColumns: ColumnDefinition[];
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
  visibleColumnIds: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

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

const OutboundLogHeader: React.FC<OutboundLogHeaderProps> = ({
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
  const { t } = useTranslation("outbound");
  const { tokenPayload } = useUser();
  const {
    setFilters,
    filters,
    itemLimit,
    setItemLimit,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    currentPage,
    selectedStoreId,
    setSelectedStoreId,
  } = useOutboundLogStore();

  const organizationId = tokenPayload?.organization_id ?? "";
  const [rfidNameValue, setRfidNameValue] = useState(filters.rfid_name ?? "");
  const [internalCodeValue, setInternalCodeValue] = useState(
    filters.internal_code ?? "",
  );
  const debouncedRfidName = useDebouncedValue(rfidNameValue, SEARCH_DEBOUNCE_MS);
  const debouncedInternalCode = useDebouncedValue(
    internalCodeValue,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setRfidNameValue(filters.rfid_name ?? "");
  }, [filters.rfid_name]);

  useEffect(() => {
    setInternalCodeValue(filters.internal_code ?? "");
  }, [filters.internal_code]);

  useEffect(() => {
    const nextRfidName =
      debouncedRfidName.trim() === "" ? undefined : debouncedRfidName.trim();
    const currentRfidName = filters.rfid_name ?? undefined;

    if (nextRfidName === currentRfidName) return;

    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      rfid_name: nextRfidName,
    }));
    const nextQuery = { ...router.query };
    if (nextRfidName) nextQuery.rfid_name = nextRfidName;
    else delete nextQuery.rfid_name;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedRfidName]);

  useEffect(() => {
    const nextInternalCode =
      debouncedInternalCode.trim() === ""
        ? undefined
        : debouncedInternalCode.trim();
    const currentInternalCode = filters.internal_code ?? undefined;

    if (nextInternalCode === currentInternalCode) return;

    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      cursor: undefined,
      internal_code: nextInternalCode,
    }));
    const nextQuery = { ...router.query };
    if (nextInternalCode) nextQuery.internal_code = nextInternalCode;
    else delete nextQuery.internal_code;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInternalCode]);

  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const outboundLogTypeIds = useMemo(
    () =>
      stockMovementTypesData
        ?.filter((type: StockMovementType) => type.direction === "OUTBOUND")
        .map((type: StockMovementType) => type.id) || [],
    [stockMovementTypesData]
  );

  const exportTypeIds =
    (filters.stock_movement_type_ids && filters.stock_movement_type_ids.length > 0
      ? filters.stock_movement_type_ids
      : outboundLogTypeIds) ?? outboundLogTypeIds;
  const resolvedExportTypeIds =
    exportTypeIds && exportTypeIds.length > 0 ? exportTypeIds : undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap gap-2 items-center">
        <StoreSelector
          value={selectedStoreId}
          onChange={(newValue) => {
            setSelectedStoreId(newValue);
            setCurrentPage(1);
          }}
        />
        <Input
          className="h-9 w-full md:w-[180px]"
          placeholder={t("filter.internalCodePlaceholder", "Search internal code...")}
          value={internalCodeValue}
          onChange={(event) => setInternalCodeValue(event.target.value)}
        />
        <Input
          className="h-9 w-full md:w-[180px]"
          placeholder={t("filter.rfidNamePlaceholder", "Search RFID name...")}
          value={rfidNameValue}
          onChange={(event) => setRfidNameValue(event.target.value)}
        />
        <OutboundLogFilter />
        <ColumnVisibility
          columns={allColumns}
          visibleColumnIds={visibleColumnIds}
          onHideAll={onHideAll}
          onShowAll={onShowAll}
          onToggleColumn={onToggleColumn}
        />
        <ExportButton
          stockMovementExportLayout="log"
          stockMovementFilters={filters}
          stockMovementStoreId={selectedStoreId}
          stockMovementTypeIds={resolvedExportTypeIds}
          type="outbound"
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
        <Button
          className="ml-auto md:ml-0"
          size="sm"
          onClick={() => router.push("/dashboard/outbound/create")}
        >
          {t("button.create")}
        </Button>
      </div>
    </div>
  );
};

export default OutboundLogHeader;
