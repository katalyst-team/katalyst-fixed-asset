import {
  AuditHistoryItem,
  SectionMetrics,
} from "@/types/stock-audit-area";

export interface DataSlice {
  auditHistoryData: AuditHistoryItem[];
  sectionMetrics: SectionMetrics | null;

  // Actions
  setAuditHistoryData: (data: AuditHistoryItem[]) => void;
  setSectionMetrics: (metrics: SectionMetrics | null) => void;
}

export const createDataSlice = (
  set: (partial: Partial<DataSlice>) => void
): DataSlice => ({
  // Initial state
  auditHistoryData: [],
  sectionMetrics: null,

  // Actions
  setAuditHistoryData: (data) => set({ auditHistoryData: data }),
  setSectionMetrics: (metrics) => set({ sectionMetrics: metrics }),
});
