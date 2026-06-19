import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import useScanRfidsManual from "@/hooks/api/desktop-reader/useScanRfidsManual";
import {
  RfidCategory,
  RfidMapData,
  RfidStatus,
  RfidType,
} from "@/types/rfid";

// Define interfaces for our data structures
export interface ScannedEpc {
  epc: string;
  itemId: string;
  matchedRfidId?: string;
  rfidDetail?: {
    category: RfidCategory;
    created_at: string;
    epc: string;
    id: string;
    name: string;
    status: RfidStatus;
    type: RfidType;
    updated_at: string;
  };
  sku?: {
    id: string;
    name: string;
    sku: string;
  };
  quantity?: number;
}

interface UseRfidsMapScanningLogicParams {
  rfidsItems: RfidMapData[];
  setScannedEpcs: (
    epcs: ScannedEpc[] | ((prev: ScannedEpc[]) => ScannedEpc[])
  ) => void;
  setSelectedRfidIds: (
    ids: string[] | ((prev: string[]) => string[])
  ) => void;
  t: (key: string, options?: { epc?: string }) => string;
}

export function useRfidsMapScanningLogic({
  rfidsItems,
  setScannedEpcs,
  setSelectedRfidIds,
  t,
}: UseRfidsMapScanningLogicParams) {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { scanRfids } = useScanRfidsManual();

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Stop scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);

  // Start scanning
  const startScanning = useCallback(() => {
    setIsScanning(true);

    scanIntervalRef.current = setInterval(async () => {
      try {
        const result = await scanRfids();
        if (result?.success && result.epcs?.length > 0) {
          // Process each EPC from scan result
          result.epcs.forEach((epc) => {
            // Check if EPC is already scanned (avoid duplicates)
            setScannedEpcs((prevScannedEpcs) => {
              const alreadyScanned = prevScannedEpcs.some(
                (item) => item.epc === epc
              );
              if (alreadyScanned) return prevScannedEpcs;

              // Check if EPC matches any RFIDs in the list
              const matchedRfid = rfidsItems.find((rfid) =>
                rfid.items?.some((item) => item.rfid_detail?.epc === epc)
              );

              if (matchedRfid) {
                const matchedItem = matchedRfid.items?.find(
                  (item) => item.rfid_detail?.epc === epc
                );

                toast.success(t("create.scanning.epcMatched", { epc }));

                // Auto-add this RFID to selected if not already selected
                setSelectedRfidIds((prevSelectedRfidIds) => {
                  if (!prevSelectedRfidIds.includes(matchedRfid.id)) {
                    return [...prevSelectedRfidIds, matchedRfid.id];
                  }
                  return prevSelectedRfidIds;
                });

                return [
                  ...prevScannedEpcs,
                  {
                    epc,
                    itemId: matchedItem?.id || "",
                    matchedRfidId: matchedRfid.id,
                    quantity: 1,
                    rfidDetail: matchedItem?.rfid_detail,
                    sku: matchedItem
                      ? {
                          id: matchedItem.sku.id,
                          name: matchedItem.sku.name,
                          sku: matchedItem.sku.sku,
                        }
                      : undefined,
                  },
                ];
              } else {
                toast.error(t("create.scanning.epcNotMatched", { epc }));
                return prevScannedEpcs;
              }
            });
          });
        }
      } catch (error) {
        console.error("Scan error:", error);
        toast.error(t("create.scanning.scanError"));
      }
    }, 250);
  }, [scanRfids, rfidsItems, t, setScannedEpcs, setSelectedRfidIds]);

  // Handle scan button click
  const handleScanToggle = useCallback(() => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  }, [isScanning, startScanning, stopScanning]);

  return {
    handleScanToggle,
    isScanning,
    stopScanning,
  };
}
