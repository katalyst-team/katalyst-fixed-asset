import { useQueryClient } from "@tanstack/react-query";
import { Scan } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import useGetDesktopReaderStatusQuery from "@/hooks/api/desktop-reader/useGetDesktopReaderStatusQuery";
import useScanRfidsManual from "@/hooks/api/desktop-reader/useScanRfidsManual";
import useGetRfidDataQuery, {
  KEY_USE_GET_RFID_DATA,
} from "@/hooks/api/rfid/useGetRfidDataQuery";
import { useBypassHardware } from "@/hooks/useBypassHardware";
import { toastError } from "@/services";
import { RfidCategory, RfidStatus, RfidType } from "@/types/rfid";

import EpcBypassInputSection from "./EpcBypassInputSection";
import { useEpcStore } from "./store";
import { useEpcActions } from "./useEpcActions";

const EpcModalScanRfidsAdd = () => {
  const { t } = useTranslation(["epc"]);
  const { tokenPayload } = useUser();
  const { setFilters } = useEpcStore();
  const queryClient = useQueryClient();
  const { isBypassEnabled } = useBypassHardware();

  // Dialog state
  const [open, setOpen] = useState(false);

  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scannedEpcs, setScannedEpcs] = useState<Set<string>>(new Set());
  const [unregisteredEpcs, setUnregisteredEpcs] = useState<string[]>([]);
  const [epcNames, setEpcNames] = useState<Record<string, string>>({});

  // Form state
  const [epcType, setEpcType] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  // Loading states
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Refs
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Reset key for bypass section
  const [bypassResetKey, setBypassResetKey] = useState(0);

  const { createEpc } = useEpcActions();
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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Start scanning function
  const startScanning = useCallback(() => {
    setIsScanning(true);
    setScannedEpcs(new Set());
    setUnregisteredEpcs([]);
    setEpcNames({});
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

  // Stop scanning function
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

    setIsLoadingMap(true);
    try {
      const rfidResult = await getRfidsData();
      if (rfidResult.data?.data?.rfids) {
        const registeredEpcs = new Set(
          rfidResult.data.data.rfids.map((rfid) => rfid.epc)
        );
        const unregistered = Array.from(scannedEpcs).filter(
          (epc) => !registeredEpcs.has(epc)
        );
        setUnregisteredEpcs(unregistered);
        const initialNames: Record<string, string> = {};
        unregistered.forEach((epc) => {
          initialNames[epc] = "";
        });
        setEpcNames(initialNames);

        if (unregistered.length === 0) {
          toast.info(t("scan.allRegistered"));
        } else {
          toast.success(
            t("scan.foundUnregistered", { count: unregistered.length })
          );
        }
      }
    } catch (error) {
      toastError(error as Error);
    } finally {
      setIsLoadingMap(false);
    }
  }, [scannedEpcs, getRfidsData, t]);

  // Reset function for hardware scan
  const resetScan = useCallback(() => {
    setScannedEpcs(new Set());
    setUnregisteredEpcs([]);
    setEpcNames({});
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);

  // Update EPC name
  const updateEpcName = useCallback((epc: string, name: string) => {
    setEpcNames((prev) => ({ ...prev, [epc]: name }));
  }, []);

  const handleSubmit = async () => {
    if (unregisteredEpcs.length === 0) return;

    setIsCreating(true);
    try {
      await createEpc({
        rfids: unregisteredEpcs.map((epc) => ({
          category: category as RfidCategory,
          epc: epc,
          name: epcNames[epc] || epc,
          status: status as RfidStatus,
          type: epcType as RfidType,
        })),
      });

      toast.success(t("scan.success", { count: unregisteredEpcs.length }));
      setFilters({});
      queryClient.invalidateQueries({
        queryKey: KEY_USE_GET_RFID_DATA(
          tokenPayload?.organization_id || "",
          {}
        ),
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      toastError(error as Error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = useCallback(() => {
    setEpcType(undefined);
    setCategory(undefined);
    setStatus(undefined);
    resetScan();
    setBypassResetKey((prev) => prev + 1);
  }, [resetScan]);

  // Handler for bypass mode EPC check results
  const handleBypassEpcsChecked = useCallback(
    (checkedUnregisteredEpcs: string[], checkedEpcNames: Record<string, string>) => {
      setUnregisteredEpcs(checkedUnregisteredEpcs);
      setEpcNames(checkedEpcNames);
    },
    []
  );

  // Handler for bypass mode reset
  const handleBypassReset = useCallback(() => {
    setUnregisteredEpcs([]);
    setEpcNames({});
  }, []);

  const isDisabled =
    unregisteredEpcs.length === 0 ||
    !epcType ||
    !category ||
    !status ||
    isCreating ||
    unregisteredEpcs.some((epc) => !epcNames[epc]?.trim());

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      } else {
        refetchReaderStatus();
      }
    },
    [refetchReaderStatus, resetForm]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size={"sm"}>
          <Scan /> {t("modal.create.scan_button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[500px]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {t("modal.create.title")} - {t("scan.title")}
          </DialogTitle>
          <DialogDescription>{t("scan.description")}</DialogDescription>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4 pr-1">
            {/* Bypass Mode - Manual Input Section */}
            {isBypassEnabled ? (
              <EpcBypassInputSection
                key={bypassResetKey}
                getRfidsData={getRfidsData}
                onEpcsChecked={handleBypassEpcsChecked}
                onReset={handleBypassReset}
              />
            ) : (
              /* Hardware Scanning Section */
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
                      unregistered: unregisteredEpcs.length,
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isScanning ? (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      disabled={
                        isLoadingMap || !isReaderConnected || isReaderStatusError
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
                      disabled={isLoadingMap}
                      onClick={stopScanning}
                    >
                      {isLoadingMap ? t("scan.processing") : t("scan.stopScan")}
                    </Button>
                  )}

                  {(scannedEpcs.size > 0 || unregisteredEpcs.length > 0) && (
                    <Button
                      disabled={isScanning || isLoadingMap}
                      variant="outline"
                      onClick={resetScan}
                    >
                      {t("scan.reset")}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Unregistered EPCs List */}
            {unregisteredEpcs.length > 0 && (
              <div className="space-y-4">
                <Label>
                  {t("scan.unregisteredList", {
                    count: unregisteredEpcs.length,
                  })}
                </Label>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {unregisteredEpcs.map((epc, index) => (
                    <div
                      key={epc}
                      className="flex items-center gap-2 rounded border p-2"
                    >
                      <span className="w-6 flex-shrink-0 text-center text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="flex-1 font-mono text-sm">{epc}</div>
                      <InputWithLabel
                        className="flex-1"
                        placeholder={t("scan.enterName")}
                        value={epcNames[epc] || ""}
                        onChange={(e) => updateEpcName(epc, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label isRequired htmlFor="type">
                {t("modal.form.type")}
              </Label>
              <Select value={epcType} onValueChange={setEpcType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("modal.form.typeSelect")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RfidType.REUSABLE}>
                    {t("type.reusable")}
                  </SelectItem>
                  <SelectItem value={RfidType.DISPOSABLE}>
                    {t("type.disposable")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label isRequired htmlFor="category">
                {t("modal.form.category")}
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("modal.form.categorySelect")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RfidCategory.SINGLE}>
                    {t("category.single")}
                  </SelectItem>
                  <SelectItem value={RfidCategory.PACKAGE}>
                    {t("category.package")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label isRequired htmlFor="status">
                {t("modal.form.status")}
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("modal.form.statusSelect")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RfidStatus.ACTIVE}>
                    {t("status.active")}
                  </SelectItem>
                  <SelectItem value={RfidStatus.INACTIVE}>
                    {t("status.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isDisabled} type="button" onClick={handleSubmit}>
              {isCreating
                ? t("scan.creating", { count: unregisteredEpcs.length })
                : t("scan.create", { count: unregisteredEpcs.length })}
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EpcModalScanRfidsAdd;
