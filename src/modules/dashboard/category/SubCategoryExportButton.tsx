import { Download } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CategoryItemType } from "@/types/category";
import { exportToExcel } from "@/utils/exportUtils";

interface SubCategoryExportButtonProps {
  categoryName: string;
  subCategories: CategoryItemType[];
}

const SubCategoryExportButton = ({
  categoryName,
  subCategories,
}: SubCategoryExportButtonProps) => {
  const { t } = useTranslation("category");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (subCategories.length === 0) {
      toast.error(t("sub.export.noData"));
      return;
    }

    setIsExporting(true);
    try {
      const schemaItem = subCategories.find((s) => s.attribute_items && s.attribute_items.length > 0);
      const attrSchema = schemaItem?.attribute_items ?? [];

      const nameCol = t("sub.import.columnName");
      const codeCol = t("sub.import.columnCode");
      const attrCols = attrSchema.map((ai) => ai.attribute.name);

      const columns = [
        { key: nameCol, label: nameCol },
        { key: codeCol, label: codeCol },
        ...attrCols.map((name) => ({ key: name, label: name })),
      ];

      const data = subCategories.map((sub) => {
        const defaultMap: Record<string, string> = {};
        sub.attribute_defaults?.forEach((d) => {
          defaultMap[d.attribute.attribute.id] = d.values.join(", ");
        });

        const row: Record<string, string> = {
          [codeCol]: sub.code ?? "",
          [nameCol]: sub.name,
        };

        attrSchema.forEach((ai) => {
          row[ai.attribute.name] = defaultMap[ai.attribute.id] ?? "";
        });

        return row;
      });

      const safeCategoryName = categoryName.replace(/[/\\?%*:|"<>]/g, "-").substring(0, 30);

      await exportToExcel({
        columnWidths: [25, 15, ...attrCols.map(() => 18)],
        columns,
        data,
        filename: `${t("sub.export.filename")}-${safeCategoryName}`,
        sheetName: "SubCategory",
      });
    } catch {
      toast.error("Export gagal");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      disabled={isExporting || subCategories.length === 0}
      size="sm"
      variant="outline"
      onClick={handleExport}
    >
      <Download className="mr-1 h-4 w-4" />
      {t("sub.export.button")}
    </Button>
  );
};

export default SubCategoryExportButton;
