import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React, { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import { useUser } from "@/context/user-context";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { InventoryAreaFilterOptions } from "@/types/inventory-area";

import InventoryAreaGrid from "./components/InventoryAreaGrid";
import InventoryAreaHeader from "./components/InventoryAreaHeader";
import InventoryAreaMetrics from "./components/InventoryAreaMetrics";
import { InventoryAreaProvider, useInventoryArea } from "./context/InventoryAreaContext";
import { useInventoryAreaStore } from "./store";

const InventoryAreaContent: React.FC<{
  filters: InventoryAreaFilterOptions;
  storeOptions: { label: string; value: string }[];
  selectedStoreId: string;
}> = ({ filters, storeOptions, selectedStoreId }) => {
  const { t } = useTranslation("inventory-area");
  const { sections, loading, totalQuantity, totalSections, setFilters } =
    useInventoryArea();
  const { setSelectedStoreId } = useInventoryAreaStore(
    useShallow((state) => ({ setSelectedStoreId: state.setSelectedStoreId }))
  );

  const handleApplyFilters = (filters: InventoryAreaFilterOptions) => {
    setFilters(filters);
  };

  return (
    <div className="space-y-4 px-2 sm:px-0">
      <InventoryAreaHeader
        initialFilters={filters}
        selectedStoreId={selectedStoreId}
        setSelectedStoreId={setSelectedStoreId}
        storeOptions={storeOptions}
        onApplyFilters={handleApplyFilters}
      />

      <InventoryAreaMetrics
        totalQuantity={totalQuantity}
        totalSections={totalSections}
      />

      {loading ? (
        <Loading />
      ) : sections.length === 0 ? (
        <EmptyState
          description={t("empty.description")}
          title={t("empty.title")}
        />
      ) : (
        <InventoryAreaGrid data={sections} storeId={selectedStoreId} />
      )}
    </div>
  );
};

const InventoryArea: React.FC = () => {
  const router = useRouter();
  const { tokenPayload } = useUser();
  const hasInitializedRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { filters, selectedStoreId, setFilters, setSelectedStoreId } = useInventoryAreaStore(
    useShallow((state) => ({
      filters: state.filters,
      selectedStoreId: state.selectedStoreId,
      setFilters: state.setFilters,
      setSelectedStoreId: state.setSelectedStoreId,
    }))
  );

  const { data: storeData } = useGetStoreDataQuery({
    filters: { limit: 10000 },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const storeOptions = React.useMemo(() => {
    if (storeData?.data?.stores) {
      return storeData.data.stores.map((store) => ({
        label: store.name,
        value: store.id,
      }));
    }
    return [];
  }, [storeData]);

  useEffect(() => {
    if (!router.isReady || hasInitializedRef.current) return;
    const stores = storeData?.data?.stores || [];
    if (stores.length === 0) return;

    const queryStoreId =
      typeof router.query.store_id === "string" ? router.query.store_id : "";
    const savedStoreId =
      typeof window !== "undefined"
        ? (localStorage.getItem("selectedStoreId_inventoryArea") ?? "")
        : "";

    const resolvedStoreId = [queryStoreId, savedStoreId, stores[0]?.id].find(
      (id) => Boolean(id) && stores.some((s) => s.id === id),
    );
    if (resolvedStoreId && selectedStoreId !== resolvedStoreId) {
      setSelectedStoreId(resolvedStoreId);
    }

    const sort =
      router.query.sort === "NAME" ||
      router.query.sort === "QUANTITY_ASC" ||
      router.query.sort === "QUANTITY_DESC"
        ? router.query.sort
        : undefined;

    setFilters({
      ...(typeof router.query.section_ids === "string" && {
        section_ids: router.query.section_ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      }),
      ...(typeof router.query.query === "string" && {
        query: router.query.query,
      }),
      ...(typeof router.query.rfid_name === "string" && {
        rfid_name: router.query.rfid_name,
      }),
      ...(sort && { sort }),
      ...(typeof router.query.stock_movement_type_id === "string" && {
        stock_movement_type_id: router.query.stock_movement_type_id,
      }),
      ...(typeof router.query.start_date === "string" && {
        start_date: router.query.start_date,
      }),
      ...(typeof router.query.end_date === "string" && {
        end_date: router.query.end_date,
      }),
    });
    hasInitializedRef.current = true;
    setIsInitialized(true);
  }, [router, router.isReady, router.query, selectedStoreId, setFilters, setSelectedStoreId, storeData]);

  useEffect(() => {
    if (!router.isReady || !selectedStoreId || !hasInitializedRef.current) return;

    const nextQuery: Record<string, string> = {
      store_id: selectedStoreId,
      ...(filters.query && { query: filters.query }),
      ...(filters.rfid_name && { rfid_name: filters.rfid_name }),
      ...(filters.section_ids &&
        filters.section_ids.length > 0 && {
          section_ids: filters.section_ids.join(","),
        }),
      ...(filters.sort && { sort: filters.sort }),
      ...(filters.stock_movement_type_id && {
        stock_movement_type_id: filters.stock_movement_type_id,
      }),
      ...(filters.start_date && { start_date: filters.start_date }),
      ...(filters.end_date && { end_date: filters.end_date }),
    };

    const currentQuery = router.query;
    const currentNormalized = JSON.stringify({
      ...(typeof currentQuery.store_id === "string" && {
        store_id: currentQuery.store_id,
      }),
      ...(typeof currentQuery.query === "string" && { query: currentQuery.query }),
      ...(typeof currentQuery.rfid_name === "string" && {
        rfid_name: currentQuery.rfid_name,
      }),
      ...(typeof currentQuery.section_ids === "string" && {
        section_ids: currentQuery.section_ids,
      }),
      ...(typeof currentQuery.sort === "string" && { sort: currentQuery.sort }),
      ...(typeof currentQuery.stock_movement_type_id === "string" && {
        stock_movement_type_id: currentQuery.stock_movement_type_id,
      }),
      ...(typeof currentQuery.start_date === "string" && {
        start_date: currentQuery.start_date,
      }),
      ...(typeof currentQuery.end_date === "string" && {
        end_date: currentQuery.end_date,
      }),
    });

    const nextNormalized = JSON.stringify(nextQuery);
    if (currentNormalized === nextNormalized) return;

    void router.replace(
      { pathname: router.pathname, query: nextQuery },
      undefined,
      { shallow: true }
    );
  }, [filters, router, selectedStoreId]);

  return (
    <InventoryAreaProvider enabled={isInitialized} storeId={selectedStoreId}>
      <InventoryAreaContent
        filters={filters}
        selectedStoreId={selectedStoreId}
        storeOptions={storeOptions}
      />
    </InventoryAreaProvider>
  );
};

export default InventoryArea;
