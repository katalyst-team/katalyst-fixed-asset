import { Layers, Loader2 } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Button } from "@/components/ui/button";

interface AssignRfidFooterProps {
  validLedgersCount: number;
  totalLedgersCount: number;
  areAllLedgersValid: boolean;
  isProcessing: boolean;
  onReset: () => void;
  onSave: () => void;
}

const AssignRfidFooter: React.FC<AssignRfidFooterProps> = ({
  validLedgersCount,
  totalLedgersCount,
  areAllLedgersValid,
  isProcessing,
  onReset,
  onSave,
}) => {
  const { t } = useTranslation("assign-rfid");

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {validLedgersCount}/{totalLedgersCount} {t("ledgersValid")}
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onReset}>
          {t("reset")}
        </Button>
        <Button disabled={!areAllLedgersValid || isProcessing} onClick={onSave}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("processing")}
            </>
          ) : (
            t("assignRfids", { count: totalLedgersCount })
          )}
        </Button>
      </div>
    </div>
  );
};

export default AssignRfidFooter;
