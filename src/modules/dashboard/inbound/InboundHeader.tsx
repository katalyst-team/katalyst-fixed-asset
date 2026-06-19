import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import ColumnVisibility from "@/components/shared/ColumnVisibility";
import ExportButton from "@/components/shared/ExportButton";
import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetStockMovementDataQuery from "@/hooks/api/stockMovement/useGetStockMovementDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import { ColumnDefinition } from "@/hooks/useColumnVisibility";
import { StockMovementType } from "@/services/stockMovement/getStockMovementDataService";

import InboundFilter from "./InboundFilter";
import { useInboundStore } from "./store";

interface InboundHeaderProps {
  allColumns: ColumnDefinition[];
  visibleColumnIds: Set<string>;
  onHideAll: () => void;
  onShowAll: () => void;
  onToggleColumn: (columnId: string) => void;
}

const InboundHeader: React.FC<InboundHeaderProps> = ({
  allColumns,
  onHideAll,
  onShowAll,
  onToggleColumn,
  visibleColumnIds,
}) => {
  const router = useRouter();
  const { t } = useTranslation("inbound");
  const { tokenPayload, selectedTeam } = useUser();
  const {
    setFilters,
    filters,
    itemLimit,
    setItemLimit,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    currentPage,
  } = useInboundStore();

  const organizationId = tokenPayload?.organization_id ?? "";

  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const inboundTypeIds = useMemo(
    () =>
      stockMovementTypesData
        ?.filter((type: StockMovementType) => type.direction === "INBOUND")
        .map((type: StockMovementType) => type.id) || [],
    [stockMovementTypesData]
  );

  const queryStoreId = useMemo(() => {
    if (filters.selected_store_for_section) {
      return filters.selected_store_for_section;
    }
    if (selectedTeam && selectedTeam !== "0") {
      return selectedTeam;
    }
    return selectedTeam;
  }, [filters.selected_store_for_section, selectedTeam]);

  const requestFilters = useMemo(
    () => ({
      ...filters,
      limit: itemLimit,
      stock_movement_type_ids:
        filters.stock_movement_type_ids &&
        filters.stock_movement_type_ids.length > 0
          ? filters.stock_movement_type_ids
          : inboundTypeIds.length > 0
            ? inboundTypeIds
            : undefined,
    }),
    [filters, inboundTypeIds, itemLimit]
  );

  const { data: inboundData } = useGetStockMovementDataQuery({
    filters: requestFilters,
    organizationId,
    storeId: queryStoreId,
  });

  return (
    <div className="flex flex-col lg:flex-row w-full justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          onClick={() => router.push("/dashboard/inbound/create")}
        >
          {t("button.create")}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ColumnVisibility
          columns={allColumns}
          visibleColumnIds={visibleColumnIds}
          onHideAll={onHideAll}
          onShowAll={onShowAll}
          onToggleColumn={onToggleColumn}
        />
        <InboundFilter />
        <ExportButton stockMovementFilters={filters} type="inbound" />
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
          hasNextPage={Boolean(inboundData?.pagination.next_cursor)}
          hasPrevPage={Boolean(inboundData?.pagination.prev_cursor)}
          limit={itemLimit}
          totalCount={inboundData?.pagination?.total_count ?? undefined}
          onNext={() => {
            goToNextPage();
            setFilters((prev) => ({
              ...prev,
              cursor: inboundData?.pagination.next_cursor,
            }));
          }}
          onPrev={() => {
            goToPrevPage();
            setFilters((prev) => ({
              ...prev,
              cursor: inboundData?.pagination.prev_cursor,
            }));
          }}
        />
      </div>
    </div>
  );
};

export default InboundHeader;
