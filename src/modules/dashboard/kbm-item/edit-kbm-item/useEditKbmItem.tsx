"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";

import { useUser } from "@/context/user-context";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import { SkuItemType } from "@/types/sku";

interface EditKbmItemContextType {
  isError: boolean;
  isLoading: boolean;
  itemData: SkuItemType | null;
  itemId: string;
}

const EditKbmItemContext = createContext<EditKbmItemContextType | undefined>(
  undefined
);

interface EditKbmItemProviderProps {
  children: ReactNode;
  itemId: string;
}

export const EditKbmItemProvider: React.FC<EditKbmItemProviderProps> = ({
  children,
  itemId,
}) => {
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { data: itemData, isError, isLoading } = useGetSkuDataQuery({
    enabled: Boolean(itemId && organizationId),
    filters: {
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      sku_ids: [itemId],
    },
    organizationId,
  });

  const item = useMemo(() => {
    const skus = itemData?.data?.skus ?? [];
    return skus.length > 0 ? skus[0] : null;
  }, [itemData]);

  return (
    <EditKbmItemContext.Provider value={{ isError, isLoading, itemData: item, itemId }}>
      {children}
    </EditKbmItemContext.Provider>
  );
};

export const useEditKbmItem = (): EditKbmItemContextType => {
  const context = useContext(EditKbmItemContext);
  if (!context) {
    throw new Error("useEditKbmItem must be used within an EditKbmItemProvider");
  }
  return context;
};
