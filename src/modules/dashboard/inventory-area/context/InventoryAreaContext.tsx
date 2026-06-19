import React, {
  createContext,
  useCallback,
  useContext,
} from "react";
import { useShallow } from "zustand/react/shallow";

import { useUser } from "@/context/user-context";
import { useGetInventoryAreaListQuery } from "@/hooks/api/inventory-area";
import {
  InventoryAreaFilterOptions,
  SectionInventorySummary,
} from "@/types/inventory-area";

import { useInventoryAreaStore } from "../store";

interface InventoryAreaContextType {
  loading: boolean;
  sections: SectionInventorySummary[];
  totalQuantity: number;
  totalSections: number;
  filters: InventoryAreaFilterOptions;
  setFilters: (filters: InventoryAreaFilterOptions) => void;
}

const InventoryAreaContext = createContext<InventoryAreaContextType>({
  filters: {},
  loading: false,
  sections: [],
  setFilters: () => {},
  totalQuantity: 0,
  totalSections: 0,
});

export const InventoryAreaProvider: React.FC<{
  children: React.ReactNode;
  storeId?: string;
  enabled?: boolean;
}> = ({ children, storeId, enabled = true }) => {
  const { tokenPayload, selectedTeam } = useUser();
  const effectiveStoreId = storeId || selectedTeam;

  const { filters, setFilters } = useInventoryAreaStore(
    useShallow((state) => ({
      filters: state.filters,
      setFilters: state.setFilters,
    }))
  );

  const { data, isLoading, isFetching } = useGetInventoryAreaListQuery({
    enabled: !!tokenPayload?.organization_id && !!effectiveStoreId && enabled,
    filters,
    organizationId: tokenPayload?.organization_id || "",
    storeId: effectiveStoreId,
  });

  const handleSetFilters = useCallback(
    (newFilters: InventoryAreaFilterOptions) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const rawSections = data?.data?.sections || [];
  const filteredSections = filters.rfid_name
    ? rawSections.filter((section) => section.quantity > 0)
    : rawSections;

  const value: InventoryAreaContextType = {
    filters,
    loading: (isLoading || isFetching) || !enabled,
    sections: filteredSections,
    setFilters: handleSetFilters,
    totalQuantity: filters.rfid_name
      ? filteredSections.reduce((acc, curr) => acc + curr.quantity, 0)
      : data?.data?.total_quantity ?? 0,
    totalSections: filteredSections.length,
  };

  return (
    <InventoryAreaContext.Provider value={value}>
      {children}
    </InventoryAreaContext.Provider>
  );
};

export const useInventoryArea = () => {
  const context = useContext(InventoryAreaContext);
  if (!context) {
    throw new Error(
      "useInventoryArea must be used within an InventoryAreaProvider"
    );
  }
  return context;
};
