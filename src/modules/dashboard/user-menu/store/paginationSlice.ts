export interface PaginationSlice {
  currentCursor: string | undefined;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  itemLimit: number;
  nextCursor: string | null;
  prevCursor: string | null;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  resetPagination: () => void;
  setCurrentCursor: (cursor: string | undefined) => void;
  setCurrentPage: (page: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  setHasPrevPage: (hasPrev: boolean) => void;
  setItemLimit: (total: number) => void;
  setNextCursor: (cursor: string | null) => void;
  setPrevCursor: (cursor: string | null) => void;
}

export const createPaginationSlice = (
  set: (partial: Partial<PaginationSlice>) => void,
  get: () => PaginationSlice
): PaginationSlice => ({
  currentCursor: undefined,
  currentPage: 1,
  goToNextPage: () => {
    const { currentPage, hasNextPage, nextCursor } = get();
    if (!hasNextPage || !nextCursor) return;
    set({ currentCursor: nextCursor, currentPage: currentPage + 1 });
  },
  goToPrevPage: () => {
    const { currentPage, hasPrevPage, prevCursor } = get();
    if (!hasPrevPage) return;
    set({
      currentCursor: prevCursor ?? undefined,
      currentPage: Math.max(1, currentPage - 1),
    });
  },
  hasNextPage: false,
  hasPrevPage: false,
  itemLimit: 10,
  nextCursor: null,
  prevCursor: null,
  resetPagination: () => {
    set({
      currentCursor: undefined,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      itemLimit: get().itemLimit,
      nextCursor: null,
      prevCursor: null,
    });
  },
  setCurrentCursor: (cursor) => set({ currentCursor: cursor }),
  setCurrentPage: (page) => set({ currentPage: Math.max(1, page) }),
  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
  setHasPrevPage: (hasPrev) => set({ hasPrevPage: hasPrev }),
  setItemLimit: (total) => set({ itemLimit: total }),
  setNextCursor: (cursor) => set({ nextCursor: cursor }),
  setPrevCursor: (cursor) => set({ prevCursor: cursor }),
});
