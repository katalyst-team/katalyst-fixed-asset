export interface PaginationSlice {
  currentPage: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  itemLimit: number;
  resetPagination: () => void;
  setCurrentPage: (page: number) => void;
  setItemLimit: (total: number) => void;
}

export const createPaginationSlice = (
  set: (partial: Partial<PaginationSlice>) => void,
  get: () => PaginationSlice
): PaginationSlice => ({
  currentPage: 1,
  goToNextPage: () => set({ currentPage: get().currentPage + 1 }),
  goToPrevPage: () => set({ currentPage: get().currentPage - 1 }),
  itemLimit: 10,
  resetPagination: () => set({ currentPage: 1, itemLimit: get().itemLimit }),
  setCurrentPage: (page) => set({ currentPage: Math.max(1, page) }),
  setItemLimit: (total) => set({ itemLimit: total }),
});
