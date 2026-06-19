import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import React, { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import {
  useDeleteStockMovementTypeMutation,
  useGetStockMovementTypesQuery,
} from "@/hooks/api/stock-movement-types";
import { KEY_USE_GET_STOCK_MOVEMENT_TYPES } from "@/hooks/api/stock-movement-types/useGetStockMovementTypesQuery";
import { StockMovementDirection } from "@/services/stock-movement-types/getStockMovementTypesService";

import CreateStockMovementTypeModal from "./components/CreateStockMovementTypeModal";
import StockMovementTypesHeader from "./components/StockMovementTypesHeader";
import StockMovementTypesTable from "./components/StockMovementTypesTable";
import { useStockMovementTypesStore } from "./store";

const StockMovementTypes: React.FC = () => {
  const { t } = useTranslation("stock-movement-types");
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [directionFilter, setDirectionFilter] = useState<StockMovementDirection | undefined>(undefined);

  // Use Zustand store
  const {
    currentCursor,
    hasNextPage,
    hasPrevPage,
    filters,
    localItemsPerPage,
    stockMovementTypesData,
    setNextCursor,
    setPrevCursor,
    setHasNextPage,
    setHasPrevPage,
    setTotalItems,
    setLocalItemsPerPage,
    setStockMovementTypesData,
    goToNextPage,
    goToPrevPage,
    resetPagination,
  } = useStockMovementTypesStore(
    useShallow((state) => ({
      currentCursor: state.currentCursor,
      filters: state.filters,
      goToNextPage: state.goToNextPage,
      goToPrevPage: state.goToPrevPage,
      hasNextPage: state.hasNextPage,
      hasPrevPage: state.hasPrevPage,
      localItemsPerPage: state.localItemsPerPage,
      resetPagination: state.resetPagination,
      setHasNextPage: state.setHasNextPage,
      setHasPrevPage: state.setHasPrevPage,
      setLocalItemsPerPage: state.setLocalItemsPerPage,
      setNextCursor: state.setNextCursor,
      setPrevCursor: state.setPrevCursor,
      setStockMovementTypesData: state.setStockMovementTypesData,
      setTotalItems: state.setTotalItems,
      stockMovementTypesData: state.stockMovementTypesData,
    }))
  );

  // Initialize items per page from default only on first mount
  useEffect(() => {
    if (localItemsPerPage === 20) {
      setLocalItemsPerPage(20);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const queryFilters = {
    ...filters,
    cursor: currentCursor,
    limit: localItemsPerPage,
  };

  const { data, isLoading, isSuccess, isFetching } =
    useGetStockMovementTypesQuery({
      enabled: !!tokenPayload?.organization_id,
      filters: queryFilters,
      organizationId: tokenPayload?.organization_id || "",
    });

  useEffect(() => {
    if (isSuccess && data) {
      setStockMovementTypesData(data.data?.stock_movement_types || []);
      setNextCursor(data.pagination?.next_cursor || null);
      setPrevCursor(data.pagination?.prev_cursor || null);
      setHasNextPage(!!data.pagination?.next_cursor);
      setHasPrevPage(!!data.pagination?.prev_cursor);
      setTotalItems(data.pagination?.count || 0);
    }
  }, [
    data,
    isSuccess,
    setStockMovementTypesData,
    setNextCursor,
    setPrevCursor,
    setHasNextPage,
    setHasPrevPage,
    setTotalItems,
  ]);

  const handleGoToPrevPage = useCallback(() => {
    goToPrevPage(data?.pagination?.prev_cursor);
  }, [data?.pagination?.prev_cursor, goToPrevPage]);

  const handleSetItemsPerPage = useCallback(
    (limit: number) => {
      resetPagination();
      setLocalItemsPerPage(limit);
    },
    [resetPagination, setLocalItemsPerPage]
  );

  const { mutateAsync: deleteMutateAsync } = useDeleteStockMovementTypeMutation(
    {
      organizationId: tokenPayload?.organization_id || "",
    }
  );

  const handleDelete = (id: string) => {
    deleteMutateAsync({ stock_movement_type_id: id }).then(() =>
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_STOCK_MOVEMENT_TYPES(
          tokenPayload?.organization_id || "",
          queryFilters
        ),
      })
    );
  };

  const loading = isLoading || isFetching;

  return (
    <div className="space-y-4">
      <StockMovementTypesHeader
        directionFilter={directionFilter}
        goToNextPage={goToNextPage}
        goToPrevPage={handleGoToPrevPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        itemsPerPage={localItemsPerPage}
        setDirectionFilter={setDirectionFilter}
        setItemsPerPage={handleSetItemsPerPage}
        onCreateNew={() => setIsCreateModalOpen(true)}
      />

      {loading ? (
        <Loading />
      ) : stockMovementTypesData.length === 0 ? (
        <EmptyState
          action={
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              {t("buttons.create")}
            </Button>
          }
          description={t("empty.description")}
          title={t("empty.title")}
        />
      ) : (
        <StockMovementTypesTable
          data={stockMovementTypesData}
          directionFilter={directionFilter}
          onDelete={handleDelete}
        />
      )}

      <CreateStockMovementTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default StockMovementTypes;
