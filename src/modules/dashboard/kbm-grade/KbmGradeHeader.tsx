"use client";

import { ChevronDown, Download, FileDown, FileUp, Plus } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/context/user-context";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { getSkuDataService } from "@/services/sku/getSkuDataService";
import { exportToExcel } from "@/utils/exportUtils";

import { KbmItemImportModal, KbmItemTemplateExportModal } from "../kbm-item";
import { KbmGradeImportModal } from "./components/KbmGradeImportModal";
import { KbmGradeTemplateExportModal } from "./components/KbmGradeTemplateExportModal";
import { useKbmGradeConfig } from "./KbmGradeConfigContext";
import { useKbmGradeStore } from "./store/KbmGradeStore";
import { useKbmGrade } from "./useKbmGrade";
import {
  formatAttributeValues,
  formatNumberValue,
  getAttributeDisplayName,
  getAttributeValue,
  UniqueAttribute,
} from "./utils/attributeUtils";

const SEARCH_DEBOUNCE_MS = 400;

const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface KbmGradeHeaderProps {
  kbmGradeCategoryId: string | undefined;
  nextCursor: string | null;
  prevCursor: string | null;
  totalCount: number | null | undefined;
}

const KbmGradeHeader: React.FC<KbmGradeHeaderProps> = ({
  kbmGradeCategoryId,
  nextCursor,
  prevCursor,
  totalCount,
}) => {
  const { basePath, translationNamespace, title, gradeType } = useKbmGradeConfig();
  const isGradeType = gradeType === "SUSUN" || gradeType === "BATANG";
  const { t } = useTranslation(["common", translationNamespace]);
  const { tokenPayload } = useUser();
  const {
    filters,
    setFilters,
    itemLimit,
    setItemLimit,
    goToNextPage,
    goToPrevPage,
    currentPage,
    resetPagination,
  } = useKbmGradeStore();
  const [searchValue, setSearchValue] = useState(filters.query ?? "");
  const debouncedSearch = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);

  const { kbmGradeData: currentPageData, categoryAttributes } = useKbmGrade();

  const { data: storeData } = useGetStoreDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const stores = useMemo(() => storeData?.data?.stores ?? [], [storeData?.data?.stores]);
  const hasMultipleStores = stores.length > 1;

  // Keep default store selection aligned with current access scope.
  // Multi-store users should always start from "all".
  useEffect(() => {
    if (stores.length === 0) return;

    if (hasMultipleStores && selectedStoreId !== "all") {
      setSelectedStoreId("all");
      return;
    }

    if (!hasMultipleStores) {
      const singleStoreId = stores[0]?.id;
      if (!singleStoreId) return;
      if (selectedStoreId !== singleStoreId) {
        setSelectedStoreId(singleStoreId);
      }
    }
  }, [hasMultipleStores, selectedStoreId, stores]);

  // Sync local state with filters
  useEffect(() => {
    setSearchValue(filters.query ?? "");
  }, [filters.query]);

  // Store filter effect
  useEffect(() => {
    const storeId = selectedStoreId !== "all" ? selectedStoreId : undefined;
    if (filters.assigned_store_id === storeId) return;
    resetPagination();
    setFilters((prev) => ({ ...prev, assigned_store_id: storeId, cursor: undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreId]);

  // Debounced search effect
  useEffect(() => {
    const nextQuery =
      debouncedSearch.trim() === "" ? undefined : debouncedSearch;
    const currentQuery = filters.query ?? undefined;

    if (currentQuery === nextQuery) return;

    resetPagination();
    setFilters((prev) => ({
      ...prev,
      category_ids: kbmGradeCategoryId
        ? [kbmGradeCategoryId]
        : prev.category_ids,
      cursor: undefined,
      query: nextQuery,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleItemLimitChange = (value: string) => {
    setItemLimit(Number(value));
    resetPagination();
    setFilters((prev) => ({ ...prev, cursor: undefined }));
  };

  const buildExportColumns = (attributes: UniqueAttribute[]) => {
    const columns = [
      { key: "name", label: t(`${translationNamespace}:table.header.name`, "Name") },
      { key: "no", label: t(`${translationNamespace}:table.header.no`, "No") },
    ];

    attributes.forEach((attr) => {
      columns.push({
        key: `attr_${attr.id}`,
        label: getAttributeDisplayName(attr.name),
      });
    });

    columns.push({
      key: "status",
      label: t(`${translationNamespace}:table.header.status`, "Status"),
    });

    return columns;
  };

  const formatExportData = (data: typeof currentPageData, attributes: UniqueAttribute[]) => {
    return data.map((item, index) => {
      const row: Record<string, string> = {
        name: item.name,
        no: String(currentPage * itemLimit + index + 1 - itemLimit),
      };

      attributes.forEach((attr) => {
        const attrValues = getAttributeValue(item, attr.id);
        let formattedValue = formatAttributeValues(attrValues);

        if (
          (attr.name === "G_VOL" || attr.name === "G_STD_VOL") &&
          formattedValue !== "-"
        ) {
          formattedValue = formatNumberValue(formattedValue, 4);
        }

        row[`attr_${attr.id}`] = formattedValue;
      });

      row.status = item.status;

      return row;
    });
  };

  const handleExportCurrentPage = async () => {
    if (!currentPageData || currentPageData.length === 0) {
      toast.error(t("common:noDataToExport"));
      return;
    }

    setIsExportingData(true);
    try {
      const dateStr = new Date().toISOString().split("T")[0];
      await exportToExcel({
        columns: buildExportColumns(categoryAttributes),
        data: formatExportData(currentPageData, categoryAttributes),
        filename: `${title.toLowerCase().replace(/\s+/g, "_")}_${dateStr}`,
        sheetName: title,
      });
      toast.success("Export berhasil");
    } catch {
      toast.error("Export gagal");
    } finally {
      setIsExportingData(false);
    }
  };

  const handleExportAll = async () => {
    const organizationId = tokenPayload?.organization_id ?? "";
    if (!organizationId) {
      toast.error("Organization ID not found");
      return;
    }

    setIsExportingData(true);
    try {
      // eslint-disable-next-line
      const { cursor, ...filtersWithoutCursor } = filters;
      const response = await getSkuDataService({
        filters: { ...filtersWithoutCursor, limit: 99999 },
        organizationId,
      });
      const allData = response?.data?.skus ?? [];

      if (allData.length === 0) {
        toast.error(t("common:noDataToExport"));
        return;
      }

      const dateStr = new Date().toISOString().split("T")[0];
      await exportToExcel({
        columns: buildExportColumns(categoryAttributes),
        data: formatExportData(allData, categoryAttributes),
        filename: `${title.toLowerCase().replace(/\s+/g, "_")}_all_${dateStr}`,
        sheetName: title,
      });
      toast.success(`Export berhasil (${allData.length} data)`);
    } catch {
      toast.error("Export gagal");
    } finally {
      setIsExportingData(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 mt-4">
      {/* Title and Add button */}
      <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold font-heading">
          {t(`${translationNamespace}:title`, title)}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isExportingData} size="sm" variant="outline">
                <Download className="h-4 w-4" />
                {isExportingData
                  ? t("common:exporting")
                  : t("common:export")}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem disabled={isExportingData} onClick={handleExportCurrentPage}>
                <Download className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{t("common:exportCurrentPage")}</span>
                  <span className="text-xs text-muted-foreground">{t("common:exportCurrentPageDesc")}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={isExportingData} onClick={handleExportAll}>
                <Download className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{t("common:exportAll")}</span>
                  <span className="text-xs text-muted-foreground">{t("common:exportAllDesc")}</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  {t(
                    `${translationNamespace}:exportTemplate.button`,
                    "Export Template",
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {t(
                    `${translationNamespace}:exportTemplate.tooltip`,
                    "Download an Excel template with grade attributes",
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
                  {t(`${translationNamespace}:import.button`, "Import Excel")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {t(
                    `${translationNamespace}:import.tooltip`,
                    "Upload an Excel file to bulk create grades using the template format",
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row w-full justify-between">
        <div className="flex flex-col lg:flex-row gap-4">
          <Input
            className="lg:max-w-[200px]"
            placeholder={t(
              `${translationNamespace}:filter.searchPlaceholder`,
              `Search ${title}...`,
            )}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger className="lg:max-w-[200px]">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`${basePath}/create`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t(`${translationNamespace}:actions.add`, `Add ${title}`)}
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-2 items-end">
          <Select
            value={String(itemLimit)}
            onValueChange={handleItemLimitChange}
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
            hasNextPage={Boolean(nextCursor)}
            hasPrevPage={Boolean(prevCursor)}
            limit={itemLimit}
            totalCount={totalCount ?? undefined}
            onNext={() => {
              goToNextPage();
              setFilters((prev) => ({ ...prev, cursor: nextCursor }));
            }}
            onPrev={() => {
              goToPrevPage();
              setFilters((prev) => ({ ...prev, cursor: prevCursor }));
            }}
          />
        </div>

        {isGradeType ? (
          <KbmGradeTemplateExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
          />
        ) : (
          <KbmItemTemplateExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
          />
        )}
        {isGradeType ? (
          <KbmGradeImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
          />
        ) : (
          <KbmItemImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default KbmGradeHeader;
