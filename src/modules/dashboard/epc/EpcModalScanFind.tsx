import { ScanSearch } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useGetDesktopReaderStatusQuery from "@/hooks/api/desktop-reader/useGetDesktopReaderStatusQuery";
import useScanRfidsManual from "@/hooks/api/desktop-reader/useScanRfidsManual";
import useGetRfidDataQuery from "@/hooks/api/rfid/useGetRfidDataQuery";
import { useBypassHardware } from "@/hooks/useBypassHardware";
import { toastError } from "@/services";
import { RfidItemType } from "@/types/rfid";

import EpcScanFindBypassSection from "./EpcScanFindBypassSection";

const EpcModalScanFind = () => {
  const { t } = useTranslation(["epc"]);
  const { tokenPayload } = useUser();
  const { isBypassEnabled } = useBypassHardware();

  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedEpcs, setScannedEpcs] = useState<Set<string>>(new Set());
  const [foundRfids, setFoundRfids] = useState<RfidItemType[]>([]);
  const [notFoundEpcs, setNotFoundEpcs] = useState<string[]>([]);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [bypassResetKey, setBypassResetKey] = useState(0);

  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { scanRfids } = useScanRfidsManual();
  const {
    data: readerStatus,
    isError: isReaderStatusError,
    refetch: refetchReaderStatus,
  } = useGetDesktopReaderStatusQuery();
  const isReaderConnected = readerStatus?.connected === true;

  const { refetch: getRfidsData } = useGetRfidDataQuery({
    enabled: false,
    filters: {
      epcs: scannedEpcs.size > 0 ? Array.from(scannedEpcs) : undefined,
    },
    organizationId: tokenPayload?.organization_id || "",
  });

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  const startScanning = useCallback(() => {
    setIsScanning(true);
    setScannedEpcs(new Set());
    setFoundRfids([]);
    setNotFoundEpcs([]);
    scanIntervalRef.current = setInterval(async () => {
      try {
        const result = await scanRfids();
        if (result?.success && result.epcs?.length > 0) {
          setScannedEpcs((prev) => {
            const newSet = new Set(prev);
            result.epcs.forEach((epc) => newSet.add(epc));
            return newSet;
          });
        }
      } catch (error) {
        console.error("Scan error:", error);
      }
    }, 250);
  }, [scanRfids]);

  const stopScanning = useCallback(async () => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (scannedEpcs.size === 0) {
      toast.error(t("scan.noEpcsScanned"));
      return;
    }

    setIsLoadingResult(true);
    try {
      const rfidResult = await getRfidsData();
      if (rfidResult.data?.data?.rfids) {
        const found = rfidResult.data.data.rfids;
        const foundEpcSet = new Set(found.map((r) => r.epc));
        const notFound = Array.from(scannedEpcs).filter(
          (epc) => !foundEpcSet.has(epc)
        );
        setFoundRfids(found);
        setNotFoundEpcs(notFound);

        if (found.length === 0) {
          toast.info(t("scanFind.noneFound"));
        } else {
          toast.success(t("scanFind.found", { count: found.length }));
        }
      }
    } catch (error) {
      toastError(error as Error);
    } finally {
      setIsLoadingResult(false);
    }
  }, [scannedEpcs, getRfidsData, t]);

  const resetScan = useCallback(() => {
    setScannedEpcs(new Set());
    setFoundRfids([]);
    setNotFoundEpcs([]);
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);

  const handleBypassResult = useCallback(
    (found: RfidItemType[], notFound: string[]) => {
      setFoundRfids(found);
      setNotFoundEpcs(notFound);
    },
    []
  );

  const handleBypassReset = useCallback(() => {
    setFoundRfids([]);
    setNotFoundEpcs([]);
  }, []);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetScan();
        setBypassResetKey((prev) => prev + 1);
      } else {
        refetchReaderStatus();
      }
    },
    [refetchReaderStatus, resetScan]
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "REUSABLE":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <ScanSearch className="mr-2 h-4 w-4" />
          {t("scanFind.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[640px]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{t("scanFind.title")}</DialogTitle>
          <DialogDescription>{t("scanFind.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {/* Bypass / Hardware section */}
          {isBypassEnabled ? (
            <EpcScanFindBypassSection
              key={bypassResetKey}
              organizationId={tokenPayload?.organization_id || ""}
              onReset={handleBypassReset}
              onResult={handleBypassResult}
            />
          ) : (
            <div className="space-y-4 border-b pb-4">
              <div className="flex items-center justify-between">
                <Label>{t("scan.scanner")}</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge
                    variant={isReaderConnected ? "default" : "destructive"}
                  >
                    {isReaderConnected
                      ? "Reader Connected"
                      : "Reader Disconnected"}
                  </Badge>
                  {t("scan.scannedCount", {
                    scanned: scannedEpcs.size,
                    unregistered: notFoundEpcs.length,
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                {!isScanning ? (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    disabled={
                      isLoadingResult ||
                      !isReaderConnected ||
                      isReaderStatusError
                    }
                    onClick={() => {
                      if (!isReaderConnected || isReaderStatusError) {
                        toast.error("Desktop reader not connected");
                        return;
                      }
                      startScanning();
                    }}
                  >
                    {t("scan.startScan")}
                  </Button>
                ) : (
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isLoadingResult}
                    onClick={stopScanning}
                  >
                    {isLoadingResult
                      ? t("scan.processing")
                      : t("scan.stopScan")}
                  </Button>
                )}

                {(scannedEpcs.size > 0 ||
                  foundRfids.length > 0 ||
                  notFoundEpcs.length > 0) && (
                  <Button
                    disabled={isScanning || isLoadingResult}
                    variant="outline"
                    onClick={resetScan}
                  >
                    {t("scan.reset")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {(foundRfids.length > 0 || notFoundEpcs.length > 0) && (
            <div className="space-y-3">
              {foundRfids.length > 0 && (
                <div className="space-y-2">
                  <Label>
                    {t("scanFind.foundList", { count: foundRfids.length })}
                  </Label>
                  <div className="rounded border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">No</TableHead>
                          <TableHead>{t("detail.name")}</TableHead>
                          <TableHead>{t("detail.epcCode")}</TableHead>
                          <TableHead>{t("detail.type")}</TableHead>
                          <TableHead>{t("detail.status")}</TableHead>
                          <TableHead>{t("detail.cycleCount")}</TableHead>
                          <TableHead>{t("table.header.store")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {foundRfids.map((rfid, index) => (
                          <TableRow
                            key={rfid.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() =>
                              window.open(
                                `/dashboard/epc/${rfid.id}`,
                                "_blank"
                              )
                            }
                          >
                            <TableCell className="text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {rfid.name}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {rfid.epc}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getTypeVariant(rfid.type)}>
                                {rfid.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(rfid.status)}>
                                {rfid.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{rfid.cycle_count ?? 0}</TableCell>
                            <TableCell>{rfid.store?.name ?? "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {notFoundEpcs.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-destructive">
                    {t("scanFind.notFoundList", { count: notFoundEpcs.length })}
                  </Label>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded border border-destructive/20 p-2">
                    {notFoundEpcs.map((epc) => (
                      <p key={epc} className="font-mono text-xs text-muted-foreground">
                        {epc}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EpcModalScanFind;
