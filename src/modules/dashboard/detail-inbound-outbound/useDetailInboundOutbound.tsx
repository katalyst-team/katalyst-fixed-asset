"use client";

import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { useUser } from "@/context/user-context";
import useGetStockMovementDetailQuery from "@/hooks/api/stockMovement/useGetStockMovementDetailQuery";
import {
    DetailStockMovementData,
    NewItemStatusHistory,
} from "@/types/detailStockMovement";
import { RfidCategory } from "@/types/rfid";
import { SkuType } from "@/types/sku";
import {
    StockMovementEpcItemType,
    StockMovementProductItemType,
} from "@/types/stockMovementDetail";
import { formatDateTime } from "@/utils/text";

interface DetailInboundOutboundContextType {
  productData: StockMovementProductItemType[];
  allProductData: StockMovementProductItemType[]; // All products for export (unpaginated)
  epcDataBySku: Record<
    string,
    {
      skuName: string;
      epcItems: StockMovementEpcItemType[];
      currentPage: number;
      totalItems: number;
      itemsPerPage: number;
      category: RfidCategory;
    }
  >;
  allEpcDataBySku: Record<string, StockMovementEpcItemType[]>; // All EPCs for export (unpaginated)
  isLoading: boolean;
  note: string;
  imageUrls: string[];
  productCurrentPage: number;
  productItemsPerPage: number;
  productTotalItems: number;
  packageQuantity: number;
  setProductCurrentPage: (page: number) => void;
  setEpcCurrentPage: (skuId: string, page: number) => void;
  stockMovementDetail: DetailStockMovementData | undefined;
}

const DetailInboundOutboundContext = createContext<
  DetailInboundOutboundContextType | undefined
>(undefined);

interface DetailInboundOutboundProviderProps {
  children: ReactNode;
  productItemsPerPage?: number;
  epcItemsPerPage?: number;
  organizationId?: string;
  storeId?: string;
  stockMovementId?: string;
}

export const DetailInboundOutboundProvider: React.FC<
  DetailInboundOutboundProviderProps
