"use client";

import { useRouter } from "next/router";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import { useUser } from "@/context/user-context";
import useGetDetailLedgerItemQuery from "@/hooks/api/ledger/useGetDetailLedgerItemQuery";
import {
    DetailLedgerHistoryItemType,
    DetailLedgerProductItemType,
} from "@/types/detailLedger";
import { formatDateTime } from "@/utils/text";

interface DetailLedgerContextType {
  productData: DetailLedgerProductItemType[];
  historyData: DetailLedgerHistoryItemType[];
  isLoading: boolean;
  productCurrentPage: number;
  historyCurrentPage: number;
  productItemsPerPage: number;
  historyItemsPerPage: number;
  productTotalItems: number;
  historyTotalItems: number;
  setProductCurrentPage: (page: number) => void;
  setHistoryCurrentPage: (page: number) => void;
}

const DetailLedgerContext = createContext<DetailLedgerContextType | undefined>(
  undefined
);

interface DetailLedgerProviderProps {
  children: ReactNode;
  productItemsPerPage?: number;
  historyItemsPerPage?: number;
  organizationId?: string;
  storeId?: string;
  itemId?: string;
}

export const DetailLedgerProvider: React.FC<DetailLedgerProviderProps> = ({
  children,
  productItemsPerPage = 10,
  historyItemsPerPage = 10,
}) => {
  const { query } = useRouter();
  const { tokenPayload, selectedTeam } = useUser();

  const orgId = tokenPayload?.organization_id ?? "";
  const storeId = selectedTeam?.toString();
  const itemId = query.ledger_id as string;

  const [productCurrentPage, setProductCurrentPage] = useState<number>(1);
  const [historyCurrentPage, setHistoryCurrentPage] = useState<number>(1);
  const [localProductItemsPerPage] = useState<number>(productItemsPerPage);
  const [localHistoryItemsPerPage] = useState<number>(historyItemsPerPage);

  const { data, isLoading } = useGetDetailLedgerItemQuery({
    enabled: Boolean(orgId && storeId && itemId),
    itemId,
    organizationId: orgId,
    storeId,
  });

  const detailLedgerItem = data?.data ?? null;

  const [productData, setProductData] = useState<DetailLedgerProductItemType[]>(
    []
  );
  const [historyData, setHistoryData] = useState<DetailLedgerHistoryItemType[]>(
    []
  );
  const [productTotalItems, setProductTotalItems] = useState<number>(0);
  const [historyTotalItems, setHistoryTotalItems] = useState<number>(0);

  useEffect(() => {
    if (!detailLedgerItem) return;

    try {
      // Prepare product data - in this case, we only have one product
      const skuName = detailLedgerItem.sku?.name || "Unknown Product";
      const statusName = detailLedgerItem.status?.name || "Unknown Status";

      const rfidId =
        detailLedgerItem.item_status_histories?.find(
          (history) => history.item?.rfid_detail?.id
        )?.item?.rfid_detail?.id || "";

      const productData: DetailLedgerProductItemType[] = [
        {
          id: rfidId,
          // Assuming each detail item represents one product
          lastStatus: statusName,
          no: "1",
          productName: skuName,
          quantity: 1,
        },
      ];

      // Prepare history data from item_status_histories
      const historyData: DetailLedgerHistoryItemType[] = (
        detailLedgerItem.item_status_histories || []
      ).map((history, index) => ({
        lastUpdate: formatDateTime(history.changed_at),
        no: (index + 1).toString(),
        operator: history.editor?.first_name || "Unknown Operator",
        status: history.new_status?.name || "Unknown Status",
      }));

      setProductTotalItems(productData.length);
      const productStartIndex =
        (productCurrentPage - 1) * localProductItemsPerPage;
      const productEndIndex = productStartIndex + localProductItemsPerPage;
      const paginatedProductData = productData.slice(
        productStartIndex,
        productEndIndex
      );
      setProductData(paginatedProductData);

      setHistoryTotalItems(historyData.length);
      const historyStartIndex =
        (historyCurrentPage - 1) * localHistoryItemsPerPage;
      const historyEndIndex = historyStartIndex + localHistoryItemsPerPage;
      const paginatedHistoryData = historyData.slice(
        historyStartIndex,
        historyEndIndex
      );
      setHistoryData(paginatedHistoryData);
    } catch (error) {
      console.error("Error processing detail ledger data:", error);
      setProductData([]);
      setHistoryData([]);
    }
  }, [
    detailLedgerItem,
    productCurrentPage,
    historyCurrentPage,
    localProductItemsPerPage,
    localHistoryItemsPerPage,
  ]);

  const value: DetailLedgerContextType = {
    historyCurrentPage,
    historyData,
    historyItemsPerPage: localHistoryItemsPerPage,
    historyTotalItems,
    isLoading,
    productCurrentPage,
    productData,
    productItemsPerPage: localProductItemsPerPage,
    productTotalItems,
    setHistoryCurrentPage,
    setProductCurrentPage,
  };

  return (
    <DetailLedgerContext.Provider value={value}>
      {children}
    </DetailLedgerContext.Provider>
  );
};

export const useDetailLedger = (): DetailLedgerContextType => {
  const context = useContext(DetailLedgerContext);
  if (!context) {
    throw new Error(
      "useDetailLedger must be used within a DetailLedgerProvider"
    );
  }
  return context;
};
