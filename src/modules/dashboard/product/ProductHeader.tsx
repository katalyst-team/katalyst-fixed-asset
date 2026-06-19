import { FileDown, FileUp } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/context/user-context";
import { useGetSkuDataQuery } from "@/hooks/api/sku/useGetSKUDataQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { SkuType } from "@/types/sku";

import { StoreSelector } from "./components/StoreSelector";
import ProductFilter from "./ProductFilter";
import { useProductStore } from "./store";

interface ProductHeaderProps {
  showAllAttributes: boolean;
  onToggleShowAllAttributes: (show: boolean) => void;
  onExportTemplate: () => void;
  onImportExcel: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  showAllAttributes,
  onToggleShowAllAttributes,
  onExportTemplate,
  onImportExcel,
}) => {
  const { hasMultipleStores, tokenPayload, selectedTeam } = useUser();
  const {
    setFilters,
    filters,
    itemLimit,
    setItemLimit,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    currentPage,
  } = useProductStore();
  const { t } = useTranslation(["product", "sku"]);
  const router = useRouter();
  const { canCreate } = usePermissions();

  const [selectedStoreId, setSelectedStoreId] = useState<string>(() => {
    if (filters.assigned_store_id && filters.assigned_store_id !== "0") {
      return filters.assigned_store_id;
    }
    return !hasMultipleStores && selectedTeam && selectedTeam !== "0" ? selectedTeam : "0";
  });

  useEffect(() => {
    if (
      !hasMultipleStores &&
      selectedTeam &&
      selectedTeam !== "0" &&
      selectedStoreId === "0"
    ) {
      setSelectedStoreId(selectedTeam);
      setFilters({ ...filters, assigned_store_id: selectedTeam });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam]);

  const { data: productData } = useGetSkuDataQuery({
    enabled: Boolean(tokenPayload?.organization_id),
    filters: { ...filters, item_status_ids: undefined, limit: itemLimit, type: SkuType.UNIQUE },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const handleCreateProduct = () => {
    router.push("/dashboard/product/create");
  };

  return (
    <div className="flex flex-col lg:flex-row w-full justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <StoreSelector
          filters={filters}
          value={selectedStoreId}
          onChange={setSelectedStoreId}
          onFiltersChange={(newFilters) => {
            setCurrentPage(1);
            setFilters(newFilters);
          }}
        />
        {canCreate && (
          <Button size="sm" onClick={handleCreateProduct}>
            {t("product:modal.addProduct.addButton", {
              defaultValue: t("sku:modal.addSku.addButton"),
            })}
          </Button>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={onExportTemplate}>
                <FileDown className="mr-2 h-4 w-4" />
                {t("sku:exportTemplate.button", "Export Template")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                {t(
                  "sku:exportTemplate.tooltip",
                  "Download an Excel template with attribute columns for a specific category",
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={onImportExcel}>
                <FileUp className="mr-2 h-4 w-4" />
                {t("sku:import.button", "Import Excel")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                {t(
                  "sku:import.tooltip",
                  "Upload an Excel file to bulk create SKUs. Use the template for correct format",
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center space-x-2">
          <Switch
            checked={showAllAttributes}
            id="show-all-attributes"
            onCheckedChange={onToggleShowAllAttributes}
          />
          <Label className="text-sm" htmlFor="show-all-attributes">
            {t("product:table.showAllAttributes", {
              defaultValue: t(
                "sku:table.showAllAttributes",
                "Show All Attributes",
              ),
            })}
          </Label>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ProductFilter />
        <Select
          value={String(itemLimit)}
          onValueChange={(value) => {
            setItemLimit(Number(value));
            setCurrentPage(1);
            setFilters((prev) => ({ ...prev, cursor: undefined }));
          }}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue placeholder="List" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="200">200</SelectItem>
            <SelectItem value="500">500</SelectItem>
            <SelectItem value="1000">1000</SelectItem>
          </SelectContent>
        </Select>
        <PaginationCursor
          currentPage={currentPage}
          hasNextPage={Boolean(productData?.pagination.next_cursor)}
          hasPrevPage={Boolean(productData?.pagination.prev_cursor)}
          limit={itemLimit}
          totalCount={productData?.pagination?.total_count ?? undefined}
          onNext={() => {
            goToNextPage();
            setFilters((prev) => ({
              ...prev,
              cursor: productData?.pagination.next_cursor,
            }));
          }}
          onPrev={() => {
            goToPrevPage();
            setFilters((prev) => ({
              ...prev,
              cursor: productData?.pagination.prev_cursor,
            }));
          }}
        />
      </div>
    </div>
  );
};

export default ProductHeader;
