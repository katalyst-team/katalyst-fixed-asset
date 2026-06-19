import { GateLog } from "@/types/gate-log";

export interface DataSlice {
  gateLogData: GateLog[];
  localItemsPerPage: number;

  // Actions
  setGateLogData: (data: GateLog[]) => void;
  setLocalItemsPerPage: (itemsPerPage: number) => void;
}

export const createDataSlice = (
  set: (partial: Partial<DataSlice>) => void
): DataSlice => ({
  // Initial state
  gateLogData: [],
  localItemsPerPage: 20,

  // Actions
  setGateLogData: (data) => set({ gateLogData: data }),
  setLocalItemsPerPage: (itemsPerPage) => set({ localItemsPerPage: itemsPerPage }),
});
