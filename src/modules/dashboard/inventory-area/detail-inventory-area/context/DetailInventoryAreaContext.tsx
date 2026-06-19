import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import { useGetInventoryAreaDetailQuery } from "@/hooks/api/inventory-area";
import {
  InventoryAreaDetailFilterOptions,
  InventoryItem,
  SectionInventorySummary,
} from "@/types/inventory-area";

import { useDetailInventoryAreaStore } from "../store";

interface DetailInventoryAreaContextType {
  loading: boolean;
  inventories: InventoryItem[];
  section: SectionInventorySummary | null;
  totalQuantity: number;
  filters: InventoryAreaDetailFilterOptions;
  setFilters: (filters: InventoryAreaDetailFilterOptions) => void;
  nextCursor: string;
  prevCursor: string;
  currentOffset: number;
  setCurrentOffset: (offset: number) => void;
  resetOffset: () => void;
  storeId: string;
  sectionId: string;
  stockMovementTypeIds?: string[];
}

const DetailInventoryAreaContext =
  createContext<DetailInventoryAreaContextType>({
    currentOffset: 0,
    filters: { limit: 20 },
    inventories: [],
    loading: false,
    nextCursor: "",
    prevCursor: "",
    resetOffset: () => {},
    section: null,
    sectionId: "",
    setCurrentOffset: () => {},
    setFilters: () => {},
    stockMovementTypeIds: undefined,
    storeId: "",
    totalQuantity: 0,
  });

interface DetailInventoryAreaProviderProps {
  children: React.ReactNode;
  storeId: string;
  sectionId: string;
  stockMovementTypeIds?: string[];
  initialFilters?: InventoryAreaDetailFilterOptions;
}

export const DetailInventoryAreaProvider: React.FC<
  DetailInventoryAreaProviderProps
> = ({
  children,
  stockMovementTypeIds: initialStockMovementTypeIds,
  initialFilters,
  sectionId,
  storeId,
}) => {
  const { tokenPayload } = useUser();

  const {
    currentOffset,
    filters,
    resetOffset,
    setCurrentOffset,
    setFilters,
  } = useDetailInventoryAreaStore(
    useShallow((state) => ({
      currentOffset: state.currentOffset,
      filters: state.filters,
      resetOffset: state.resetOffset,
      setCurrentOffset: state.setCurrentOffset,
      setFilters: state.setFilters,
    }))
  );

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters, setFilters]);

  const stockMovementTypeIds =
    filters.stock_movement_type_ids || initialStockMovementTypeIds;

  const { data, isLoading, isFetching } = useGetInventoryAreaDetailQuery({
    enabled: !!tokenPayload?.organization_id && !!storeId && !!sectionId,
    filters: {
      ...filters,
      ...(stockMovementTypeIds && stockMovementTypeIds.length > 0 && {
        stock_movement_type_ids: stockMovementTypeIds,
      }),
    },
    organizationId: tokenPayload?.organization_id || "",
    sectionId,
    storeId,
  });

  const handleSetFilters = useCallback(
    (newFilters: InventoryAreaDetailFilterOptions) => {
      if (newFilters.query !== filters.query) {
        resetOffset();
      }
      setFilters(newFilters);
    },
    [setFilters, resetOffset, filters.query]
  );

  const value: DetailInventoryAreaContextType = {
    currentOffset,
    filters,
    inventories: data?.data?.inventories || [],
    loading: isLoading || isFetching,
    nextCursor: data?.pagination?.next_cursor || "",
    prevCursor: data?.pagination?.prev_cursor || "",
    resetOffset,
    section: data?.data?.section || null,
    sectionId,
    setCurrentOffset,
    setFilters: handleSetFilters,
    stockMovementTypeIds,
    storeId,
    totalQuantity: data?.data?.total_quantity ?? 0,
  };

  return (
    <DetailInventoryAreaContext.Provider value={value}>
      {children}
    </DetailInventoryAreaContext.Provider>
  );
};

export const useDetailInventoryArea = () => {
  const context = useContext(DetailInventoryAreaContext);
  if (!context) {
    throw new Error(
      "useDetailInventoryArea must be used within a DetailInventoryAreaProvider"
    );
  }
  return context;
};
