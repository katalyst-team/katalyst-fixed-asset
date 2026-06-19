import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createLedgerSlice, LedgerSlice } from "./ledgerSlice";
import { createProcessingSlice, ProcessingSlice } from "./processingSlice";

type AssignRfidStore = LedgerSlice & ProcessingSlice;

export const useAssignRfidStore = create<AssignRfidStore>()(
  devtools(
    (set) => ({
      ...createLedgerSlice(set),
      ...createProcessingSlice(set),
    }),
    { name: "assign-rfid-store" }
  )
);
