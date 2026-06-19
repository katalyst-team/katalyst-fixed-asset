import { createContext, useContext, useMemo, useState } from "react";

import type { FaModalContextValue, FaModalPayload, FaModalType } from "./types";

const FaModalContext = createContext<FaModalContextValue | null>(null);

export function FaModalProvider({ children }: { children: React.ReactNode }) {
  const [type, setType] = useState<FaModalType>(null);
  const [payload, setPayload] = useState<FaModalPayload>({});

  const value = useMemo<FaModalContextValue>(
    () => ({
      closeModal: () => {
        setType(null);
        setPayload({});
      },
      openModal: (nextType: FaModalType, nextPayload: FaModalPayload = {}) => {
        setPayload(nextPayload);
        setType(nextType);
      },
      payload,
      type,
    }),
    [type, payload],
  );

  return (
    <FaModalContext.Provider value={value}>{children}</FaModalContext.Provider>
  );
}

export function useFaModal(): FaModalContextValue {
  const ctx = useContext(FaModalContext);
  if (!ctx) {
    throw new Error("useFaModal must be used within FaModalProvider");
  }
  return ctx;
}
