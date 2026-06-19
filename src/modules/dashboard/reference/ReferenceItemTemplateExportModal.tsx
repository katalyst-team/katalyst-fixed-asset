"use client";

import { FileSpreadsheet } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

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
import { exportToExcel } from "@/utils/exportUtils";

interface ReferenceItemTemplateExportModalProps {
  groupName?: string;
}

const ReferenceItemTemplateExportModal = ({
  groupName = "reference",
}: ReferenceItemTemplateExportModalProps) => {
  const { t } = useTranslation(["reference", "common"]);
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const columns = [
        { key: "name", label: "Name *" },
        { key: "code", label: "Code" },
        { key: "sort_order", label: "Sort Order" },
      ];

      const exampleRow = {
        code: "CODE01",
        name: "Example Item",
        sort_order: 1,
      };

      await exportToExcel({
        columnWidths: [30, 20, 15],
        columns,
        data: [exampleRow],
        filename: `template-${groupName.toLowerCase().replace(/\s+/g, "-")}`,
        sheetName: "Template",
      });

      setOpen(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <FileSpreadsheet className="mr-1.5 h-4 w-4" />
          {t("reference:buttons.exportTemplate", "Export Template")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("reference:modal.exportTemplate.title", "Export Import Template")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "reference:modal.exportTemplate.description",
              "Download a blank Excel template to fill in and import reference items."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border p-3 text-sm">
          <p className="mb-2 font-medium">
            {t("reference:modal.exportTemplate.columns", "Template columns:")}
          </p>
          <ul className="space-y-1 text-muted-foreground">
            <li><span className="font-medium text-foreground">Name *</span> — {t("reference:modal.exportTemplate.nameHint", "required")}</li>
            <li><span className="font-medium text-foreground">Code</span> — {t("reference:modal.exportTemplate.codeHint", "optional short code")}</li>
            <li><span className="font-medium text-foreground">Sort Order</span> — {t("reference:modal.exportTemplate.sortHint", "numeric, default 0")}</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("common:cancel", "Cancel")}
          </Button>
          <Button disabled={isExporting} onClick={handleExport}>
            <FileSpreadsheet className="mr-1.5 h-4 w-4" />
            {isExporting
              ? t("common:downloading", "Downloading...")
              : t("reference:buttons.downloadTemplate", "Download Template")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReferenceItemTemplateExportModal;
