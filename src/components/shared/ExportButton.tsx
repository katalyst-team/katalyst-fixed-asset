import { FileSpreadsheet, FileText, LoaderCircle } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportFormat, useExport } from "@/hooks/useExport";
import type { ProductFilterOptions } from "@/services/product/getProductService";
import { InboundFilterOptions } from "@/types/inbound";
import { InventoryFilterOptions } from "@/types/inventory";
import {
  InventoryAreaDetailFilterOptions,
  InventoryAreaFilterOptions,
} from "@/types/inventory-area";
import { OutboundFilterOptions } from "@/types/outbound";

type StockMovementFilterOptions = InboundFilterOptions | OutboundFilterOptions;

interface ExportButtonProps {
  type:
    | "inventory"
    | "inventory-area"
    | "inventory-area-detail"
    | "inbound"
    | "outbound"
    | "inbound-packing"
    | "outbound-packing"
    | "st-kering-log"
    | "lamina-log"
    | "penerimaan-log"
    | "st-penerimaan-log-log"
    | "st-basah-log"
    | "inbound-penerimaan-log"
    | "outbound-penerimaan-log"
    | "inbound-st-basah"
    | "outbound-st-basah";
  inventoryFilters?: InventoryFilterOptions;
  stockMovementFilters?: StockMovementFilterOptions;
  stockMovementStoreId?: string;
  stockMovementTypeIds?: string[];
  stockMovementExportLayout?: "default" | "log";
  productFilters?: ProductFilterOptions;
  inventoryAreaStoreId?: string;
  inventoryAreaFilters?: InventoryAreaFilterOptions;
  inventoryAreaDetailStoreId?: string;
  inventoryAreaDetailSectionId?: string;
  inventoryAreaDetailFilters?: InventoryAreaDetailFilterOptions;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  type,
  inventoryFilters,
  stockMovementFilters,
  stockMovementStoreId,
  stockMovementTypeIds,
  stockMovementExportLayout,
  productFilters,
  inventoryAreaStoreId,
  inventoryAreaFilters,
  inventoryAreaDetailStoreId,
  inventoryAreaDetailSectionId,
  inventoryAreaDetailFilters,
  className,
}) => {
  const { t } = useTranslation("common");
  const { handleExport, isExporting, hasData } = useExport({
    inventoryAreaDetailFilters,
    inventoryAreaDetailSectionId,
    inventoryAreaDetailStoreId,
    inventoryAreaFilters,
    inventoryAreaStoreId,
    inventoryFilters,
    productFilters,
    stockMovementExportLayout,
    stockMovementFilters,
    stockMovementStoreId,
    stockMovementTypeIds,
    type,
  });

  const handleExportClick = async (format: ExportFormat) => {
    await handleExport(format);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={className}
          disabled={isExporting || !hasData}
          size="sm"
          variant="outline"
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

export default ExportButton;
