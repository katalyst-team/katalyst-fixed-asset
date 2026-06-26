export interface PaginationSlice {
  currentPage: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  itemLimit: number;
  totalPages: number;
  resetPagination: () => void;
  setCurrentPage: (page: number) => void;
  setItemLimit: (limit: number) => void;
  setTotalPages: (total: number) => void;
}

export const createPaginationSlice = (
  set: (partial: Partial<PaginationSlice>) => void,
  get: () => PaginationSlice
): PaginationSlice => ({
  currentPage: 1,
  goToNextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) {
      set({ currentPage: currentPage + 1 });
    }
  },
  goToPrevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },
  itemLimit: 10,
  resetPagination: () => {
    set({
      currentPage: 1,
      totalPages: 1,
    });
  },
  setCurrentPage: (page) => set({ currentPage: Math.max(1, page) }),
  setItemLimit: (itemLimit) => set({ itemLimit }),
  setTotalPages: (total) => set({ totalPages: total }),
  totalPages: 1,
});
