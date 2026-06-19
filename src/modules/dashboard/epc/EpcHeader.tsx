"use client";

import { ChevronDown, Download, FileDown, FileUp, Search } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useRef, useState } from "react";
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
import { useUser } from "@/context/user-context";
import { usePermissions } from "@/hooks/usePermissions";
import { getRfidDataService } from "@/services/rfid/getRfidDataService";
import { RfidItemType } from "@/types/rfid";
import { exportToExcel, formatDate } from "@/utils/exportUtils";

import {
  EpcImportModal,
  EpcTemplateExportModal,
  ExportProgressDialog,
  StoreSelector,
} from "./components";
import EpcFilter from "./EpcFilter";
import EpcModalAdd from "./EpcModalAdd";
import EpcModalScanRfidsAdd from "./EpcModalAddScanRfids";
import EpcModalScanFind from "./EpcModalScanFind";
import { useEpcStore } from "./store";

const SEARCH_DEBOUNCE_MS = 400;

const getRfidExportColumns = (t: (key: string) => string) => [
  { key: "name", label: t("epc:table.header.name") },
  { key: "epc", label: t("epc:table.header.epcCode") },
  { key: "type", label: t("epc:table.header.type") },
  { key: "category", label: t("epc:table.header.category") },
  { key: "status", label: t("epc:table.header.status") },
  {
    formatter: (v: unknown) => (v ? t("epc:isUsed.yes") : t("epc:isUsed.no")),
    key: "is_used",
    label: t("epc:table.header.isUsed"),
  },
  {
    formatter: formatDate,
    key: "created_at",
    label: t("epc:table.header.createdDate"),
  },
];

interface EpcHeaderProps {
  nextCursor: string | undefined;
  prevCursor: string | undefined;
  totalCount: number | undefined;
}

