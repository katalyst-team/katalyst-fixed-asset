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
import { RfidType } from "@/types/rfid";

interface LedgerContextType {
  ledgerData: StockMovementItem[];
  filters: LedgerFilter;
  setFilters: (filters: LedgerFilter) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  setItemsPerPage: (limit: number) => void;
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
  // EPC type for conditional filtering
  epcType?: RfidType;
  setEpcType: (type?: RfidType) => void;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

interface LedgerProviderV2Props {
  children: ReactNode;
  itemsPerPage?: number;
  epcType?: RfidType;
  initialStatus?: EnumLedgerStatus;
}

export const LedgerProviderV2: React.FC<LedgerProviderV2Props> = ({
  children,
  itemsPerPage = 10,
  epcType,
  initialStatus,
}) => {
  const { tokenPayload, selectedTeam } = useUser();
  const [filters, setFilters] = useState<LedgerFilter>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage, setLocalItemsPerPage] =
    useState<number>(itemsPerPage);

  const handleSetItemsPerPage = (limit: number) => {
    setLocalItemsPerPage(limit);
    setCurrentCursor(undefined);
    setCurrentPage(1);
    setNextCursor(null);
    setHasNextPage(false);
    setTotalItems(0);
  };

  // Cursor pagination state
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const [selectedItems, setSelectedItems] = useState<LedgerItemType[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<EnumLedgerStatus>(
    initialStatus ?? EnumLedgerStatus.WAITING_PRINT
  );
  const [currentEpcType, setEpcType] = useState<RfidType | undefined>(epcType);

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
    ((statuses?.data?.statuses || []).find((status) => status.name === selectedStatus)
      ?.id as EnumLedgerStatus) ?? selectedStatus;

  // Conditional rfid_type parameter based on EPC type and status
  const getRfidTypeParam = (): RfidType | undefined => {
    if (currentEpcType === RfidType.REUSABLE) {
      // Reusable EPC route: always add rfid_type=REUSABLE
      return RfidType.REUSABLE;
    } else if (currentEpcType === RfidType.DISPOSABLE) {
      // Disposable EPC route: add rfid_type=DISPOSABLE only for WAITING_INBOUND tab
      if (selectedStatus === EnumLedgerStatus.WAITING_INBOUND) {
        return RfidType.DISPOSABLE;
      }
      // For WAITING_PRINT tab, do NOT add rfid_type param
      return undefined;
    }
    // Default: no rfid_type param
    return undefined;
  };

  const rfidTypeParam = getRfidTypeParam();
  const requestFilters = {
    ...filters,
    cursor: currentCursor,
    limit: localItemsPerPage,
    status_ids: [currentStatusId],
    // stock_movement_type_ids: currentStockMovementTypeIds,
    ...(rfidTypeParam && { rfid_type: rfidTypeParam }),
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
      const allItems: LedgerItemType[] = [];
      ledgerData.forEach((item) => {
        const statusHistoriesToProcess =
          item.stock_movement_type.name === "LEDGER_PACKING"
            ? item.new_item_status_histories?.slice(0, 1) || []
            : item.new_item_status_histories || [];

        statusHistoriesToProcess.forEach((statusItem) => {
          const ledgerItemWithPackingInfo = {
            ...(statusItem.item as unknown as LedgerItemType),
            _isPackingType: item.stock_movement_type.name === "LEDGER_PACKING",
            _ledgerId: item.id,
            ...(item.stock_movement_type.name === "LEDGER_PACKING" && {
              _packingItems: (item.new_item_status_histories || []).map(
                (historyItem) => historyItem.item as unknown as LedgerItemType
              ),
            }),
            _stockMovementType: item.stock_movement_type,
          };
          allItems.push(ledgerItemWithPackingInfo);
        });
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

  const value: LedgerContextType = {
    areAllItemsSelected,
    clearSelectedItems,
    currentPage,
    epcType: currentEpcType,
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
    setEpcType,
    setFilters: handleSetFilters,
    setItemsPerPage: handleSetItemsPerPage,
    setSelectedStatus,
    toggleItemSelection,
    totalItems,
  };

  return (
    <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
  );
};

export const useLedgerV2 = (): LedgerContextType => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error("useLedger must be used within a LedgerProviderV2");
  }
  return context;
};
