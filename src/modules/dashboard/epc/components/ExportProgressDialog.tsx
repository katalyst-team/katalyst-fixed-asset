import { Loader2 } from "lucide-react";
import { useTranslation } from "next-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface ExportProgressDialogProps {
  isOpen: boolean;
  progress: number;
  stage: "fetching" | "processing" | "downloading" | "complete";
  totalRecords?: number;
}

export const ExportProgressDialog: React.FC<ExportProgressDialogProps> = ({
  isOpen,
  progress,
  stage,
  totalRecords,
}) => {
  const { t } = useTranslation(["epc"]);

  const getStageText = () => {
    switch (stage) {
      case "fetching":
        return t("epc:export.progress.fetching", "Fetching RFID data...");
      case "processing":
        return t(
          "epc:export.progress.processing",
          "Processing data for export..."
        );
      case "downloading":
        return t(
          "epc:export.progress.downloading",
          "Generating Excel file..."
        );
      case "complete":
        return t("epc:export.progress.complete", "Export complete!");
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("epc:export.progress.title", "Exporting RFID Data")}
          </DialogTitle>
          <DialogDescription>{getStageText()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Progress className="h-2" value={progress} />
          <div className="text-center text-sm text-muted-foreground">
            {progress}%
            {totalRecords && stage === "fetching" && (
              <span className="ml-2">
                ({t("epc:export.progress.records", {
                  count: totalRecords,
                  defaultValue: "{{count}} records",
                })})
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
