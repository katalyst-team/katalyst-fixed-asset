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

import { SkuImportModal } from "./components/SkuImportModal";
import { SkuTemplateExportModal } from "./components/SkuTemplateExportModal";
import { StoreSelector } from "./components/StoreSelector";
import SkuFilter from "./SkuFilter";
import { useSkuStore } from "./store";

interface SkuHeaderProps {
  showAllAttributes: boolean;
  onToggleShowAllAttributes: (show: boolean) => void;
}

const SkuHeader: React.FC<SkuHeaderProps> = ({
  showAllAttributes,
  onToggleShowAllAttributes,
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
  } = useSkuStore();
  const { t } = useTranslation(["sku"]);
  const router = useRouter();
  const { canCreate } = usePermissions();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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

  const { data: skuData } = useGetSkuDataQuery({
    filters: filters,
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const handleCreateSku = () => {
    router.push("/dashboard/sku/create");
  };

  return (
    <>
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
            <Button size="sm" onClick={handleCreateSku}>
              {t("sku:modal.addSku.addButton")}
            </Button>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsExportModalOpen(true)}
                >
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsImportModalOpen(true)}
                >
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
              {t("sku:table.showAllAttributes", "Show All Attributes")}
            </Label>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SkuFilter />
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
            hasNextPage={Boolean(skuData?.pagination.next_cursor)}
            hasPrevPage={Boolean(skuData?.pagination.prev_cursor)}
            limit={itemLimit}
            totalCount={skuData?.pagination?.total_count ?? undefined}
            onNext={() => {
              goToNextPage();
              setFilters((prev) => ({
                ...prev,
                cursor: skuData?.pagination.next_cursor,
              }));
            }}
            onPrev={() => {
              goToPrevPage();
              setFilters((prev) => ({
                ...prev,
                cursor: skuData?.pagination?.prev_cursor,
              }));
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <SkuTemplateExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      <SkuImportModal
        allowedSkuTypes={[SkuType.COMMON]}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
};

export default SkuHeader;
