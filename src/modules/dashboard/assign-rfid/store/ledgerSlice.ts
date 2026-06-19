import { v4 as uuidv4 } from "uuid";

import { ItemType } from "@/types/ledger";
import { PackingCollectionItemType } from "@/types/packing-collection";
import { RfidCategory, RfidType } from "@/types/rfid";

export interface LedgerItem {
  sku_id: string;
  quantity: number;
}

export interface MultiLedger {
  id: string;
  rfidType: RfidType;
  rfidCategory: RfidCategory;
  selectedRfidIds: string[];
  selectedEpcs: string[];
  itemType: ItemType;
  itemSelectionType: "sku" | "product";
  items: LedgerItem[];
  packingCollectionDescription: string;
  packingCollectionName: string;
  saveAsPackingCollection: boolean;
  selectedPackingCollection: PackingCollectionItemType | null;
  selectionMode: "manual" | "packing";
  unit: number;
}

export interface LedgerSlice {
  ledgers: MultiLedger[];

  // Actions
  setLedgers: (ledgers: MultiLedger[]) => void;
  updateLedger: (index: number, updates: Partial<MultiLedger>) => void;
  addLedger: () => void;
  removeLedger: (index: number) => void;
  resetLedgers: () => void;
}

const createInitialLedger = (): MultiLedger => ({
  id: uuidv4(),
  itemSelectionType: "sku",
  itemType: ItemType.SINGLE,
  items: [{ quantity: 1, sku_id: "" }],
  packingCollectionDescription: "",
  packingCollectionName: "",
  rfidCategory: RfidCategory.SINGLE,
  rfidType: RfidType.DISPOSABLE,
  saveAsPackingCollection: false,
  selectedEpcs: [],
  selectedPackingCollection: null,
  selectedRfidIds: [],
  selectionMode: "manual",
  unit: 1,
});

export const createLedgerSlice = (
  set: (
    partial:
      | Partial<LedgerSlice>
      | ((state: LedgerSlice) => Partial<LedgerSlice>)
  ) => void
): LedgerSlice => ({
  
  addLedger: () =>
    set((state: LedgerSlice) => ({
      ledgers: [...state.ledgers, createInitialLedger()],
    })),

  
  // Initial state
ledgers: [createInitialLedger()],

  
removeLedger: (index) =>
    set((state: LedgerSlice) => ({
      ledgers:
        state.ledgers.length > 1
          ? state.ledgers.filter((_: MultiLedger, i: number) => i !== index)
          : state.ledgers,
    })),

  
resetLedgers: () => set({ ledgers: [createInitialLedger()] }),

  // Actions
setLedgers: (ledgers) => set({ ledgers }),

  updateLedger: (index, updates) =>
    set((state: LedgerSlice) => ({
      ledgers: state.ledgers.map((ledger: MultiLedger, i: number) =>
        i === index ? { ...ledger, ...updates } : ledger
      ),
    })),
});
