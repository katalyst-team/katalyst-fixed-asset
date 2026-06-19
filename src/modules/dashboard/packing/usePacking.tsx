/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useUser } from "@/context/user-context";
import useGetStatusLedgerDataQuery from "@/hooks/api/status/useGetLedgerStatusDataQuery";
import useGetStockMovementDataQuery from "@/hooks/api/stockMovement/useGetStockMovementDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import { StockMovementItem } from "@/services/stockMovement/getStockMovementDataService";
import { EnumLedgerStatus, LedgerFilter, LedgerItemType } from "@/types/ledger";

interface PackingContextType {
  ledgerData: StockMovementItem[];
  filters: LedgerFilter;
  setFilters: (filters: LedgerFilter) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  selectedItems: LedgerItemType[];
  toggleItemSelection: (
    item: LedgerItemType,
    isSelected: boolean,
    createdAt?: string
  ) => void;
  clearSelectedItems: () => void;
  selectAllItems: (selected: boolean) => void;
  areAllItemsSelected: () => boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  // Status filter
  selectedStatus: EnumLedgerStatus;
  setSelectedStatus: (status: EnumLedgerStatus) => void;
  isPrintingMode: boolean;
}

const PackingContext = createContext<PackingContextType | undefined>(undefined);

interface PackingProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

export const PackingProvider: React.FC<PackingProviderProps> = ({
  children,
  itemsPerPage = 10,
}) => {
  const { tokenPayload, selectedTeam } = useUser();
  const [filters, setFilters] = useState<LedgerFilter>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);

  // Cursor pagination state
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const [selectedItems, setSelectedItems] = useState<LedgerItemType[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<EnumLedgerStatus>(
    EnumLedgerStatus.WAITING_PRINT
  );

  const { data: statuses } = useGetStatusLedgerDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const { data: stockMovementTypes } = useGetStockMovementTypesQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  // Get appropriate stock movement type IDs based on selected status
  const getStockMovementTypeIds = (): string[] => {
    if (selectedStatus === EnumLedgerStatus.WAITING_PRINT) {
      // For WAITING_PRINT, use only LEDGER type
      const ledgerType = stockMovementTypes?.find(
        (type) => type.name === "LEDGER"
      );
      return ledgerType ? [ledgerType.id] : [];
    } else if (selectedStatus === EnumLedgerStatus.WAITING_INBOUND) {
      // For WAITING_INBOUND, use all types with direction === "INBOUND"
      const inboundTypes =
        stockMovementTypes?.filter((type) => type.direction === "INBOUND") ||
        [];
      return inboundTypes.map((type) => type.id);
    }
    return [];
  };

  const currentStockMovementTypeIds = getStockMovementTypeIds();
  const currentStatusId =
    ((statuses?.data.statuses || []).find(
      (status) => status.name === selectedStatus
    )
      ?.id as EnumLedgerStatus) ?? selectedStatus;

  const requestFilters = {
    ...filters,
    cursor: currentCursor,
    limit: localItemsPerPage,
    status_ids: [currentStatusId],
    // stock_movement_type_ids: currentStockMovementTypeIds,
  };

  // Determine if we're in printing mode (only for WAITING_PRINT status)
  const isPrintingMode = selectedStatus === EnumLedgerStatus.WAITING_PRINT;

  const { data, isLoading, isSuccess } = useGetStockMovementDataQuery({
    filters: requestFilters,
    organizationId: tokenPayload?.organization_id ?? "",
    storeId: selectedTeam,
  });

  const [ledgerData, setLedgerData] = useState<StockMovementItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    if (isSuccess && data?.data?.stock_movements) {
      setLedgerData(data.data.stock_movements || []);

      // Handle pagination from API response
      if (data.pagination) {
        const nextCursor = data.pagination.next_cursor;

        setNextCursor(nextCursor);
        setHasNextPage(!!nextCursor);
        setTotalItems(data.pagination.count || 0);
      }
    }
  }, [data, isSuccess]);

  // Cursor pagination methods
  const goToNextPage = useCallback(() => {
    if (hasNextPage && nextCursor) {
      setCurrentCursor(nextCursor);
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage, nextCursor]);

  const goToPrevPage = useCallback(() => {
    if (data?.pagination?.prev_cursor) {
      setCurrentCursor(data.pagination.prev_cursor);
      setCurrentPage((prev) => Math.max(1, prev - 1));
    } else if (currentPage > 1) {
      // Go to first page if no prev_cursor but not on first page
      setCurrentCursor(undefined);
      setCurrentPage(1);
    }
  }, [data?.pagination?.prev_cursor, currentPage]);

  // Handle item selection
  const toggleItemSelection = (
    item: LedgerItemType,
    isSelected: boolean,
    createdAt?: string
  ) => {
    if (isSelected) {
      setSelectedItems((prev) => [
        ...prev,
        { ...item, ...(createdAt ? { created_at: createdAt } : {}) },
      ]);
    } else {
      setSelectedItems((prev) =>
        prev.filter((selectedItem) => selectedItem.id !== item.id)
      );
    }
  };

  const clearSelectedItems = () => {
    setSelectedItems([]);
  };

  // Function to select or deselect all items
  const selectAllItems = (selected: boolean) => {
    if (selected) {
      // Collect all items from new_item_status_histories across all ledger data
      const allItems: LedgerItemType[] = [];
      ledgerData.forEach((stockMovementItem) => {
        stockMovementItem.new_item_status_histories?.forEach(
          (statusHistory) => {
            const itemWithCreatedAt = {
              ...statusHistory.item,
              ...(stockMovementItem.created_at
                ? { created_at: stockMovementItem.created_at }
                : {}),
            } as unknown as LedgerItemType;
            allItems.push(itemWithCreatedAt);
          }
        );
      });
      setSelectedItems(allItems);
    } else {
      clearSelectedItems();
    }
  };

  // Check if all items are selected
  const areAllItemsSelected = () => {
    // Count total items from new_item_status_histories
    const totalItems = ledgerData.reduce((count, stockMovementItem) => {
      return count + (stockMovementItem.new_item_status_histories?.length || 0);
    }, 0);

    return totalItems > 0 && selectedItems.length === totalItems;
  };

  // Update setFilters to reset cursor pagination
  const handleSetFilters = useCallback((newFilters: LedgerFilter) => {
    setCurrentCursor(undefined);
    setCurrentPage(1);
    setNextCursor(null);
    setHasNextPage(false);
    setTotalItems(0);
    setFilters(newFilters);
  }, []);

  // Reset selection when status changes
  useEffect(() => {
    clearSelectedItems();
    // Reset pagination when status changes
    setCurrentCursor(undefined);
    setCurrentPage(1);
    setNextCursor(null);
    setHasNextPage(false);
    setTotalItems(0);
  }, [selectedStatus]);

  const value: PackingContextType = {
    areAllItemsSelected,
    clearSelectedItems,
    currentPage,
    filters,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage: !!data?.pagination?.prev_cursor,
    isLoading,
    isPrintingMode,
    itemsPerPage: localItemsPerPage,
    ledgerData,
    selectAllItems,
    selectedItems,
    selectedStatus,
    setCurrentPage,
    setFilters: handleSetFilters,
    setSelectedStatus,
    toggleItemSelection,
    totalItems,
  };

  return (
    <PackingContext.Provider value={value}>{children}</PackingContext.Provider>
  );
};

export const usePacking = (): PackingContextType => {
  const context = useContext(PackingContext);
  if (!context) {
    throw new Error("usePacking must be used within a PackingProvider");
  }
  return context;
};
