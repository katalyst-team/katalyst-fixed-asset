import { FileSpreadsheet, Info } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

// Utility: Generate a random EPC for example
function generateExampleEPC(): string {
  const companyPrefix = "3"; // 1 hex digit
  const timestamp = Date.now().toString(16).slice(-6).padStart(6, "0"); // 6 hex digits
  const random = [...crypto.getRandomValues(new Uint8Array(10))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 17); // 17 hex digits
  return `${companyPrefix}${timestamp}${random}`.toUpperCase(); // 24 hex digits
}

// Utility: Generate a random name for example
function generateExampleName(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `RFID_TAG_${timestamp}`;
}

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RfidCategory, RfidStatus, RfidType } from "@/types/rfid";
import { exportToExcel } from "@/utils/exportUtils";

interface EpcTemplateExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EpcTemplateExportModal: React.FC<
  EpcTemplateExportModalProps
> = ({ isOpen, onClose }) => {
  const { t } = useTranslation(["epc", "common"]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Build columns array for EPC template
      const columns = [
        { key: "name", label: "Name" },
        { key: "epc", label: "EPC Code" },
        { key: "type", label: "Type" },
        { key: "category", label: "Category" },
        { key: "status", label: "Status" },
      ];

      // Create example row with generated EPC and name
      const exampleRow = {
        category: RfidCategory.PACKAGE,
        epc: generateExampleEPC(),
        name: generateExampleName(),
        status: RfidStatus.ACTIVE,
        type: RfidType.REUSABLE,
      };

      // Export Excel with example row
      await exportToExcel({
        columns,
        data: [exampleRow],
        filename: `epc_template_${new Date().toISOString().split("T")[0]}`,
      });

      onClose();
    } catch (error) {
      console.error("Failed to export template:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t("epc:exportTemplate.title", "Export EPC Template")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "epc:exportTemplate.description",
              "Download an Excel template with columns for EPC/RFID tags. The template includes an example row to guide you.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm space-y-2">
              <p className="font-semibold">
                {t("epc:exportTemplate.howToUse", "How to use:")}
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>
                  {t(
                    "epc:exportTemplate.step1",
                    "Click 'Export Template' to download the Excel file",
                  )}
                </li>
                <li>
                  {t(
                    "epc:exportTemplate.step2",
                    "Fill in your EPC/RFID data following the example row format",
                  )}
                </li>
                <li>
                  {t(
                    "epc:exportTemplate.step3",
                    "Use 'Import Excel' button to upload your completed file",
                  )}
                </li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                {t(
                  "epc:exportTemplate.note",
                  "Note: All fields are required. Type must be REUSABLE or DISPOSABLE. Category must be SINGLE or PACKAGE. Status must be ACTIVE or INACTIVE.",
                )}
              </p>
            </AlertDescription>
          </Alert>

          {/* Column Information */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {t(
                "epc:exportTemplate.columnsIncluded",
                "Columns that will be included:",
              )}
            </p>
            <div className="border rounded-md p-3 bg-muted/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Name</span>
                  <span className="text-red-500 text-xs">*required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">EPC Code</span>
                  <span className="text-red-500 text-xs">*required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Type</span>
                  <span className="text-muted-foreground text-xs">
                    (REUSABLE/DISPOSABLE)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Category</span>
                  <span className="text-muted-foreground text-xs">
                    (SINGLE/PACKAGE)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status</span>
                  <span className="text-muted-foreground text-xs">
                    (ACTIVE/INACTIVE)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common:cancel", "Cancel")}
          </Button>
          <Button disabled={isExporting} onClick={handleExport}>
            {isExporting
              ? t("common:exporting", "Exporting...")
              : t("epc:exportTemplate.exportButton", "Export Template")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
