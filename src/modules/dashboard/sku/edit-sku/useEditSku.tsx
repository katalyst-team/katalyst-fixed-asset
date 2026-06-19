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

interface EditSkuContextType {
  sku: SkuItemType | null;
  isLoading: boolean;
  skuId: string;
}

const EditSkuContext = createContext<EditSkuContextType | undefined>(
  undefined
);

interface EditSkuProviderProps {
  children: ReactNode;
  skuId: string;
}

export const EditSkuProvider: React.FC<EditSkuProviderProps> = ({
  children,
  skuId,
}) => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  // Fetch SKU data using sku_ids filter (no store filter needed for specific ID lookup)
  const { data: skuData, isLoading } = useGetSkuDataQuery({
    enabled: Boolean(skuId && organizationId),
    filters: {
      sku_ids: [skuId],
    },
    organizationId,
  });

  // Extract SKU from response
  const sku = useMemo(() => {
    if (skuData?.data) {
      const skus = skuData.data.skus || [];
      if (skus.length > 0) {
        return skus[0];
      }
    }
    return null;
  }, [skuData]);

  const value: EditSkuContextType = {
    isLoading,
    sku,
    skuId,
  };

  return (
    <EditSkuContext.Provider value={value}>
      {children}
    </EditSkuContext.Provider>
  );
};

export const useEditSku = (): EditSkuContextType => {
  const context = useContext(EditSkuContext);
  if (!context) {
    throw new Error("useEditSku must be used within an EditSkuProvider");
  }
  return context;
};