const EpcHeader: React.FC<EpcHeaderProps> = ({ nextCursor, prevCursor, totalCount }) => {
  const { t } = useTranslation(["epc", "common"]);
  const router = useRouter();
  const { hasMultipleStores, selectedTeam, stores, tokenPayload } = useUser();
  const { canCreate } = usePermissions();
  const {
    currentPage,
    filters,
    goToNextPage,
    goToPrevPage,
    itemLimit,
    resetPagination,
    setCurrentPage,
    setFilters,
    setItemLimit,
  } = useEpcStore();

  const organizationId = tokenPayload?.organization_id ?? "";

  // Derive store value directly from the filter store — single source of truth
  const selectedStoreId = filters.assigned_store_id || "0";

  // Auto-select single-store users (catches cases where stores load after mount)
  useEffect(() => {
    if (!hasMultipleStores && selectedTeam && selectedTeam !== "0" && selectedStoreId === "0") {
      setFilters({ ...filters, assigned_store_id: selectedTeam });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam, stores]);

  const handleStoreChange = (newValue: string) => {
    setFilters({ ...filters, assigned_store_id: newValue === "0" ? undefined : newValue, cursor: undefined });
    resetPagination();
  };

  // Inline search: rfid_name
  const urlRfidInitialized = useRef(false);
  useEffect(() => {
    if (!router.isReady || urlRfidInitialized.current) return;
    urlRfidInitialized.current = true;
    const q = router.query as Record<string, string | undefined>;
    if (q.rfid_name) {
      setRfidNameInput(q.rfid_name);
      setFilters({ ...filters, cursor: undefined, rfid_name: q.rfid_name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const [rfidNameInput, setRfidNameInput] = useState(filters.rfid_name || "");
  const rfidNameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleRfidNameChange = (value: string) => {
    setRfidNameInput(value);
    if (rfidNameTimer.current) clearTimeout(rfidNameTimer.current);
    rfidNameTimer.current = setTimeout(() => {
      setFilters({ ...filters, cursor: undefined, rfid_name: value.trim() || undefined });
      resetPagination();
      const nextQuery = { ...router.query };
      if (value.trim()) {
        nextQuery.rfid_name = value.trim();
      } else {
        delete nextQuery.rfid_name;
      }
      void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
    }, SEARCH_DEBOUNCE_MS);
  };

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [isExportingPage, setIsExportingPage] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState<"fetching" | "processing" | "downloading" | "complete">("fetching");
  const [totalRecords, setTotalRecords] = useState<number>();

  const handleExportRfidData = async (rfids: RfidItemType[]) => {
    setExportStage("processing");
    setExportProgress(60);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const columns = getRfidExportColumns(t);
    const dateStr = new Date().toISOString().split("T")[0];
    setExportStage("downloading");
    setExportProgress(80);
    await exportToExcel({ columns, data: rfids, filename: `rfid_data_${dateStr}`, sheetName: "RFID Data" });
    setExportProgress(100);
    setExportStage("complete");
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const handleExportCurrentPage = async () => {
    const response = await getRfidDataService({
      filters: { ...filters, assigned_store_id: selectedStoreId !== "0" ? selectedStoreId : undefined, limit: itemLimit },
      organizationId,
    });
    const rfids = response?.data?.rfids;
    if (!rfids || rfids.length === 0) { toast.error(t("epc:export.noData")); return; }
    setIsExportingPage(true);
    setExportProgress(0);
    setExportStage("fetching");
    setTotalRecords(rfids.length);
    try {
      setExportProgress(40);
      await new Promise((resolve) => setTimeout(resolve, 200));
      await handleExportRfidData(rfids);
      toast.success(t("epc:export.success"));
    } catch {
      toast.error(t("epc:export.failed"));
    } finally {
      setIsExportingPage(false);
      setTotalRecords(undefined);
    }
  };

  const handleExportAll = async () => {
    setIsExportingAll(true);
    setExportProgress(0);
    setExportStage("fetching");
    try {
      setExportProgress(20);
      const response = await getRfidDataService({
        filters: { ...filters, assigned_store_id: selectedStoreId !== "0" ? selectedStoreId : undefined, limit: 99999 },
        organizationId,
      });
      const rfids = response?.data?.rfids;
      if (!rfids || rfids.length === 0) { toast.error(t("epc:export.noData")); setIsExportingAll(false); return; }
      setTotalRecords(rfids.length);
      setExportProgress(40);
      await handleExportRfidData(rfids);
      toast.success(t("epc:export.successAll", { count: rfids.length }));
    } catch {
      toast.error(t("epc:export.failed"));
    } finally {
      setIsExportingAll(false);
      setTotalRecords(undefined);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full gap-2 mt-4">

        {/* Row 1: Filters (left) | Limit + Pagination (right) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StoreSelector value={selectedStoreId} onChange={handleStoreChange} />
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 w-[180px] pl-8 text-sm"
                placeholder={t("epc:filter.rfidNamePlaceholder", "RFID name...")}
                value={rfidNameInput}
                onChange={(e) => handleRfidNameChange(e.target.value)}
              />
            </div>
            <EpcFilter />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={String(itemLimit)}
              onValueChange={(value) => {
                setItemLimit(Number(value));
                setCurrentPage(1);
                setFilters((prev) => ({ ...prev, cursor: undefined }));
              }}
            >
              <SelectTrigger className="h-9 w-[70px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100, 200, 500, 1000].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <PaginationCursor
              currentPage={currentPage}
              hasNextPage={Boolean(nextCursor)}
              hasPrevPage={Boolean(prevCursor)}
              limit={itemLimit}
              totalCount={totalCount}
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
        </div>

        {/* Row 2: Action buttons (left) | Export/Import (right) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && <EpcModalAdd type="create" />}
            {canCreate && <EpcModalScanRfidsAdd />}
            <EpcModalScanFind />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isExportingPage || isExportingAll} size="sm" variant="outline">
                <Download className="h-4 w-4" />
                {isExportingPage || isExportingAll
                  ? t("common:exporting", "Exporting...")
                  : t("epc:exportImport.button", "Export & Import")}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setIsExportModalOpen(true)}>
                <FileDown className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{t("epc:exportTemplate.button", "Export Template")}</span>
                  <span className="text-xs text-muted-foreground">{t("epc:exportTemplate.description", "Download Excel template")}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsImportModalOpen(true)}>
                <FileUp className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{t("epc:import.button", "Import Excel")}</span>
                  <span className="text-xs text-muted-foreground">{t("epc:import.description", "Bulk create from file")}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={isExportingPage} onClick={handleExportCurrentPage}>
                <Download className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{t("epc:export.currentPage", "Export Current Page")}</span>
                  <span className="text-xs text-muted-foreground">{t("epc:export.currentPageDesc", "Export visible data")}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isExportingAll} onClick={handleExportAll}>
                <Download className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{t("epc:export.allData", "Export All Data")}</span>
                  <span className="text-xs text-muted-foreground">{t("epc:export.allDataDesc", "Export all records")}</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>

      <EpcTemplateExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
      <EpcImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <ExportProgressDialog
        isOpen={isExportingPage || isExportingAll}
        progress={exportProgress}
        stage={exportStage}
        totalRecords={totalRecords}
      />
    </>
  );
};

export default EpcHeader;
