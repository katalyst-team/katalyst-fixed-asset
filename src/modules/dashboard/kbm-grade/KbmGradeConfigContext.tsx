import type { ReactNode } from "react";
import { createContext, useContext } from "react";

export type KbmGradeType =
  | "SUSUN"
  | "BATANG"
  | "DEPARTMENT"
  | "BARANG"
  | "GUDANG"
  | "MESIN"
  | "MITRA_BISNIS"
  | "LAMINA"
  | "SUPPLIER"
  | "SHIFT";

export interface KbmGradeConfig {
  basePath: string;
  gradeType: KbmGradeType;
  translationNamespace: string;
  title: string;
}

const KbmGradeConfigContext = createContext<KbmGradeConfig | undefined>(
  undefined
);

interface KbmGradeConfigProviderProps {
  children: ReactNode;
  value: KbmGradeConfig;
}

export const KbmGradeConfigProvider = ({
  children,
  value,
}: KbmGradeConfigProviderProps) => {
  return (
    <KbmGradeConfigContext.Provider value={value}>
      {children}
    </KbmGradeConfigContext.Provider>
  );
};

export const useKbmGradeConfig = (): KbmGradeConfig => {
  const context = useContext(KbmGradeConfigContext);
  if (!context) {
    throw new Error("useKbmGradeConfig must be used within a KbmGradeConfigProvider");
  }
  return context;
};
