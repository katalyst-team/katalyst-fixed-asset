export interface PaginationSlice {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalItems: number;
  totalPages: number;

  // Actions
  goToNextPage: () => void;
  goToPrevPage: () => void;
  resetPagination: () => void;
  setCurrentPage: (page: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  setHasPrevPage: (hasPrev: boolean) => void;
  setTotalItems: (total: number) => void;
  setTotalPages: (total: number) => void;
}

export const createPaginationSlice = (
  set: (partial: Partial<PaginationSlice>) => void,
  get: () => PaginationSlice
): PaginationSlice => ({
  currentPage: 1,
  goToNextPage: () => {
    const { hasNextPage, currentPage } = get();
    if (hasNextPage) {
      set({ currentPage: currentPage + 1 });
    }
  },
  goToPrevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },
  hasNextPage: false,
  hasPrevPage: false,
  resetPagination: () => {
    set({
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      totalItems: 0,
      totalPages: 1,
    });
  },
  setCurrentPage: (page) => set({ currentPage: page }),
  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
  setHasPrevPage: (hasPrev) => set({ hasPrevPage: hasPrev }),
  setTotalItems: (total) => set({ totalItems: total }),
  setTotalPages: (total) => set({ totalPages: total }),
  totalItems: 0,
  totalPages: 1,
});
