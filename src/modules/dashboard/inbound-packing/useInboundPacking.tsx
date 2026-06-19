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
import useGetStockMovementDataQuery from "@/hooks/api/stockMovement/useGetStockMovementDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import {
  StockMovementItem,
  StockMovementType,
} from "@/services/stockMovement/getStockMovementDataService";
import { InboundFilterOptions } from "@/types/inbound";
import { formatStockMovementTypeName } from "@/utils/stockMovementType";

interface InboundPackingContextType {
  inboundPackingData: StockMovementItem[];
  setFilterOptions: (filters: InboundFilterOptions) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  stockMovementTypes: { label: string; value: string }[];
  isLoadingStockMovementTypes: boolean;
  currentFilters: Omit<InboundFilterOptions, "limit" | "cursor">;
}

const InboundPackingContext = createContext<
  InboundPackingContextType | undefined
>(undefined);

interface InboundPackingProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

export const InboundPackingProvider: React.FC<InboundPackingProviderProps> = ({
  children,
  itemsPerPage = 5,
}) => {
  const [activeFilters, setActiveFilters] = useState<
    Omit<InboundFilterOptions, "limit" | "cursor">
  >({});
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const { tokenPayload, selectedTeam } = useUser();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);
  const [totalItems, setTotalItems] = useState<number>(0);

  const {
    data: stockMovementTypesData,
    isLoading: isLoadingStockMovementTypes,
  } = useGetStockMovementTypesQuery({
    organizationId: tokenPayload?.organization_id || "",
  });

  const stockMovementTypes =
    stockMovementTypesData?.map((type: StockMovementType) => ({
      label: formatStockMovementTypeName(type.name),
      value: type.id,
    })) || [];

  const inboundPackingTypeIds =
    stockMovementTypesData
      ?.filter((type: StockMovementType) => type.direction === "INBOUND")
      .map((type: StockMovementType) => type.id) || [];

  const requestFilters = {
    ...activeFilters,
    cursor: currentCursor,
    limit: localItemsPerPage,
    stock_movement_type_ids:
      inboundPackingTypeIds.length > 0 ? inboundPackingTypeIds : undefined,
  };

  const { data, isLoading, isSuccess } = useGetStockMovementDataQuery({
    filters: requestFilters,
    organizationId: tokenPayload?.organization_id || "",
    storeId: selectedTeam || "",
  });

  const [inboundPackingData, setInboundPackingData] = useState<
    StockMovementItem[]
  >([]);

  useEffect(() => {
    if (isSuccess && data) {
      setInboundPackingData(data.data.stock_movements || []);

      // Access pagination directly from the ApiResponse structure
      const nextCursor = data.pagination?.next_cursor;

      setNextCursor(nextCursor);
      setHasNextPage(!!nextCursor); // Has next page if next_cursor exists
      setTotalItems(data.pagination?.count || 0);
    }
  }, [data, isSuccess]);

  const goToNextPage = useCallback(() => {
    if (hasNextPage && nextCursor) {
      setCurrentCursor(nextCursor);
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage, nextCursor]);

  const goToPrevPage = useCallback(() => {
    if (data?.pagination?.prev_cursor) {
      // If we have a direct prev_cursor from the API, use it
      setCurrentCursor(data.pagination?.prev_cursor);
      setCurrentPage((prev) => Math.max(1, prev - 1));
    } else if (currentPage > 1) {
      // If on a page > 1 but have no prev cursors, go to first page
      setCurrentCursor(undefined);
      setCurrentPage(1);
    }
  }, [data?.pagination?.prev_cursor, currentPage]);

  const setFilterOptions = useCallback(
    (newFilters: Omit<InboundFilterOptions, "limit" | "cursor">) => {
      setCurrentCursor(undefined);
      setCurrentPage(1);
      setNextCursor(null);
      setHasNextPage(false);
      setTotalItems(0);
      setActiveFilters(newFilters);
    },
    []
  );

  const value: InboundPackingContextType = {
    currentFilters: activeFilters,
    currentPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage: !!data?.pagination?.prev_cursor,
    inboundPackingData,
    isLoading: isLoading || isLoadingStockMovementTypes,
    isLoadingStockMovementTypes,
    itemsPerPage: localItemsPerPage,
    setFilterOptions,
    stockMovementTypes,
    totalItems,
  };

  return (
    <InboundPackingContext.Provider value={value}>
      {children}
    </InboundPackingContext.Provider>
  );
};

export const useInboundPacking = (): InboundPackingContextType => {
  const context = useContext(InboundPackingContext);
  if (!context) {
    throw new Error(
      "useInboundPacking must be used within a InboundPackingProvider"
    );
  }
  return context;
};
