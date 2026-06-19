import type { FilterSlice } from './filterSlice';

type StoreState = PaginationSlice & FilterSlice;

export interface PaginationSlice {
  currentPage: number;
  cursorHistory: string[];
  itemLimit: number;
  goToNextPage: (nextCursor: string) => void;
  goToPrevPage: () => void;
  resetPagination: () => void;
  setItemLimit: (limit: number) => void;
}

export const createPaginationSlice = (
  set: (partial: Partial<StoreState>) => void,
  get: () => StoreState,
): PaginationSlice => ({
  currentPage: 1,
  cursorHistory: [],
  goToNextPage: (nextCursor: string) => {
    const state = get();
    const currentCursor = state.filters.cursor;
    set({
      currentPage: state.currentPage + 1,
      cursorHistory: currentCursor
        ? [...state.cursorHistory, currentCursor]
        : state.cursorHistory,
    });
    state.setFilters((prev) => ({ ...prev, cursor: nextCursor }));
  },
  goToPrevPage: () => {
    const state = get();
    const prevCursor =
      state.cursorHistory[state.cursorHistory.length - 1] ?? undefined;
    set({
      currentPage: Math.max(1, state.currentPage - 1),
      cursorHistory: state.cursorHistory.slice(0, -1),
    });
    state.setFilters((prev) => ({ ...prev, cursor: prevCursor }));
  },
  itemLimit: 10,
  resetPagination: () => {
    set({ currentPage: 1, cursorHistory: [] });
    get().setFilters((prev) => ({ ...prev, cursor: undefined }));
  },
  setItemLimit: (limit) => set({ itemLimit: limit }),
});
