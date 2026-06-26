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
    currentPage,
    hasNextPage,
    hasPrevPage,
    filters,
    localItemsPerPage,
    stockMovementTypesData,
    setHasNextPage,
    setHasPrevPage,
    setTotalItems,
    setTotalPages,
    setLocalItemsPerPage,
    setStockMovementTypesData,
    goToNextPage,
    goToPrevPage,
    resetPagination,
  } = useStockMovementTypesStore(
    useShallow((state) => ({
      currentPage: state.currentPage,
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
      setStockMovementTypesData: state.setStockMovementTypesData,
      setTotalItems: state.setTotalItems,
      setTotalPages: state.setTotalPages,
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
    limit: localItemsPerPage,
    page: currentPage,
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
      setHasNextPage(currentPage < (data.pagination?.total_pages ?? 1));
      setHasPrevPage(currentPage > 1);
      setTotalItems(data.pagination?.count || 0);
      setTotalPages(data.pagination?.total_pages ?? 1);
    }
  }, [
    currentPage,
    data,
    isSuccess,
    setHasNextPage,
    setHasPrevPage,
    setStockMovementTypesData,
    setTotalItems,
    setTotalPages,
  ]);

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
        goToPrevPage={goToPrevPage}
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
