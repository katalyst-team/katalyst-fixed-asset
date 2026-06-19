import { FileDown } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CategoryItemType } from "@/types/category";
import { exportToExcel } from "@/utils/exportUtils";

interface SubCategoryExportTemplateButtonProps {
  categoryName: string;
  subCategories: CategoryItemType[];
}

const SubCategoryExportTemplateButton = ({
  categoryName,
  subCategories,
}: SubCategoryExportTemplateButtonProps) => {
  const { t } = useTranslation("category");
  const [isExporting, setIsExporting] = useState(false);

  const schemaItem = subCategories.find(
    (s) => s.attribute_items && s.attribute_items.length > 0
  );
  const attrSchema = (schemaItem?.attribute_items ?? []).filter(
    (ai) => ai.attribute.type?.toUpperCase() !== "REFERENCE_GROUP"
  );
  const hasAttributes = attrSchema.length > 0;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const nameCol = t("sub.import.columnName");
      const codeCol = t("sub.import.columnCode");
      const attrCols = attrSchema.map((ai) => ai.attribute.name);

      const columns = [
        { key: nameCol, label: nameCol },
        { key: codeCol, label: codeCol },
        ...attrCols.map((name) => ({ key: name, label: name })),
      ];

      // Build example row from the schema sub-category
      const exampleRow: Record<string, string> = {
        [codeCol]: schemaItem?.code ?? "",
        [nameCol]: schemaItem?.name ?? "",
      };
      attrSchema.forEach((ai) => {
        const defaultEntry = schemaItem?.attribute_defaults?.find(
          (d) => d.attribute.attribute.id === ai.attribute.id
        );
        exampleRow[ai.attribute.name] = defaultEntry?.values?.join(", ") ?? "";
      });

      const safeName = categoryName.replace(/[/\\?%*:|"<>]/g, "-").substring(0, 30);

      await exportToExcel({
        columnWidths: [25, 15, ...attrCols.map(() => 18)],
        columns,
        data: [exampleRow],
        filename: `${t("sub.export.templateFilename")}-${safeName}`,
        sheetName: "SubCategory",
      });
    } catch {
      toast.error("Export template gagal");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      disabled={isExporting || !hasAttributes}
      size="sm"
      title={!hasAttributes ? t("sub.export.noAttributes") : undefined}
      variant="outline"
      onClick={handleExport}
    >
      <FileDown className="mr-1 h-4 w-4" />
      {t("sub.export.templateButton")}
    </Button>
  );
};

export default SubCategoryExportTemplateButton;
