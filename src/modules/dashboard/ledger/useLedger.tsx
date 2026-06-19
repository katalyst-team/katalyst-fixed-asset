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
import useGetLedgerDataQuery from "@/hooks/api/ledger/useGetLedgerDataQuery";
import useGetStatusLedgerDataQuery from "@/hooks/api/status/useGetLedgerStatusDataQuery";
import { EnumLedgerStatus, LedgerFilter, LedgerItemType } from "@/types/ledger";

interface LedgerContextType {
  ledgerData: LedgerItemType[];
  filters: LedgerFilter;
  setFilters: (filters: LedgerFilter) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  selectedItems: LedgerItemType[];
  toggleItemSelection: (item: LedgerItemType, isSelected: boolean) => void;
  clearSelectedItems: () => void;
  selectAllItems: (selected: boolean) => void;
  areAllItemsSelected: () => boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

interface LedgerProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

export const LedgerProvider: React.FC<LedgerProviderProps> = ({
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
  const { data: statuses } = useGetStatusLedgerDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const waitingPrintStatusId =
    ((statuses?.data.statuses || []).find(
      (status) => status.name === EnumLedgerStatus.WAITING_PRINT
    )?.id as EnumLedgerStatus) ?? EnumLedgerStatus.WAITING_PRINT;

  const requestFilters = {
    ...filters,
    cursor: currentCursor,
    limit: localItemsPerPage,
    status_id: waitingPrintStatusId,
  };

  const { data, isLoading, isSuccess } = useGetLedgerDataQuery({
    filters: requestFilters,
    organizationId: tokenPayload?.organization_id ?? "",
    storeId: selectedTeam,
  });

  const [ledgerData, setLedgerData] = useState<LedgerItemType[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  useEffect(() => {
    if (isSuccess && data?.data?.items) {
      setLedgerData(data.data.items);

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
  const toggleItemSelection = (item: LedgerItemType, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems((prev) => [...prev, item]);
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
      setSelectedItems(ledgerData);
    } else {
      clearSelectedItems();
    }
  };

  // Check if all items are selected
  const areAllItemsSelected = () => {
    return ledgerData.length > 0 && selectedItems.length === ledgerData.length;
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

  const value: LedgerContextType = {
    areAllItemsSelected,
    clearSelectedItems,
    currentPage,
    filters,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage: !!data?.pagination?.prev_cursor,
    isLoading,
    itemsPerPage: localItemsPerPage,
    ledgerData,
    selectAllItems,
    selectedItems,
    setCurrentPage,
    setFilters: handleSetFilters,
    toggleItemSelection,
    totalItems,
  };

  return (
    <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
  );
};

export const useLedger = (): LedgerContextType => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error("useLedger must be used within a LedgerProvider");
  }
  return context;
};
