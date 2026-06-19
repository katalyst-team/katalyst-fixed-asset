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

interface DetailProductContextType {
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

const DetailProductContext = createContext<DetailProductContextType | undefined>(
  undefined
);

interface DetailProductProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

export const DetailProductProvider: React.FC<DetailProductProviderProps> = ({
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

  const value: DetailProductContextType = {
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
    <DetailProductContext.Provider value={value}>
      {children}
    </DetailProductContext.Provider>
  );
};

export const useDetailProduct = (): DetailProductContextType => {
  const context = useContext(DetailProductContext);
  if (!context) {
    throw new Error("useDetailProduct must be used within a DetailProductProvider");
  }
  return context;
};
