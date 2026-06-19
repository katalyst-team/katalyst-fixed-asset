"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { useUser } from "@/context/user-context";
import useGetCategoryDataQuery from "@/hooks/api/category/useGetCategoryDataQuery";
import { CategoryFilterOptions, CategoryItemType } from "@/types/category";

const DEFAULT_LIMIT = 20;

interface KbmKayuLaminaListContextType {
  categoryData: CategoryItemType[];
  currentPage: number;
  filters: CategoryFilterOptions;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isLoading: boolean;
  limit: number;
  organizationId: string;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  setFilters: (filters: CategoryFilterOptions) => void;
  setLimit: (limit: number) => void;
}

const KbmKayuLaminaListContext = createContext<KbmKayuLaminaListContextType | undefined>(undefined);

export const KbmKayuLaminaListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";

  const [filters, setFiltersState] = useState<CategoryFilterOptions>({});
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useGetCategoryDataQuery({
    cursor: currentCursor,
    filters,
    limit,
    organizationId,
    query: "LAMINA",
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

  const setFilters = useCallback((f: CategoryFilterOptions) => {
    setFiltersState(f);
    setCurrentCursor(undefined);
    setCursorStack([]);
    setCurrentPage(1);
  }, []);

  return (
    <KbmKayuLaminaListContext.Provider
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
        setFilters,
        setLimit,
      }}
    >
      {children}
    </KbmKayuLaminaListContext.Provider>
  );
};

export const useKbmKayuLaminaList = (): KbmKayuLaminaListContextType => {
  const context = useContext(KbmKayuLaminaListContext);
  if (!context) throw new Error("useKbmKayuLaminaList must be used within KbmKayuLaminaListProvider");
  return context;
};
