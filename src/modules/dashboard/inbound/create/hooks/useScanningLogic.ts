import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import useScanRfidsManual from "@/hooks/api/desktop-reader/useScanRfidsManual";
import { ApiResponse } from "@/services";
import {
  StockMovementItem,
  StockMovementResponse,
} from "@/services/stockMovement/getStockMovementDataService";

// Define interfaces for our data structures
export interface ScannedEpc {
  epc: string;
  itemId: string;
  matchedStockMovementId?: string;
  stockMovementItem?: StockMovementItem;
  sku?: {
    id: string;
    name: string;
    sku: string;
  };
  quantity?: number;
}

interface UseScanningLogicParams {
  stockMovementData: ApiResponse<StockMovementResponse> | undefined;
  setSelectedStockMovementIds: (
    ids: string[] | ((prev: string[]) => string[])
  ) => void;
  setScannedEpcs: (
    epcs: ScannedEpc[] | ((prev: ScannedEpc[]) => ScannedEpc[])
  ) => void;
  t: (key: string, options?: { epc?: string }) => string;
}

export function useScanningLogic({
  stockMovementData,
  setSelectedStockMovementIds,
  setScannedEpcs,
  t,
}: UseScanningLogicParams) {
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
          // Process each EPC from the scan result
          result.epcs.forEach((epc) => {
            // Check if EPC is already scanned (avoid duplicates)
            setScannedEpcs((prevScannedEpcs: ScannedEpc[]) => {
              const alreadyScanned = prevScannedEpcs.some(
                (scannedEpc: ScannedEpc) => scannedEpc.epc === epc
              );
              if (alreadyScanned) return prevScannedEpcs;

              // Check if EPC matches any waiting inbound stock movements
              const matchedMovement =
                stockMovementData?.data?.stock_movements?.find((movement) =>
                  movement.new_item_status_histories.some(
                    (history) => history.item.rfid_detail?.epc === epc
                  )
                );

              if (matchedMovement) {
                const matchedItem =
                  matchedMovement.new_item_status_histories.find(
                    (history) => history.item.rfid_detail?.epc === epc
                  )?.item;

                toast.success(t("create.scanning.epcMatched", { epc }));

                // Auto-add this stock movement to selected if not already selected
                setSelectedStockMovementIds((prev: string[]) => {
                  if (!prev.includes(matchedMovement.id)) {
                    return [...prev, matchedMovement.id];
                  }
                  return prev;
                });

                return [
                  ...prevScannedEpcs,
                  {
                    epc,
                    itemId: matchedItem?.id || "",
                    matchedStockMovementId: matchedMovement.id,
                    quantity: 1,
                    sku: matchedItem
                      ? {
                          id: matchedItem.sku.id,
                          name: matchedItem.sku.name,
                          sku: matchedItem.sku.sku,
                        }
                      : undefined,
                    stockMovementItem: matchedMovement,
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
  }, [
    scanRfids,
    stockMovementData,
    t,
    setScannedEpcs,
    setSelectedStockMovementIds,
  ]);

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
