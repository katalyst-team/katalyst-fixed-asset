import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React, { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import EmptyState from "@/components/shared/EmptyState";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { StockAuditFilterOptions } from "@/types/stock-audit";

import CreateStockAuditModal from "./components/CreateStockAuditModal";
import StockAuditHeader from "./components/StockAuditHeader";
import StockAuditTable from "./components/StockAuditTable";
import { StockAuditProvider, useStockAudit } from "./context/StockAuditContext";
import { useStockAuditStore } from "./store";

const StockAuditContent: React.FC<{
  requireStockMovementType?: boolean;
  storeOptions: { label: string; value: string }[];
}> = ({ requireStockMovementType, storeOptions }) => {
  const { t } = useTranslation("stock-audit");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [stockMovementTypeName, setStockMovementTypeName] = React.useState<string | undefined>(undefined);
  const [popoverFilters, setPopoverFilters] = React.useState<StockAuditFilterOptions>({});

  // Get data from context
  const {
    stockAuditList,
    loading,
    deleteStockAudit,
    setFilters,
    filters,
    hasNextPage,
    hasPrevPage,
    goToNextPage,
    goToPrevPage,
    itemsPerPage,
    setItemsPerPage,
  } = useStockAudit();

  useEffect(() => {
    setStockMovementTypeName(filters.stock_movement_type_names?.[0]);
  }, [filters.stock_movement_type_names]);

  // Get store selection from store
  const { selectedStoreId, setSelectedStoreId } = useStockAuditStore(
    useShallow((state) => ({
      selectedStoreId: state.selectedStoreId,
      setSelectedStoreId: state.setSelectedStoreId,
    })),
  );

  const handleDelete = (id: string, storeId: string) => {
    deleteStockAudit(id, storeId);
  };

  const handleApplyFilters = (filters: StockAuditFilterOptions) => {
    setPopoverFilters(filters);
    setFilters({
      ...filters,
      stock_movement_type_names: stockMovementTypeName ? [stockMovementTypeName] : undefined,
    });
  };

  const handleStockMovementTypeChange = (value: string) => {
    const typeName = value === "all" ? undefined : value;
    setStockMovementTypeName(typeName);
    setFilters({
      ...popoverFilters,
      stock_movement_type_names: typeName ? [typeName] : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <StockAuditHeader
        goToNextPage={goToNextPage}
        goToPrevPage={goToPrevPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        itemsPerPage={itemsPerPage}
        selectedStoreId={selectedStoreId}
        setItemsPerPage={setItemsPerPage}
        setSelectedStoreId={setSelectedStoreId}
        stockMovementTypeName={stockMovementTypeName}
        storeOptions={storeOptions}
        onApplyFilters={handleApplyFilters}
        onCreateAudit={() => setIsCreateModalOpen(true)}
        onStockMovementTypeChange={handleStockMovementTypeChange}
      />

      {loading ? (
        <SkeletonTable columns={16} />
      ) : stockAuditList.length === 0 ? (
        <EmptyState
          action={
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              {t("buttons.startAudit")}
            </Button>
          }
          description={t("empty.description")}
          title={t("empty.title")}
        />
      ) : (
        <StockAuditTable
          basePath="/dashboard/stock-audit"
          data={stockAuditList}
          onDelete={handleDelete}
        />
      )}

      <CreateStockAuditModal
        isOpen={isCreateModalOpen}
        requireStockMovementType={requireStockMovementType}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

interface StockAuditProps {
  requireStockMovementType?: boolean;
}

const StockAudit: React.FC<StockAuditProps> = ({ requireStockMovementType }) => {
  const router = useRouter();
  const { tokenPayload } = useUser();
  const hasInitializedRef = useRef(false);

  // Get store selection state from zustand
  const { filters, selectedStoreId, setFilters, setSelectedStoreId } = useStockAuditStore(
    useShallow((state) => ({
      filters: state.filters,
      selectedStoreId: state.selectedStoreId,
      setFilters: state.setFilters,
      setSelectedStoreId: state.setSelectedStoreId,
    })),
  );

  // API Data Fetching
  const { data: storeData } = useGetStoreDataQuery({
    filters: { limit: 20 },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const stores = React.useMemo(() => storeData?.data?.stores ?? [], [storeData?.data?.stores]);
  const hasMultipleStores = stores.length > 1;

  // Store options — only show "All Store" when user has access to multiple stores
  const storeOptions = React.useMemo(() => {
    const mapped = stores.map((store) => ({ label: store.name, value: store.id }));
    if (hasMultipleStores) {
      return [{ label: "All Store", value: "0" }, ...mapped];
    }
    return mapped;
  }, [hasMultipleStores, stores]);

  useEffect(() => {
    if (!router.isReady || stores.length === 0 || hasInitializedRef.current) return;

    const queryStoreId =
      typeof router.query.store_id === "string" ? router.query.store_id : "";
    const defaultStoreId = hasMultipleStores ? "0" : stores[0]?.id;
    const resolvedStoreId = [queryStoreId, defaultStoreId].find(
      (id) => Boolean(id) && (id === "0" || stores.some((s) => s.id === id)),
    );
    if (resolvedStoreId && selectedStoreId !== resolvedStoreId) {
      setSelectedStoreId(resolvedStoreId);
    }

    const nextFilters: StockAuditFilterOptions = {
      ...(typeof router.query.type === "string" && { type: router.query.type as StockAuditFilterOptions["type"] }),
      ...(typeof router.query.status === "string" && { status: router.query.status as StockAuditFilterOptions["status"] }),
      ...(typeof router.query.aor_id === "string" && { aor_id: router.query.aor_id }),
      ...(typeof router.query.result === "string" && { result: router.query.result as StockAuditFilterOptions["result"] }),
      ...(typeof router.query.checking_object_id === "string" && {
        checking_object_id: router.query.checking_object_id,
      }),
      ...(typeof router.query.order_direction === "string" && {
        order_direction: router.query.order_direction as StockAuditFilterOptions["order_direction"],
      }),
      ...(typeof router.query.stock_movement_type_name === "string" && {
        stock_movement_type_names: [router.query.stock_movement_type_name],
      }),
    };

    setFilters({
      order_direction: "DESC",
      ...nextFilters,
    });
    hasInitializedRef.current = true;
  }, [hasMultipleStores, router, router.isReady, router.query, selectedStoreId, setFilters, setSelectedStoreId, stores]);

  useEffect(() => {
    if (!router.isReady || !selectedStoreId || !hasInitializedRef.current) return;

    const nextQuery: Record<string, string> = {
      store_id: selectedStoreId,
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...(filters.aor_id && { aor_id: filters.aor_id }),
      ...(filters.result && { result: filters.result }),
      ...(filters.checking_object_id && { checking_object_id: filters.checking_object_id }),
      ...(filters.order_direction && { order_direction: filters.order_direction }),
      ...(filters.stock_movement_type_names?.[0] && {
        stock_movement_type_name: filters.stock_movement_type_names[0],
      }),
    };

    const currentNormalized = JSON.stringify({
      ...(typeof router.query.store_id === "string" && { store_id: router.query.store_id }),
      ...(typeof router.query.type === "string" && { type: router.query.type }),
      ...(typeof router.query.status === "string" && { status: router.query.status }),
      ...(typeof router.query.aor_id === "string" && { aor_id: router.query.aor_id }),
      ...(typeof router.query.result === "string" && { result: router.query.result }),
      ...(typeof router.query.checking_object_id === "string" && {
        checking_object_id: router.query.checking_object_id,
      }),
      ...(typeof router.query.order_direction === "string" && {
        order_direction: router.query.order_direction,
      }),
      ...(typeof router.query.stock_movement_type_name === "string" && {
        stock_movement_type_name: router.query.stock_movement_type_name,
      }),
    });

    const nextNormalized = JSON.stringify(nextQuery);
    if (currentNormalized === nextNormalized) return;

    void router.replace(
      { pathname: router.pathname, query: nextQuery },
      undefined,
      { shallow: true },
    );
  }, [filters, router, selectedStoreId]);

  return (
    <StockAuditProvider storeId={selectedStoreId}>
      <StockAuditContent requireStockMovementType={requireStockMovementType} storeOptions={storeOptions} />
    </StockAuditProvider>
  );
};

export default StockAudit;
