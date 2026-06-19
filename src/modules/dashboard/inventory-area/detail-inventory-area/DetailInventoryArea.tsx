import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "next-i18next";
import React from "react";

import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { InventoryAreaDetailFilterOptions } from "@/types/inventory-area";

import DetailInventoryAreaHeader from "./components/DetailInventoryAreaHeader";
import DetailInventoryAreaMetrics from "./components/DetailInventoryAreaMetrics";
import InventoryTable from "./components/InventoryTable";
import {
  DetailInventoryAreaProvider,
  useDetailInventoryArea,
} from "./context/DetailInventoryAreaContext";

const DetailInventoryAreaContent: React.FC = () => {
  const { t } = useTranslation("inventory-area");
  const {
    currentOffset,
    filters,
    inventories,
    loading,
    nextCursor,
    prevCursor,
    section,
    sectionId,
    setCurrentOffset,
    setFilters,
    stockMovementTypeIds,
    storeId,
    totalQuantity,
  } = useDetailInventoryArea();

  const handleApplyFilters = (newFilters: InventoryAreaDetailFilterOptions) => {
    setFilters(newFilters);
  };

  const handleNextPage = () => {
    setCurrentOffset(currentOffset + inventories.length);
    setFilters({ ...filters, cursor: nextCursor });
  };

  const handlePrevPage = () => {
    setCurrentOffset(Math.max(0, currentOffset - inventories.length));
    setFilters({ ...filters, cursor: prevCursor });
  };

  if (loading && !section) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <DetailInventoryAreaHeader
        currentFilters={filters}
        sectionId={sectionId}
        sectionName={section?.name || ""}
        stockMovementTypeIds={stockMovementTypeIds}
        storeId={storeId}
        onApplyFilters={handleApplyFilters}
      />

      <DetailInventoryAreaMetrics
        section={section}
        totalQuantity={totalQuantity}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold font-heading">{t("detail.inventoryTitle")}</h2>
          <span className="text-sm text-muted-foreground">
            {inventories.length > 0 &&
              t("detail.showingCount", { count: inventories.length })}
          </span>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            <InventoryTable currentOffset={currentOffset} data={inventories} />

            {(prevCursor || nextCursor) && (
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  className="gap-1"
                  disabled={!prevCursor}
                  size="sm"
                  variant="outline"
                  onClick={handlePrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("detail.pagination.prev")}
                </Button>
                <Button
                  className="gap-1"
                  disabled={!nextCursor}
                  size="sm"
                  variant="outline"
                  onClick={handleNextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                  {t("detail.pagination.next")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface DetailInventoryAreaProps {
  storeId: string;
  sectionId: string;
  stockMovementTypeIds?: string[];
  initialFilters?: InventoryAreaDetailFilterOptions;
}

const DetailInventoryArea: React.FC<DetailInventoryAreaProps> = ({
  stockMovementTypeIds,
  initialFilters,
  sectionId,
  storeId,
}) => {
  return (
    <DetailInventoryAreaProvider
      initialFilters={initialFilters}
      sectionId={sectionId}
      stockMovementTypeIds={stockMovementTypeIds}
      storeId={storeId}
    >
      <DetailInventoryAreaContent />
    </DetailInventoryAreaProvider>
  );
};

export default DetailInventoryArea;
