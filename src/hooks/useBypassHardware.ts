import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BypassHardwareState {
  // State
  isBypassEnabled: boolean;

  // Actions
  setBypassEnabled: (enabled: boolean) => void;
  toggleBypass: () => void;
}

export const useBypassHardware = create<BypassHardwareState>()(
  persist(
    (set) => ({
      // Initial state - bypass is disabled by default
      isBypassEnabled: false,

      // Actions
      setBypassEnabled: (enabled: boolean) => set({ isBypassEnabled: enabled }),
      toggleBypass: () =>
        set((state) => ({ isBypassEnabled: !state.isBypassEnabled })),
    }),
    {
      name: "bypass-hardware-storage", // localStorage key
    }
  )
);
