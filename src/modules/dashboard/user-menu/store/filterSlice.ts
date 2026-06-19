import { EmployeeFilterOptions } from "@/types/employee";

export interface FilterSlice {
  filters: EmployeeFilterOptions;
  setFilters: (
    filters:
      | EmployeeFilterOptions
      | ((prev: EmployeeFilterOptions) => EmployeeFilterOptions)
  ) => void;
}

export const createFilterSlice = (
  set: (partial: Partial<FilterSlice>) => void,
  get: () => FilterSlice
): FilterSlice => ({
  filters: {},
  setFilters: (filters) =>
    set({
      filters: typeof filters === "function" ? filters(get().filters) : filters,
    }),
});
