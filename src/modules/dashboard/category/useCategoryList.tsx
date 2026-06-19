"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { CategoryFilterOptions, CategoryItemType } from "@/types/category";

const DEFAULT_LIMIT = 20;

interface CategoryListContextType {
  categoryData: CategoryItemType[];
  currentPage: number;
  filters: CategoryFilterOptions;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isLoading: boolean;
  limit: number;
  organizationId: string;
  searchQuery: string;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  setFilters: (filters: CategoryFilterOptions) => void;
  setLimit: (limit: number) => void;
  setSearchQuery: (q: string) => void;
}

const CategoryListContext = createContext<CategoryListContextType | undefined>(undefined);

export const CategoryListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";

  const [filters, setFiltersState] = useState<CategoryFilterOptions>({});
  const [searchQuery, setSearchQueryState] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [cursorStack, setCursorStack] = useState<string[]>([]); // stack of prev cursors
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useGetCategoryDataQuery({
    cursor: currentCursor,
    filters,
    limit,
    organizationId,
    query: searchQuery || undefined,
  });

  const [categoryData, setCategoryData] = useState<CategoryItemType[]>([]);

  useEffect(() => {
    if (data) {
      setCategoryData(data.data.categories || []);
    }
  }, [data]);

  const nextCursor = data?.pagination?.next_cursor || null;
  const hasNextPage = Boolean(nextCursor);
  const hasPrevPage = cursorStack.length > 0;

  const goToNextPage = useCallback(() => {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, currentCursor ?? ""]);
    setCurrentCursor(nextCursor);
    setCurrentPage((p) => p + 1);
  }, [currentCursor, nextCursor]);

  const goToPrevPage = useCallback(() => {
    if (cursorStack.length === 0) return;
    const stack = [...cursorStack];
    const prevC = stack.pop();
    setCursorStack(stack);
    setCurrentCursor(prevC === "" ? undefined : prevC);
    setCurrentPage((p) => Math.max(1, p - 1));
  }, [cursorStack]);

  // Reset pagination when filters or search changes
  const setFilters = useCallback((f: CategoryFilterOptions) => {
    setFiltersState(f);
    setCurrentCursor(undefined);
    setCursorStack([]);
    setCurrentPage(1);
  }, []);

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q);
    setCurrentCursor(undefined);
    setCursorStack([]);
    setCurrentPage(1);
  }, []);

  return (
    <CategoryListContext.Provider
      value={{
        categoryData,
        currentPage,
        filters,
        goToNextPage,
        goToPrevPage,
        hasNextPage,
        hasPrevPage,
        isLoading,
        limit,
        organizationId,
        searchQuery,
        setFilters,
        setLimit,
        setSearchQuery,
      }}
    >
      {children}
    </CategoryListContext.Provider>
  );
};

export const useCategoryList = (): CategoryListContextType => {
  const context = useContext(CategoryListContext);
  if (!context) throw new Error("useCategoryList must be used within CategoryListProvider");
  return context;
};
