export interface PaginationSlice {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  itemCount: number;
  nextCursor?: string;
  prevCursor?: string;
  totalCount?: number;
  resetPagination: () => void;
  setCurrentPage: (page: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  setHasPrevPage: (hasPrev: boolean) => void;
  setItemCount: (count: number) => void;
  setNextCursor: (cursor?: string) => void;
  setPrevCursor: (cursor?: string) => void;
  setTotalCount: (count?: number) => void;
}

export const createPaginationSlice = (
  set: (partial: Partial<PaginationSlice>) => void
): PaginationSlice => ({
  currentPage: 1,
  hasNextPage: false,
  hasPrevPage: false,
  itemCount: 0,
  nextCursor: undefined,
  prevCursor: undefined,
  resetPagination: () => {
    set({
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      itemCount: 0,
      nextCursor: undefined,
      prevCursor: undefined,
    });
  },
  setCurrentPage: (currentPage) => set({ currentPage }),
  setHasNextPage: (hasNextPage) => set({ hasNextPage }),
  setHasPrevPage: (hasPrevPage) => set({ hasPrevPage }),
  setItemCount: (itemCount) => set({ itemCount }),
  setNextCursor: (nextCursor) => set({ nextCursor }),
  setPrevCursor: (prevCursor) => set({ prevCursor }),
  setTotalCount: (totalCount) => set({ totalCount }),
  totalCount: undefined,
});
