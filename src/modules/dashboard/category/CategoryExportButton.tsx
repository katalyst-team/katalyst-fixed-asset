import { Download } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CategoryItemType } from "@/types/category";
import { exportToExcel } from "@/utils/exportUtils";

interface CategoryExportButtonProps {
  categories: CategoryItemType[];
}

const CategoryExportButton = ({ categories }: CategoryExportButtonProps) => {
  const { t } = useTranslation("category");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (categories.length === 0) {
      toast.error(t("list.export.noData"));
      return;
    }

    setIsExporting(true);
    try {
      const nameCol = t("list.import.columnName");
      const codeCol = t("list.import.columnCode");

      const columns = [
        { key: nameCol, label: nameCol },
        { key: codeCol, label: codeCol },
      ];

      const data = categories.map((cat) => ({
        [codeCol]: cat.code ?? "",
        [nameCol]: cat.name,
      }));

      await exportToExcel({
        columnWidths: [30, 20],
        columns,
        data,
        filename: t("list.export.filename"),
        sheetName: "Category",
      });
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      disabled={isExporting || categories.length === 0}
      size="sm"
      variant="outline"
      onClick={handleExport}
    >
      <Download className="mr-1 h-4 w-4" />
      {t("list.export.button")}
    </Button>
  );
};

export default CategoryExportButton;
