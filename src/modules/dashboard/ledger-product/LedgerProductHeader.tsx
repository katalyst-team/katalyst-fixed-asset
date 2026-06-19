"use client";

import { ChevronDown, Download, Search, Tag } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import PaginationCursor from "@/components/shared/PaginationCursor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/user-context";
import useGetStatusDataQuery from "@/hooks/api/status/useGetStatusDataQuery";
import { AssignStatus, ProductFilterOptions } from "@/services/product/getProductService";
import { getProductService } from "@/services/product/getProductService";
import { exportToExcel } from "@/utils/exportUtils";
import { convertToTitleCase } from "@/utils/text";

import { buildExportColumns } from "./buildExportColumns";
import { StoreSelector } from "./components/StoreSelector";
import LedgerProductFilter from "./LedgerProductFilter";
import { useLedgerProductStore } from "./store";
import { useLedgerProduct } from "./useLedgerProduct";
import { extractUniqueAttributes } from "./utils/attributeUtils";

const SEARCH_DEBOUNCE_MS = 400;

type FilterState = Omit<ProductFilterOptions, "cursor" | "limit">;

const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
};

const LedgerProductHeader: React.FC = () => {
  const { t } = useTranslation(["common", "ledger-product"]);
  const { hasMultipleStores, tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const {
    setFilters,
    filters,
    itemLimit,
    setItemLimit,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    currentPage,
  } = useLedgerProductStore();

  const currentFilters = filters as FilterState;
  const syncFilters = (nextFilters: FilterState): void => {
    setFilters(nextFilters);
  };

  const [isExporting, setIsExporting] = useState(false);
  const [searchValue, setSearchValue] = useState(currentFilters.query ?? "");
  const [internalCodeValue, setInternalCodeValue] = useState(
    currentFilters.internal_code ?? "",
  );

  const [assignStatus, setAssignStatus] = useState<AssignStatus | "ALL">(
    currentFilters.assign_status ?? "ALL",
  );
  const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>(
    currentFilters.item_status_ids ?? [],
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string>(() => {
    if (currentFilters.assigned_store_id && currentFilters.assigned_store_id !== "0") {
      return currentFilters.assigned_store_id;
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
      syncFilters({
        ...currentFilters,
        assigned_store_id: selectedTeam,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam]);

  const debouncedSearch = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS);
  const debouncedInternalCode = useDebouncedValue(
    internalCodeValue,
    SEARCH_DEBOUNCE_MS,
  );

  const { ledgerProductData: currentPageData, paginationData } = useLedgerProduct();
  const { data: statusData } = useGetStatusDataQuery({
    organizationId,
  });

  const uniqueAttributes = extractUniqueAttributes(currentPageData);

  const handleAssignStatusChange = (value: AssignStatus | "ALL") => {
    setAssignStatus(value);
    setCurrentPage(1);
    syncFilters({
      ...currentFilters,
      assign_status: value === "ALL" ? undefined : value,
    });
  };

  const handleStatusIdToggle = (statusId: string) => {
    const newSelectedIds = selectedStatusIds.some(
      (id) => String(id) === String(statusId),
    )
      ? selectedStatusIds.filter((id) => String(id) !== String(statusId))
      : [...selectedStatusIds, statusId];

    setSelectedStatusIds(newSelectedIds);
    setCurrentPage(1);
    syncFilters({
      ...currentFilters,
      item_status_ids: newSelectedIds.length > 0 ? newSelectedIds : undefined,
    });
  };

  const selectedStatusCount = selectedStatusIds.length;

  useEffect(() => {
    setCurrentPage(1);
    syncFilters({
      ...currentFilters,
      internal_code: debouncedInternalCode || undefined,
      query: debouncedSearch || undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInternalCode, debouncedSearch]);

  const handleExportCurrentPage = async () => {
    const skus = currentPageData;
    if (!skus || skus.length === 0) {
      toast.error("No data to export");
      return;
    }
    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().split("T")[0];
      await exportToExcel({
        columns: buildExportColumns(t, uniqueAttributes),
        data: skus,
        filename: `ledger_product_${dateStr}`,
        sheetName: "Ledger Product",
      });
      toast.success("Export berhasil");
    } catch {
      toast.error("Export gagal");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const response = await getProductService({
        filters: { ...filters, limit: 99999 },
        organizationId,
      });
      const skus = response?.data?.skus;
      if (!skus || skus.length === 0) {
        toast.error("No data to export");
        return;
      }
      const allUniqueAttributes = extractUniqueAttributes(skus);
      const dateStr = new Date().toISOString().split("T")[0];
      await exportToExcel({
        columns: buildExportColumns(t, allUniqueAttributes),
        data: skus,
        filename: `ledger_product_all_${dateStr}`,
        sheetName: "Ledger Product",
      });
      toast.success(`Export berhasil (${skus.length} data)`);
    } catch {
      toast.error("Export gagal");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-2">

      {/* Row 1: Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm">
        <StoreSelector
          value={selectedStoreId}
          onChange={(newValue) => {
            setSelectedStoreId(newValue);
            setCurrentPage(1);
            syncFilters({
              ...filters,
              assigned_store_id: newValue === "0" ? undefined : newValue,
            });
          }}
        />

        <Separator className="h-5" orientation="vertical" />

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="h-8 w-[180px] pl-8 text-sm"
            placeholder={t("ledger-product:filter.searchPlaceholder", "Search products...")}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />

        </div>

        <div className="relative">
          <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="h-8 w-[170px] pl-8 text-sm"
            placeholder={t("ledger-product:filter.internalCodePlaceholder", "Internal code...")}
            value={internalCodeValue}
            onChange={(event) => setInternalCodeValue(event.target.value)}
          />

        </div>

        <Separator className="h-5" orientation="vertical" />

        <Select
          value={assignStatus}
          onValueChange={(value) =>
            handleAssignStatusChange(value as AssignStatus | "ALL")
          }
        >
          <SelectTrigger className="h-8 w-[140px] text-sm">
            <SelectValue placeholder={t("ledger-product:filter.selectAssignStatus", "Assign Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {t("ledger-product:filter.allStatuses", "All Statuses")}
            </SelectItem>
            <SelectItem value="UNASSIGNED">
              {t("ledger-product:filter.unassigned", "Unassigned")}
            </SelectItem>
            <SelectItem value="ASSIGNED">
              {t("ledger-product:filter.assigned", "Assigned")}
            </SelectItem>
          </SelectContent>
        </Select>

        {statusData?.data?.statuses && statusData.data.statuses.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button className="h-8 text-sm" size="sm" variant="outline">
                {t("ledger-product:filter.itemStatus", "Item Status")}
                {selectedStatusCount > 0 && (
                  <Badge className="ml-1.5 h-4 min-w-4 px-1 text-[10px]" variant="secondary">
                    {selectedStatusCount}
                  </Badge>
                )}
                <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[200px] p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t("ledger-product:filter.itemStatus", "Item Status")}
              </p>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {statusData.data.statuses.map((statusItem) => (
                  <label
                    key={statusItem.id}
                    className="flex items-center gap-2 cursor-pointer rounded px-1 py-0.5 hover:bg-muted/50"
                    htmlFor={`header-status-${statusItem.id}`}
                  >
                    <Checkbox
                      checked={selectedStatusIds.some(
                        (id) => String(id) === String(statusItem.id),
                      )}
                      id={`header-status-${statusItem.id}`}
                      onCheckedChange={() => handleStatusIdToggle(statusItem.id)}
                    />
                    <span className="text-sm">{convertToTitleCase(statusItem.name)}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        <LedgerProductFilter
          onFiltersChange={(partial) => syncFilters({ ...currentFilters, ...partial })}
        />

      </div>

      {/* Row 2: Export + Pagination */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={isExporting} size="sm" variant="outline">
              <Download className="h-4 w-4" />
              {isExporting
                ? t("common:exporting", "Exporting...")
                : t("common:export", "Export")}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem disabled={isExporting} onClick={handleExportCurrentPage}>
              <Download className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{t("common:exportCurrentPage", "Export Current Page")}</span>
                <span className="text-xs text-muted-foreground">{t("common:exportCurrentPageDesc", "Export visible data")}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isExporting} onClick={handleExportAll}>
              <Download className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{t("common:exportAll", "Export All Data")}</span>
                <span className="text-xs text-muted-foreground">{t("common:exportAllDesc", "Export all records")}</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-2">
          <PaginationCursor
            currentPage={currentPage}
            hasNextPage={Boolean(paginationData?.next_cursor)}
            hasPrevPage={Boolean(paginationData?.prev_cursor)}
            limit={itemLimit}
            totalCount={paginationData?.total_count ?? undefined}
            onNext={() => {
              goToNextPage();
              setFilters((prev) => ({
                ...prev,
                cursor: paginationData?.next_cursor ?? undefined,
              }));
            }}
            onPrev={() => {
              goToPrevPage();
              setFilters((prev) => ({
                ...prev,
                cursor: paginationData?.prev_cursor ?? undefined,
              }));
            }}
          />

          <Separator className="h-5" orientation="vertical" />

          <Select
            value={String(itemLimit)}
            onValueChange={(value) => {
              setItemLimit(Number(value));
              setCurrentPage(1);
              setFilters((prev) => ({ ...prev, cursor: undefined }));
            }}
          >
            <SelectTrigger className="h-8 w-[72px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100, 200, 500, 1000].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground whitespace-nowrap">/ page</span>
        </div>
      </div>
    </div>
  );
};

export default LedgerProductHeader;
