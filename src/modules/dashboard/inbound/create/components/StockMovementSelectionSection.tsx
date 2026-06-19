import { CirclePause, Scan } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  BypassRfidDialog,
  BypassRfidDialogProps,
} from "@/components/ui/bypass-rfid-dialog";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import useGetDesktopReaderStatusQuery from "@/hooks/api/desktop-reader/useGetDesktopReaderStatusQuery";
import { useBypassHardware } from "@/hooks/useBypassHardware";

interface RfidSelectionSectionProps extends Omit<BypassRfidDialogProps, "open" | "onClose" | "onEpcSelected"> {
  rfidOptions: Array<{ label: string; value: string }>;
  selectedRfidIds: string[];
  setSelectedRfidIds: (ids: string[]) => void;
  isScanning: boolean;
  onScanToggle: () => void;
  onBypassEpcSelected?: (epc: string) => void;
  disabled?: boolean;
  isLoadingOptions?: boolean;
}

export function RfidSelectionSection({
  rfidOptions,
  selectedRfidIds,
  setSelectedRfidIds,
  isScanning,
  onScanToggle,
  onBypassEpcSelected,
  disabled = false,
  isLoadingOptions = false,
  direction,
}: RfidSelectionSectionProps) {
  const { t } = useTranslation("common");
  const { isBypassEnabled } = useBypassHardware();
  const { data: readerStatus, isError: isReaderStatusError } =
    useGetDesktopReaderStatusQuery();
  const isReaderConnected = readerStatus?.connected === true;

  const [showBypassDialog, setShowBypassDialog] = useState(false);

  // Show a one-time toast when disconnected (only in normal mode)
  const hasShownToastRef = useRef(false);
  useEffect(() => {
    if (isBypassEnabled) {
      // Reset toast flag when bypass is enabled
      hasShownToastRef.current = false;
      return;
    }

    if (!isReaderConnected || isReaderStatusError) {
      if (!hasShownToastRef.current) {
        toast.error("Desktop reader not connected");
        hasShownToastRef.current = true;
      }
    } else {
      hasShownToastRef.current = false;
    }
  }, [isReaderConnected, isReaderStatusError, isBypassEnabled]);

  const handleScanButtonClick = useCallback(() => {
    if (isBypassEnabled) {
      // Bypass mode: show dialog
      setShowBypassDialog(true);
      return;
    }

    // Normal mode: check reader connection
    if (!isReaderConnected || isReaderStatusError) {
      toast.error("Desktop reader not connected");
      return;
    }
    onScanToggle();
  }, [isBypassEnabled, isReaderConnected, isReaderStatusError, onScanToggle]);

  const handleBypassDialogClose = useCallback(() => {
    setShowBypassDialog(false);
  }, []);

  const handleBypassEpcSelected = useCallback(
    (epc: string) => {
      setShowBypassDialog(false);
      onBypassEpcSelected?.(epc);
    },
    [onBypassEpcSelected]
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <MultiCombobox
            isRequired
            disabled={disabled}
            emptyMessage={t("manualEpc.noRfids")}
            label="RFID"
            options={rfidOptions}
            placeholder={
              isLoadingOptions ? t("loading") : t("manualEpc.placeholder")
            }
            selectedValues={selectedRfidIds}
            onValueChange={setSelectedRfidIds}
          />
        </div>
        <div className="flex items-end gap-2">
          <span
            className={
              isReaderConnected && !isReaderStatusError
                ? "text-green-600 text-xs"
                : "text-destructive text-xs"
            }
          >
            {isReaderConnected && !isReaderStatusError
              ? "Reader Connected"
              : "Reader Disconnected"}
          </span>
          <Button
            disabled={disabled}
            size="sm"
            variant={isScanning ? "destructive" : "default"}
            onClick={handleScanButtonClick}
          >
            {isScanning ? (
              <>
                <CirclePause className="mr-2 h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Scan className="mr-2 h-4 w-4" />
                Scan RFID
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Bypass Mode Dialog */}
      <BypassRfidDialog
        direction={direction}
        open={showBypassDialog}
        onClose={handleBypassDialogClose}
        onEpcSelected={handleBypassEpcSelected}
      />
    </>
  );
}

// Backward compatibility export
export const StockMovementSelectionSection = RfidSelectionSection;
