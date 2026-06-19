"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import useGetDetailSkuDataQuery from "@/hooks/api/sku/useGetDetailSKUDataQuery";
import { DetailSkuFilterOptions, DetailSkuItemType } from "@/types/detailSku";

interface DetailSkuContextType {
  detailSkuData: DetailSkuItemType[];
  filters: DetailSkuFilterOptions;
  setFilters: (filters: DetailSkuFilterOptions) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  listImages: string[];
}

const DetailSkuContext = createContext<DetailSkuContextType | undefined>(
  undefined
);

interface DetailSkuProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

export const DetailSkuProvider: React.FC<DetailSkuProviderProps> = ({
  children,
  itemsPerPage = 5,
}) => {
  const [filters, setFilters] = useState<DetailSkuFilterOptions>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);

  const { data, isLoading, isSuccess } = useGetDetailSkuDataQuery({ filters });
  const [detailSkuData, setDetailSkuData] = useState<DetailSkuItemType[]>([]);
  const [listImages] = useState<string[]>([
    "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  ]);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    if (isSuccess && data) {
      setTotalItems(data.length);
      const startIndex = (currentPage - 1) * localItemsPerPage;
      const endIndex = startIndex + localItemsPerPage;
      const paginatedData = data.slice(startIndex, endIndex);
      setDetailSkuData(paginatedData);
    }
  }, [data, currentPage, localItemsPerPage, isSuccess]);

  const value: DetailSkuContextType = {
    currentPage,
    detailSkuData,
    filters,
    isLoading,
    itemsPerPage: localItemsPerPage,
    listImages,
    setCurrentPage,
    setFilters,
    totalItems,
  };

  return (
    <DetailSkuContext.Provider value={value}>
      {children}
    </DetailSkuContext.Provider>
  );
};

export const useDetailSku = (): DetailSkuContextType => {
  const context = useContext(DetailSkuContext);
  if (!context) {
    throw new Error("useDetailSku must be used within a DetailSkuProvider");
  }
  return context;
};