> = ({
  children,
  productItemsPerPage = 10,
  epcItemsPerPage = 10,
  organizationId: propOrgId,
  storeId: propStoreId,
  stockMovementId: propStockMovementId,
}) => {
  const { query } = useRouter();
  const { tokenPayload, selectedTeam } = useUser();

  const orgId = propOrgId || tokenPayload?.organization_id || "";
  const storeId = propStoreId || selectedTeam || "";
  const stockMovementId = propStockMovementId || (query.ledger_id as string);

  const [productCurrentPage, setProductCurrentPage] = useState<number>(1);
  const [localProductItemsPerPage] = useState<number>(productItemsPerPage);
  const [localEpcItemsPerPage] = useState<number>(epcItemsPerPage);

  // State to track current page for each SKU
  const [epcPagination, setEpcPagination] = useState<Record<string, number>>(
    {}
  );

  // Get specific stock movement detail directly
  const { data: stockMovementDetailResponse, isLoading } =
    useGetStockMovementDetailQuery({
      enabled: Boolean(orgId) && Boolean(storeId) && Boolean(stockMovementId),
      organizationId: orgId,
      stockMovementId: stockMovementId,
      storeId: storeId,
    });

  // Extract the stock movement detail from response
  const stockMovementDetail = useMemo(() => {
    return stockMovementDetailResponse?.data;
  }, [stockMovementDetailResponse]);

  // Set EPC page for a specific SKU
  const setEpcCurrentPage = (skuId: string, page: number) => {
    setEpcPagination((prev) => ({
      ...prev,
      [skuId]: page,
    }));
  };

  // Process the data with memoization to avoid unnecessary calculations
  const processedData = useMemo(() => {
    if (!stockMovementDetail) {
      return {
        allEpcDataBySku: {},
        allProductData: [],
        epcDataBySku: {},
        imageUrls: [],
        note: "",
        productData: [],
        productTotalItems: 0,
      };
    }

    try {
      // Process new_item_status_histories to get unique SKUs
      const skuMap = new Map();
      // Track all EPCs by SKU
      const allEpcsBySku: Record<string, StockMovementEpcItemType[]> = {};

      // Handle case where new_item_status_histories might be null or undefined
      const histories = stockMovementDetail.new_item_status_histories || [];

      histories.forEach((history: NewItemStatusHistory) => {
        const sku = history.item.sku;
        const rfidDetail = history.item.rfid_detail;
        const skuId = sku.id;
        const status = history.item?.status?.name || "Unknown";

        if (!skuMap.has(skuId)) {
          skuMap.set(skuId, {
            category: sku.categories?.[0]?.name || "-",
            count: 1,
            name: sku.name,
            rfidCategory: rfidDetail?.category || RfidCategory.SINGLE,
            skuId: skuId,
            skuType: (sku.type as SkuType) || SkuType.COMMON,
            status: status,
          });
          // Initialize EPC array for this SKU
          allEpcsBySku[skuId] = [];
        } else {
          const existing = skuMap.get(skuId);
          existing.count += 1;
          skuMap.set(skuId, existing);
        }

        // Add EPC data
        allEpcsBySku[skuId].push({
          category: rfidDetail?.category
            ? rfidDetail?.category
            : RfidCategory.SINGLE,
          epc: history.item.epc,
          id: rfidDetail?.id ?? "",
          itemId: history.item.id,
          lastStatus: status,
          lastUpdate: history.changed_at
            ? formatDateTime(history.changed_at)
            : "Unknown",
          metadata: history.item.metadata ?? null,
          no: (allEpcsBySku[skuId].length + 1).toString(),
          rfidName: rfidDetail?.name,
          skuId: skuId,
          skuName: sku.name,
          storeId: history.item.store?.id || storeId,
        });
      });

      // Convert map to array of products
      const skuEntries = Array.from(skuMap.entries());

      const allProductData: StockMovementProductItemType[] = skuEntries.map(
        (entry, index) => {
          const value = entry[1];
          return {
            category: value.category,
            lastStatus: value.status,
            no: (index + 1).toString(),
            productName: value.name,
            quantity: value.count,
            skuId: value.skuId,
            skuType: value.skuType,
          };
        }
      );

      const productTotalItems = allProductData.length;

      // Apply product pagination
      const productStartIndex =
        (productCurrentPage - 1) * localProductItemsPerPage;
      const productEndIndex = productStartIndex + localProductItemsPerPage;
      const paginatedProductData = allProductData.slice(
        productStartIndex,
        productEndIndex
      );

      // Create the epcDataBySku structure with pagination info
      const epcDataWithPagination: Record<
        string,
        {
          skuName: string;
          epcItems: StockMovementEpcItemType[];
          currentPage: number;
          totalItems: number;
          itemsPerPage: number;
          category: RfidCategory;
        }
      > = {};

      // Apply pagination for each SKU's EPCs
      Object.entries(allEpcsBySku).forEach(([skuId, allEpcItems]) => {
        const skuName = skuMap.get(skuId)?.name || "Unknown";
        const skuCategory = skuMap.get(skuId)?.category;
        const currentPage = epcPagination[skuId] || 1;
        const startIndex = (currentPage - 1) * localEpcItemsPerPage;
        const endIndex = startIndex + localEpcItemsPerPage;
        const paginatedItems = allEpcItems.slice(startIndex, endIndex);

        epcDataWithPagination[skuId] = {
          category: skuCategory,
          currentPage,
          epcItems: paginatedItems,
          itemsPerPage: localEpcItemsPerPage,
          skuName,
          totalItems: allEpcItems.length,
        };
      });

      // Calculate Package Quantity
      const uniquePackageEpcs = new Set<string>();
      Object.values(allEpcsBySku).flat().forEach((item) => {
        if (item.category === RfidCategory.PACKAGE && item.epc) {
          uniquePackageEpcs.add(item.epc);
        }
      });
      const packageQuantity = uniquePackageEpcs.size;

      return {
        allEpcDataBySku: allEpcsBySku,
        allProductData: allProductData,
        epcDataBySku: epcDataWithPagination,
        imageUrls: stockMovementDetail.image_urls || [],
        note: stockMovementDetail.note || "",
        packageQuantity,
        productData: paginatedProductData,
        productTotalItems,
      };
    } catch (error) {
      console.error("Error processing stock movement detail data:", error);
      return {
        allEpcDataBySku: {},
        allProductData: [],
        epcDataBySku: {},
        imageUrls: [],
        note: "",
        packageQuantity: 0,
        productData: [],
        productTotalItems: 0,
      };
    }
  }, [
    stockMovementDetail,
    productCurrentPage,
    localProductItemsPerPage,
    localEpcItemsPerPage,
    epcPagination,
    storeId,
  ]);

  const value: DetailInboundOutboundContextType = {
    allEpcDataBySku: processedData.allEpcDataBySku,
    allProductData: processedData.allProductData,
    epcDataBySku: processedData.epcDataBySku,
    imageUrls: processedData.imageUrls,
    isLoading,
    note: processedData.note,
    packageQuantity: processedData.packageQuantity || 0,
    productCurrentPage,
    productData: processedData.productData,
    productItemsPerPage: localProductItemsPerPage,
    productTotalItems: processedData.productTotalItems,
    setEpcCurrentPage,
    setProductCurrentPage,
    stockMovementDetail,
  };

  return (
    <DetailInboundOutboundContext.Provider value={value}>
      {children}
    </DetailInboundOutboundContext.Provider>
  );
};

export const useDetailInboundOutbound =
  (): DetailInboundOutboundContextType => {
    const context = useContext(DetailInboundOutboundContext);
    if (!context) {
      throw new Error(
        "useDetailInboundOutbound must be used within a DetailInboundOutboundProvider"
      );
    }
    return context;
  };
