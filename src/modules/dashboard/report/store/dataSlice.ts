import { ReportItem } from "@/types/report";

export interface DataSlice {
  localItemsPerPage: number;
  reportData: ReportItem[];
  storeInfo: {
    id: string;
    name: string;
    address: string;
  } | null;
  dateRange: {
    start_date: string;
    end_date: string;
  } | null;

  // Actions
  setLocalItemsPerPage: (itemsPerPage: number) => void;
  setReportData: (data: ReportItem[]) => void;
  setStoreInfo: (
    storeInfo: {
      id: string;
      name: string;
      address: string;
    } | null
  ) => void;
  setDateRange: (
    dateRange: {
      start_date: string;
      end_date: string;
    } | null
  ) => void;
}

export const createDataSlice = (
  set: (partial: Partial<DataSlice>) => void
): DataSlice => ({
  // Initial state
  dateRange: null,
  localItemsPerPage: 20,
  reportData: [],
  setDateRange: (dateRange) => set({ dateRange }),

  // Actions
  setLocalItemsPerPage: (itemsPerPage) =>
    set({ localItemsPerPage: itemsPerPage }),
  setReportData: (data) => set({ reportData: data }),
  setStoreInfo: (storeInfo) => set({ storeInfo }),
  storeInfo: null,
});
