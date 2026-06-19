export interface PaginationSlice {
  currentPage: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  itemLimit: number;
  nextCursor: string | null;
  prevCursor: string | null;
  resetPagination: () => void;
  setCurrentPage: (page: number) => void;
  setItemLimit: (limit: number) => void;
  setNextCursor: (cursor: string | null) => void;
  setPrevCursor: (cursor: string | null) => void;
}

export const createPaginationSlice = (
  set: (partial: Partial<PaginationSlice>) => void,
  get: () => PaginationSlice
): PaginationSlice => ({
  // Initial state
  currentPage: 1,
  goToNextPage: () => {
    const { currentPage } = get();
    set({ currentPage: currentPage + 1 });
  },
  goToPrevPage: () => {
    const { currentPage } = get();
    set({ currentPage: currentPage - 1 });
  },
  itemLimit: 10,
  nextCursor: null,
  prevCursor: null,
  resetPagination: () => {
    set({
      currentPage: 1,
      nextCursor: null,
      prevCursor: null,
    });
  },
  setCurrentPage: (page) => set({ currentPage: Math.max(1, page) }),
  setItemLimit: (itemLimit) => set({ itemLimit }),
  setNextCursor: (nextCursor) => set({ nextCursor }),
  setPrevCursor: (prevCursor) => set({ prevCursor }),
});
