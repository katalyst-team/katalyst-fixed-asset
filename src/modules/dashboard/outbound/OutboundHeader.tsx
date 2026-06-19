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

import OutboundFilter from "./OutboundFilter";
import { useOutboundStore } from "./store";

interface OutboundHeaderProps {
  allColumns: ColumnDefinition[];
  visibleColumnIds: Set<string>;
  onHideAll: () => void;
  onShowAll: () => void;
  onToggleColumn: (columnId: string) => void;
}

const OutboundHeader: React.FC<OutboundHeaderProps> = ({
  allColumns,
  onHideAll,
  onShowAll,
  onToggleColumn,
  visibleColumnIds,
}) => {
  const router = useRouter();
  const { t } = useTranslation("outbound");
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
  } = useOutboundStore();

  const organizationId = tokenPayload?.organization_id ?? "";

  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({
    organizationId,
  });

  const outboundTypeIds = useMemo(
    () =>
      stockMovementTypesData
        ?.filter((type: StockMovementType) => type.direction === "OUTBOUND")
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
          : outboundTypeIds.length > 0
            ? outboundTypeIds
            : undefined,
    }),
    [filters, outboundTypeIds, itemLimit]
  );

  const { data: outboundData } = useGetStockMovementDataQuery({
    filters: requestFilters,
    organizationId,
    storeId: queryStoreId,
  });

  return (
    <div className="flex flex-col lg:flex-row w-full justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          onClick={() => router.push("/dashboard/outbound/create")}
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
        <OutboundFilter />
        <ExportButton stockMovementFilters={filters} type="outbound" />
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
          hasNextPage={Boolean(outboundData?.pagination.next_cursor)}
          hasPrevPage={Boolean(outboundData?.pagination.prev_cursor)}
          limit={itemLimit}
          totalCount={outboundData?.pagination?.total_count ?? undefined}
          onNext={() => {
            goToNextPage();
            setFilters((prev) => ({
              ...prev,
              cursor: outboundData?.pagination.next_cursor,
            }));
          }}
          onPrev={() => {
            goToPrevPage();
            setFilters((prev) => ({
              ...prev,
              cursor: outboundData?.pagination.prev_cursor,
            }));
          }}
        />
      </div>
    </div>
  );
};

export default OutboundHeader;
