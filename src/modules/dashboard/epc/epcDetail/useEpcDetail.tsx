"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useUser } from "@/context/user-context";
import useGetRfidDetailQuery from "@/hooks/api/rfid/useGetRfidDetailQuery";
import useGetRfidHistoryQuery from "@/hooks/api/rfid/useGetRfidHistoryQuery";
import {
  RfidDetailWithStockMovements,
  RfidHistoryItem,
} from "@/types/rfid";

interface EpcDetailContextType {
  epcData: RfidDetailWithStockMovements | null;
  histories: RfidHistoryItem[];
  isLoading: boolean;
  isHistoryLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  epcCode: string;
  lastUpdate: string;
  totalHistories: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  setItemsPerPage: (limit: number) => void;
}

const EpcDetailContext = createContext<EpcDetailContextType | undefined>(
  undefined
);

interface EpcDetailProviderProps {
  children: ReactNode;
  epcId: string;
  itemsPerPage?: number;
}

export const EpcDetailProvider: React.FC<EpcDetailProviderProps> = ({
  children,
  epcId,
  itemsPerPage = 10,
}) => {
  const { tokenPayload } = useUser();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage, setLocalItemsPerPage] =
    useState<number>(itemsPerPage);
  const [histories, setHistories] = useState<RfidHistoryItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursor, setPrevCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPrevPage] = useState<boolean>(false);

  const {
    data: epcDetailData,
    isLoading,
    isSuccess,
  } = useGetRfidDetailQuery({
    organizationId: tokenPayload?.organization_id || "",
    rfidId: epcId,
  });

  const epcData = useMemo(() => {
    if (isSuccess && epcDetailData?.data) {
      return epcDetailData.data;
    }
    return null;
  }, [epcDetailData, isSuccess]);

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isSuccess: isHistorySuccess,
  } = useGetRfidHistoryQuery({
    cursor: currentCursor,
    enabled: Boolean(tokenPayload?.organization_id) && Boolean(epcId),
    limit: localItemsPerPage,
    organizationId: tokenPayload?.organization_id || "",
    rfidId: epcId,
  });

  useEffect(() => {
    if (isHistorySuccess) {
      const historiesResponse = historyData?.data?.histories || [];
      setHistories(historiesResponse);
      setTotalItems(historyData.pagination?.count || 0);
      setNextCursor(historyData.pagination?.next_cursor || null);
      setPrevCursor(historyData.pagination?.prev_cursor || null);
      setHasNextPage(Boolean(historyData.pagination?.next_cursor));
      setHasPrevPage(Boolean(historyData.pagination?.prev_cursor));
    }
  }, [historyData, isHistorySuccess]);

  useEffect(() => {
    setCurrentCursor(undefined);
    setCurrentPage(1);
    setHistories([]);
    setTotalItems(0);
    setNextCursor(null);
    setPrevCursor(null);
    setHasNextPage(false);
    setHasPrevPage(false);
  }, [epcId]);

  const epcCode = useMemo(() => epcData?.epc || "", [epcData]);

  const lastUpdate = useMemo(() => {
    if (epcData?.updated_at) {
      return new Date(epcData.updated_at).toLocaleDateString();
    }
    return "";
  }, [epcData]);

  const totalHistories = useMemo(
    () => historyData?.pagination?.count || histories.length || 0,
    [historyData, histories.length]
  );

  const goToNextPage = useCallback(() => {
    if (hasNextPage && nextCursor) {
      setCurrentCursor(nextCursor);
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage, nextCursor]);

  const goToPrevPage = useCallback(() => {
    if (hasPrevPage && prevCursor) {
      setCurrentCursor(prevCursor);
      setCurrentPage((prev) => Math.max(1, prev - 1));
    } else if (currentPage > 1) {
      setCurrentCursor(undefined);
      setCurrentPage(1);
    }
  }, [currentPage, hasPrevPage, prevCursor]);

  const handleSetItemsPerPage = useCallback((limit: number) => {
    setLocalItemsPerPage(limit);
    setCurrentCursor(undefined);
    setCurrentPage(1);
  }, []);

  const value: EpcDetailContextType = {
    currentPage,
    epcCode,
    epcData,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    histories,
    isHistoryLoading,
    isLoading,
    itemsPerPage: localItemsPerPage,
    lastUpdate,
    setItemsPerPage: handleSetItemsPerPage,
    totalHistories,
    totalItems,
  };

  return (
    <EpcDetailContext.Provider value={value}>
      {children}
    </EpcDetailContext.Provider>
  );
};

export const useEpcDetail = (): EpcDetailContextType => {
  const context = useContext(EpcDetailContext);
  if (!context) {
    throw new Error("useEpcDetail must be used within an EpcDetailProvider");
  }
  return context;
};
