import { FileSpreadsheet, FileText, LoaderCircle } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToExcel } from "@/utils/exportUtils";

interface ExportColumn {
  key: string;
  label: string;
  formatter?: (value: unknown) => string;
}

interface TableExportButtonProps {
  data: unknown[];
  columns: ExportColumn[];
  filename: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "link";
}

const TableExportButton: React.FC<TableExportButtonProps> = ({
  data,
  columns,
  filename,
  className,
  size = "sm",
  variant = "outline",
}) => {
  const { t } = useTranslation("common");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportClick = async (format: "csv" | "excel") => {
    if (!data || data.length === 0) {
      console.warn("No data available for export");
      return;
    }

    setIsExporting(true);
    try {
      const exportOptions = {
        columns,
        data,
        filename: `${filename}_${new Date().toISOString().split("T")[0]}`,
      };

      if (format === "csv") {
        exportToCSV(exportOptions);
      } else {
        await exportToExcel(exportOptions);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const hasData = data && data.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={className}
          disabled={isExporting || !hasData}
          size={size}
          variant={variant}
        >
          {isExporting ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          {isExporting ? t("exporting") : t("export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExportClick("csv")}>
          <FileText className="mr-2 h-4 w-4" />
          {t("exportAs", { format: t("exportFormat.csv") })}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportClick("excel")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {t("exportAs", { format: t("exportFormat.excel") })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableExportButton;
