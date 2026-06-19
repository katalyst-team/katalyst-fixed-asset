"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { useUser } from "@/context/user-context";
import useGetStoreAreaDataQuery from "@/hooks/api/store/useGetStoreAreaDataQuery";
import { StoreAreaFilterOptions, StoreAreaItemType } from "@/types/store";

interface StoreAreaContextType {
  storeAreaData: StoreAreaItemType[];
  filters: StoreAreaFilterOptions;
  setFilters: (filters: StoreAreaFilterOptions) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  storeId: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const StoreAreaContext = createContext<StoreAreaContextType | undefined>(
  undefined
);

interface StoreAreaProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
  storeId: string;
}

export const StoreAreaProvider: React.FC<StoreAreaProviderProps> = ({
  children,
  itemsPerPage = 10,
  storeId,
}) => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";
  const [filters, setFilters] = useState<StoreAreaFilterOptions>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);
  const [storeAreaData, setStoreAreaData] = useState<StoreAreaItemType[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  const { data, isLoading } = useGetStoreAreaDataQuery({
    organizationId,
    storeId,
  });

  useEffect(() => {
    if (data?.data?.sections) {
      setTotalItems(data.data.sections.length);
      const startIndex = (currentPage - 1) * localItemsPerPage;
      const endIndex = startIndex + localItemsPerPage;
      const paginatedData = data.data.sections.slice(startIndex, endIndex);
      setStoreAreaData(paginatedData);
    }
  }, [data, currentPage, localItemsPerPage]);

  const totalPages = Math.ceil(totalItems / localItemsPerPage);

  const value: StoreAreaContextType = {
    currentPage,
    filters,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    isLoading,
    itemsPerPage: localItemsPerPage,
    onNextPage: () => setCurrentPage(Math.min(currentPage + 1, totalPages)),
    onPrevPage: () => setCurrentPage(Math.max(currentPage - 1, 1)),
    setCurrentPage,
    setFilters,
    storeAreaData,
    storeId,
    totalItems,
  };

  return (
    <StoreAreaContext.Provider value={value}>
      {children}
    </StoreAreaContext.Provider>
  );
};

export const useStoreArea = (): StoreAreaContextType => {
  const context = useContext(StoreAreaContext);
  if (!context) {
    throw new Error("useStoreArea must be used within a StoreAreaProvider");
  }
  return context;
};
