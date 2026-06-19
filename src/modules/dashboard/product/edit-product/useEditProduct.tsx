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

interface EditProductContextType {
  product: SkuItemType | null;
  isLoading: boolean;
  productId: string;
}

const EditProductContext = createContext<EditProductContextType | undefined>(
  undefined
);

interface EditProductProviderProps {
  children: ReactNode;
  productId: string;
}

export const EditProductProvider: React.FC<EditProductProviderProps> = ({
  children,
  productId,
}) => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  // Fetch Product data using sku_ids filter (no store filter needed for specific ID lookup)
  const { data: skuData, isLoading } = useGetSkuDataQuery({
    enabled: Boolean(productId && organizationId),
    filters: {
      sku_ids: [productId],
    },
    organizationId,
  });

  // Extract product from response
  const product = useMemo(() => {
    if (skuData?.data) {
      const skus = skuData.data.skus || [];
      if (skus.length > 0) {
        return skus[0];
      }
    }
    return null;
  }, [skuData]);

  const value: EditProductContextType = {
    isLoading,
    product,
    productId,
  };

  return (
    <EditProductContext.Provider value={value}>
      {children}
    </EditProductContext.Provider>
  );
};

export const useEditProduct = (): EditProductContextType => {
  const context = useContext(EditProductContext);
  if (!context) {
    throw new Error(
      "useEditProduct must be used within an EditProductProvider"
    );
  }
  return context;
};
