"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";

import { useUser } from "@/context/user-context";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import { SkuItemType } from "@/types/sku";

interface EditKbmGradeContextType {
  gradeData: SkuItemType | null;
  gradeId: string;
  isError: boolean;
  isLoading: boolean;
}

const EditKbmGradeContext = createContext<EditKbmGradeContextType | undefined>(
  undefined
);

interface EditKbmGradeProviderProps {
  children: ReactNode;
  gradeId: string;
}

export const EditKbmGradeProvider: React.FC<EditKbmGradeProviderProps> = ({
  children,
  gradeId,
}) => {
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  // Fetch grade data using sku_ids filter (since grades are stored as SKUs)
  const { data: gradeData, isError, isLoading } = useGetSkuDataQuery({
    enabled: Boolean(gradeId && organizationId),
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      sku_ids: [gradeId],
    },
    organizationId,
  });

  // Extract grade from response
  const grade = useMemo(() => {
    if (gradeData?.data) {
      const skus = gradeData.data.skus || [];
      if (skus.length > 0) {
        return skus[0];
      }
    }
    return null;
  }, [gradeData]);

  const value: EditKbmGradeContextType = {
    gradeData: grade,
    gradeId,
    isError,
    isLoading,
  };

  return (
    <EditKbmGradeContext.Provider value={value}>
      {children}
    </EditKbmGradeContext.Provider>
  );
};

export const useEditKbmGrade = (): EditKbmGradeContextType => {
  const context = useContext(EditKbmGradeContext);
  if (!context) {
    throw new Error("useEditKbmGrade must be used within an EditKbmGradeProvider");
  }
  return context;
};
