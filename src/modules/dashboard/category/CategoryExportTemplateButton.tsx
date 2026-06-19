import { FileDown } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/utils/exportUtils";

const CategoryExportTemplateButton = () => {
  const { t } = useTranslation("category");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const nameCol = t("list.import.columnName");
      const codeCol = t("list.import.columnCode");

      const columns = [
        { key: nameCol, label: nameCol },
        { key: codeCol, label: codeCol },
      ];

      const exampleRow: Record<string, string> = {
        [codeCol]: "CAT-001",
        [nameCol]: "Example Category",
      };

      await exportToExcel({
        columnWidths: [30, 20],
        columns,
        data: [exampleRow],
        filename: t("list.export.templateFilename"),
        sheetName: "Category",
      });
    } catch {
      toast.error("Export template failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button disabled={isExporting} size="sm" variant="outline" onClick={handleExport}>
      <FileDown className="mr-1 h-4 w-4" />
      {t("list.export.templateButton")}
    </Button>
  );
};

export default CategoryExportTemplateButton;
