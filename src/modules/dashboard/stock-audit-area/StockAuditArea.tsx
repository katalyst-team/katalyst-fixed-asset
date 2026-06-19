import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { StockAuditAreaFilterOptions } from "@/types/stock-audit-area";

import CreateAllAuditConfirmationModal from "./components/CreateAllAuditConfirmationModal";
import CreateStockAuditAreaModal from "./components/CreateStockAuditAreaModal";
import StockAuditAreaGrid from "./components/StockAuditAreaGrid";
import StockAuditAreaHeader from "./components/StockAuditAreaHeader";
import StockAuditAreaMetrics from "./components/StockAuditAreaMetrics";
import {
  StockAuditAreaProvider,
  useStockAuditArea,
} from "./context/StockAuditAreaContext";
import { useStockAuditAreaStore } from "./store";

const StockAuditAreaContent: React.FC<{
  basePath?: string;
  requireStockMovementType?: boolean;
  selectedStoreId: string;
  storeOptions: { label: string; value: string }[];
}> = ({ basePath, requireStockMovementType, selectedStoreId, storeOptions }) => {
  const { t } = useTranslation("stock-audit-area");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isCreateAllModalOpen, setIsCreateAllModalOpen] = React.useState(false);
  const [stockMovementTypeName, setStockMovementTypeName] = React.useState<string | undefined>(undefined);
  const [lastAuditResult, setLastAuditResult] = React.useState<string>("all");

  const { stockAuditAreaList, loading, summary, filters, setFilters, createStockAuditArea } =
    useStockAuditArea();

  useEffect(() => {
    setStockMovementTypeName(filters.stock_movement_type_names?.[0]);
  }, [filters.stock_movement_type_names]);

  const { setSelectedStoreId } = useStockAuditAreaStore(
    useShallow((state) => ({
      setSelectedStoreId: state.setSelectedStoreId,
    })),
  );

  const handleApplyFilters = (newFilters: StockAuditAreaFilterOptions) => {
    setFilters({
      ...newFilters,
      stock_movement_type_names: stockMovementTypeName && stockMovementTypeName !== "all"
        ? [stockMovementTypeName]
        : undefined,
    });
  };

  const handleStockMovementTypeChange = (value: string) => {
    setStockMovementTypeName(value);
    setFilters({
      ...filters,
      stock_movement_type_names: value && value !== "all" ? [value] : undefined,
    });
  };

  const handleLastAuditResultChange = (value: string) => {
    setLastAuditResult(value);
  };

  const handleCreateAllAudit = async () => {
    setIsCreateAllModalOpen(false);

    try {
      await createStockAuditArea({
        store_id: selectedStoreId,
      });
      toast.success(t("toast.createAllSuccess"));
    } catch (error) {
      console.error("Error creating all audit:", error);
      toast.error(t("toast.createAllError"));
    }
  };

  const processedStockAuditAreaList = React.useMemo(() => {
    let list = [...stockAuditAreaList];

    if (lastAuditResult === "CONSISTENT") {
      list = list.filter((item) => item.last_audit_result === "CONSISTENT");
    } else if (lastAuditResult === "MISMATCH") {
      list = list.filter((item) => item.last_audit_result === "MISMATCH");
    } else if (lastAuditResult === "empty") {
      list = list.filter((item) => item.last_audit_result === null);
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [stockAuditAreaList, lastAuditResult]);

  return (
    <div className="space-y-4 px-2 sm:px-0">
      <StockAuditAreaHeader
        lastAuditResult={lastAuditResult}
        selectedStoreId={selectedStoreId}
        setSelectedStoreId={setSelectedStoreId}
        stockMovementTypeName={stockMovementTypeName}
        storeOptions={storeOptions}
        onApplyFilters={handleApplyFilters}
        onCreateAllAudit={() => setIsCreateAllModalOpen(true)}
        onCreateAudit={() => setIsCreateModalOpen(true)}
        onLastAuditResultChange={handleLastAuditResultChange}
        onStockMovementTypeChange={handleStockMovementTypeChange}
      />

      <StockAuditAreaMetrics summary={summary} />

      {loading ? (
        <Loading />
      ) : processedStockAuditAreaList.length === 0 ? (
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
        <StockAuditAreaGrid
          basePath={basePath}
          data={processedStockAuditAreaList}
          storeId={selectedStoreId}
        />
      )}

      <CreateStockAuditAreaModal
        isOpen={isCreateModalOpen}
        requireStockMovementType={requireStockMovementType}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <CreateAllAuditConfirmationModal
        isOpen={isCreateAllModalOpen}
        onClose={() => setIsCreateAllModalOpen(false)}
        onConfirm={handleCreateAllAudit}
      />
    </div>
  );
};

interface StockAuditAreaProps {
  basePath?: string;
  requireStockMovementType?: boolean;
}

const StockAuditArea: React.FC<StockAuditAreaProps> = ({ basePath, requireStockMovementType }) => {
  const router = useRouter();
  const { tokenPayload } = useUser();
  const hasInitializedRef = useRef(false);

  const { filters, selectedStoreId, setFilters, setSelectedStoreId } = useStockAuditAreaStore(
    useShallow((state) => ({
      filters: state.filters,
      selectedStoreId: state.selectedStoreId,
      setFilters: state.setFilters,
      setSelectedStoreId: state.setSelectedStoreId,
    })),
  );

  const { data: storeData } = useGetStoreDataQuery({
    filters: { limit: 20 },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const stores = React.useMemo(() => storeData?.data?.stores ?? [], [storeData?.data?.stores]);
  const hasMultipleStores = stores.length > 1;

  const storeOptions = React.useMemo(
    () => stores.map((store) => ({ label: store.name, value: store.id })),
    [stores],
  );

  useEffect(() => {
    if (!router.isReady || stores.length === 0 || hasInitializedRef.current) return;

    const queryStoreId =
      typeof router.query.store_id === "string" ? router.query.store_id : "";
    const savedId =
      typeof window !== "undefined"
        ? (localStorage.getItem("selectedStoreId_stockAuditArea") ?? "")
        : "";

    const defaultStoreId = stores[0]?.id;
    const resolvedStoreId = [queryStoreId, savedId, defaultStoreId].find(
      (id) => Boolean(id) && stores.some((s) => s.id === id),
    );

    if (resolvedStoreId && selectedStoreId !== resolvedStoreId) {
      setSelectedStoreId(resolvedStoreId);
    }

    setFilters({
      ...(typeof router.query.sort === "string" && {
        sort: router.query.sort as StockAuditAreaFilterOptions["sort"],
      }),
      ...(typeof router.query.date === "string" && { date: router.query.date }),
      ...(typeof router.query.stock_movement_type_name === "string" && {
        stock_movement_type_names: [router.query.stock_movement_type_name],
      }),
    });

    hasInitializedRef.current = true;
  }, [
    hasMultipleStores,
    router.isReady,
    router.query,
    selectedStoreId,
    setFilters,
    setSelectedStoreId,
    stores,
  ]);

  useEffect(() => {
    if (!router.isReady || !selectedStoreId || !hasInitializedRef.current) return;

    const nextQuery: Record<string, string> = {
      store_id: selectedStoreId,
      ...(filters.sort && { sort: filters.sort }),
      ...(filters.date && { date: filters.date }),
      ...(filters.stock_movement_type_names?.[0] && {
        stock_movement_type_name: filters.stock_movement_type_names[0],
      }),
    };

    const currentNormalized = JSON.stringify({
      ...(typeof router.query.store_id === "string" && { store_id: router.query.store_id }),
      ...(typeof router.query.sort === "string" && { sort: router.query.sort }),
      ...(typeof router.query.date === "string" && { date: router.query.date }),
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
  }, [filters, router, router.isReady, router.pathname, router.query, selectedStoreId]);

  return (
    <StockAuditAreaProvider storeId={selectedStoreId}>
      <StockAuditAreaContent
        basePath={basePath}
        requireStockMovementType={requireStockMovementType}
        selectedStoreId={selectedStoreId}
        storeOptions={storeOptions}
      />
    </StockAuditAreaProvider>
  );
};

export default StockAuditArea;
