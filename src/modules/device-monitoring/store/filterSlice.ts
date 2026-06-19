import type { DeviceStatus,DeviceType } from '@/types/device-monitoring';

interface FilterState {
  deviceType?: DeviceType;
  status?: DeviceStatus;
  search?: string;
  cursor?: string | null;
  limit?: number;
}

export interface FilterSlice {
  filters: FilterState;
  setFilters: (
    filters: FilterState | ((prev: FilterState) => FilterState),
  ) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void,
  get: () => FilterSlice,
): FilterSlice => ({
  filters: {},
  setFilters: (filters) =>
    set({
      filters: typeof filters === 'function' ? filters(get().filters) : filters,
    }),
});