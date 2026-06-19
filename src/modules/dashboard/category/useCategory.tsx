"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { CategoryFilterOptions, CategoryItemType } from "@/types/category";

interface CategoryContextType {
  categoryData: CategoryItemType[];
  filters: CategoryFilterOptions;
  setFilters: (filters: CategoryFilterOptions) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

interface CategoryProviderV2Props {
  children: ReactNode;
  itemsPerPage?: number;
}

export const CategoryProviderV2: React.FC<CategoryProviderV2Props> = ({
  children,
  itemsPerPage = 10,
}) => {
  const [filters, setFilters] = useState<CategoryFilterOptions>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);
  const { tokenPayload } = useUser();
  const { data, isLoading, isSuccess } = useGetCategoryDataQuery({
    filters,
    organizationId: tokenPayload?.organization_id || "",
  });
  const [categoryData, setCategoryData] = useState<CategoryItemType[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    if (isSuccess && data) {
      const categoryItems = data.data.categories || [];
      setTotalItems(categoryItems.length);
      const startIndex = (currentPage - 1) * localItemsPerPage;
      const endIndex = startIndex + localItemsPerPage;
      const paginatedData = categoryItems.slice(startIndex, endIndex);
      setCategoryData(paginatedData);
    }
  }, [data, currentPage, localItemsPerPage, isSuccess]);

  const value: CategoryContextType = {
    categoryData,
    currentPage,
    filters,
    isLoading,
    itemsPerPage: localItemsPerPage,
    setCurrentPage,
    setFilters,
    totalItems,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
};
