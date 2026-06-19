export interface PaginationSlice {
  currentCursor: string | undefined;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
  totalItems: number;

  // Actions
  goToNextPage: () => void;
  goToPrevPage: (prevCursor?: string) => void;
  resetPagination: () => void;
  setCurrentCursor: (cursor: string | undefined) => void;
  setCurrentPage: (page: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  setHasPrevPage: (hasPrev: boolean) => void;
  setNextCursor: (cursor: string | null) => void;
  setPrevCursor: (cursor: string | null) => void;
  setTotalItems: (total: number) => void;
}

export const createPaginationSlice = (
  set: (partial: Partial<PaginationSlice>) => void,
  get: () => PaginationSlice
): PaginationSlice => ({
  // Initial state
  currentCursor: undefined,
  currentPage: 1,
  goToNextPage: () => {
    const { hasNextPage, nextCursor, currentPage } = get();
    if (hasNextPage && nextCursor) {
      set({
        currentCursor: nextCursor,
        currentPage: currentPage + 1,
      });
    }
  },
  goToPrevPage: (prevCursor) => {
    const { currentPage } = get();
    if (prevCursor) {
      set({
        currentCursor: prevCursor,
        currentPage: Math.max(1, currentPage - 1),
      });
    } else if (currentPage > 1) {
      // Go to first page if no prev_cursor but not on first page
      set({
        currentCursor: undefined,
        currentPage: 1,
      });
    }
  },
  hasNextPage: false,
  hasPrevPage: false,
  nextCursor: null,
  prevCursor: null,
  resetPagination: () => {
    set({
      currentCursor: undefined,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      nextCursor: null,
      prevCursor: null,
      totalItems: 0,
    });
  },
  setCurrentCursor: (cursor) => set({ currentCursor: cursor }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
  setHasPrevPage: (hasPrev) => set({ hasPrevPage: hasPrev }),
  setNextCursor: (cursor) => set({ nextCursor: cursor }),
  setPrevCursor: (cursor) => set({ prevCursor: cursor }),
  setTotalItems: (total) => set({ totalItems: total }),
  totalItems: 0,
});
