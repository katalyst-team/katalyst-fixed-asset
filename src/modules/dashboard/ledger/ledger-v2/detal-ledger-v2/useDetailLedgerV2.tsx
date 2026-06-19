"use client";

import { format } from "date-fns";
import { useRouter } from "next/router";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useUser } from "@/context/user-context";
import useGetStockMovementDetailQuery from "@/hooks/api/stockMovement/useGetStockMovementDetailQuery";
import {
    DetailStockMovementData,
    LedgerV2ItemTableRow,
} from "@/types/detailStockMovement";

interface DetailLedgerV2ContextType {
  isLoading: boolean;
  ledgerInfo: DetailStockMovementData | null;
  tableData: LedgerV2ItemTableRow[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  packageQuantity: number;
  setCurrentPage: (page: number) => void;
}

const DetailLedgerV2Context = createContext<
  DetailLedgerV2ContextType | undefined
>(undefined);

interface DetailLedgerV2ProviderProps {
  children: ReactNode;
  itemsPerPage?: number;
}

export const DetailLedgerV2Provider: React.FC<DetailLedgerV2ProviderProps> = ({
  children,
  itemsPerPage = 10,
}) => {
  const { query } = useRouter();
  const { tokenPayload, selectedTeam } = useUser();

  const orgId = tokenPayload?.organization_id ?? "";
  const storeId = selectedTeam?.toString() ?? "";
  const ledgerId = query.ledger_id as string;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);
  const [tableData, setTableData] = useState<LedgerV2ItemTableRow[]>([]);
  const [allMappedItems, setAllMappedItems] = useState<LedgerV2ItemTableRow[]>(
    []
  );
  const [totalItems, setTotalItems] = useState<number>(0);
  const [ledgerInfo, setLedgerInfo] = useState<DetailStockMovementData | null>(
    null
  );

  // Calculate package quantity from all mapped items (count unique EPCs with PACKAGE category)
  const packageQuantity = useMemo(() => {
    const packageItems = allMappedItems.filter(
      (item) => item.rfidCategory === "PACKAGE" && item.epc !== null
    );
    const uniquePackageEPCs = new Set(
      packageItems.map((item) => item.epc).filter((epc) => epc !== null)
    );
    return uniquePackageEPCs.size;
  }, [allMappedItems]);

  const { data, isLoading } = useGetStockMovementDetailQuery({
    enabled: Boolean(orgId) && Boolean(storeId) && Boolean(ledgerId),
    organizationId: orgId,
    stockMovementId: ledgerId,
    storeId,
  });

  useEffect(() => {
    if (!data?.data) return;

    try {
      const stockMovementData = data.data;

      setLedgerInfo(stockMovementData);

      // Store all histories for later processing
      const histories = stockMovementData.new_item_status_histories || [];

      // Prepare table data from new_item_status_histories
      const mappedItems: LedgerV2ItemTableRow[] = histories?.map(
        (history, index) => {
          const { item } = history;
          const category = item.sku.categories?.[0]?.name || "";
          const subcategory =
            item.sku.categories?.[0]?.subcategory?.[0]?.name || "";
          return {
            attributes: item.sku.attributes || [],
            brand: item.sku.brand?.name || "",
            category,
            changedAt: format(
              new Date(history.changed_at),
              "dd/MM/yyyy, HH:mm:ss"
            ),
            color: item.sku.color?.name || "",
            epc: item.epc,
            id: item.id,
            internalCode: item.sku.internal_code,
            item: item.sku.name,
            no: index + 1,
            rfidCategory: item.rfid_detail?.category || null,
            rfidName: item.rfid_detail?.name || null,
            section: item.section?.name || "",
            size: item.sku.size?.name || "",
            sku: item.sku.name,
            skuId: item.sku.id,
            status: item.status.name,
            subcategory,
          };
        }
      );

      setAllMappedItems(mappedItems);
      setTotalItems(mappedItems.length);
    } catch (error) {
      console.error("Error processing detail ledger v2 data:", error);
      setAllMappedItems([]);
    }
  }, [data]);

  // Handle pagination separately
  useEffect(() => {
    if (allMappedItems.length > 0) {
      const startIndex = (currentPage - 1) * localItemsPerPage;
      const endIndex = startIndex + localItemsPerPage;
      setTableData(allMappedItems.slice(startIndex, endIndex));
    } else {
      setTableData([]);
    }
  }, [allMappedItems, currentPage, localItemsPerPage]);

  const value: DetailLedgerV2ContextType = {
    currentPage,
    isLoading,
    itemsPerPage: localItemsPerPage,
    ledgerInfo,
    packageQuantity,
    setCurrentPage,
    tableData,
    totalItems,
  };

  return (
    <DetailLedgerV2Context.Provider value={value}>
      {children}
    </DetailLedgerV2Context.Provider>
  );
};

export const useDetailLedgerV2 = (): DetailLedgerV2ContextType => {
  const context = useContext(DetailLedgerV2Context);
  if (!context) {
    throw new Error(
      "useDetailLedgerV2 must be used within a DetailLedgerV2Provider"
    );
  }
  return context;
};
