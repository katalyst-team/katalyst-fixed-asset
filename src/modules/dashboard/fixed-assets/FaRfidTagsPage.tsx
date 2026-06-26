"use client";

import { CheckCircle2, Download, Plus, Printer, Search, Tag, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import PaginationCursor from "@/components/shared/PaginationCursor";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { useUser } from "@/context/user-context";
import {
  useEncodeRFIDTagMutation,
  useExportDataMutation,
  useGetRFIDTagsQuery,
  usePrintRFIDTagsMutation,
} from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
} from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";
import type { FaRfidTag } from "@/types/fixed-assets";

const STATUS_TONE: Record<string, string> = {
  active: "success",
  inactive: "outline",
  lost: "danger",
};

const rssiTone = (rssi: number): string =>
  rssi >= -50
    ? "hsl(var(--success))"
    : rssi >= -58
      ? "hsl(var(--warn))"
      : "hsl(var(--destructive))";

export function FaRfidTagsPage() {
  const { tokenPayload } = useUser();
  const { canManage } = useFaPermission();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [page, setPage] = useState(1);
  const PAGE_LIMIT = 20;
  const { data: resp, isError, isLoading } = useGetRFIDTagsQuery({
    limit: PAGE_LIMIT,
    organizationId,
    page,
  });
  const tags = resp?.data?.tags ?? [];
  const activeTags = tags.filter((t) => t.status === "active").length;
  const inactiveTags = tags.filter((t) => t.status === "inactive").length;
  const lostTags = tags.filter((t) => t.status === "lost").length;
  const printQueue = tags.filter((t) => !t.printed).length;

  const handleNext = () => {
    if (page < (resp?.pagination?.total_pages ?? 1)) {
      setPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };
  const { openModal } = useFaModal();
  const {
    isPending: isEncoding,
    mutateAsync: encodeTag,
    variables: encodingVars,
  } = useEncodeRFIDTagMutation({ organizationId });
  const { isPending: isPrinting, mutateAsync: printTags } =
    usePrintRFIDTagsMutation({ organizationId });
  const { isPending: isExporting, mutateAsync: exportData } =
    useExportDataMutation({ organizationId });

  const handleEncode = async (tag: FaRfidTag) => {
    await encodeTag({ asset_id: tag.assetId, tag_type: tag.format });
  };

  const handlePrintQueue = async () => {
    const queuedIds = tags.filter((t) => !t.printed).map((t) => t.id);
    if (queuedIds.length === 0) {
      toast.info("No tags in the print queue");
      return;
    }
    await printTags({ tag_ids: queuedIds });
  };

  const handleExport = async () => {
    const resp = await exportData({ format: "csv", source: "rfid-tags" });
    if (resp?.data?.download_url) {
      safeOpenUrl(resp.data.download_url);
    }
  };

  return (
    <div>
      <FaShellHead
        actions={
          <>
            {canManage && (
              <button
                className="ks-btn ks-btn-sm"
                disabled={isPrinting}
                type="button"
                onClick={handlePrintQueue}
              >
                <Printer size={14} />
                Print queue
              </button>
            )}
            {canManage && (
              <button
                className="ks-btn ks-btn-sm"
                type="button"
                onClick={() => openModal("orderStock")}
              >
                <Plus size={14} />
                Order tags
              </button>
            )}
            <button
              className="ks-btn ks-btn-ghost ks-btn-sm"
              disabled={isExporting}
              type="button"
              onClick={handleExport}
            >
              <Download size={14} />
              Export
            </button>
          </>
        }
        desc="Encode, print and track EPC / TID identifiers across the fleet"
        title="RFID Tags · Register & Print"
      />

      <FaKpiStrip>
        <FaStat label="Active tags" tone="brand" value={String(activeTags)} />
        <FaStat label="Inactive" tone="info" value={String(inactiveTags)} />
        <FaStat label="Lost" tone="danger" value={String(lostTags)} />
        <FaStat label="Print queue" sub="Zebra ZD621" tone="warn" value={String(printQueue)} />
      </FaKpiStrip>

      <FaQueryState
        emptyDescription="No RFID tags registered yet."
        emptyTitle="No tags found"
        isEmpty={tags.length === 0}
        isError={isError}
        isLoading={isLoading}
        skeleton={<SkeletonTable columns={9} rows={8} />}
      >
      <div className="ks-card">
        <div className="ks-card-head">
          <div className="flex items-center gap-2">
            <Tag size={14} />
            <div className="ks-card-title">RFID tags</div>
          </div>
          <div className="ks-search-box">
            <Search size={14} />
            Search EPC / asset
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  EPC
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Asset
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Format
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  TID
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Last read
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  RSSI
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Print status
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td className="border-t border-border p-3 font-mono text-xs">
                    {tag.epc}
                  </td>
                  <td className="border-t border-border p-3">
                    <div className="font-medium">{tag.asset}</div>
                    <div className="text-xs text-muted-foreground">
                      {tag.assetId}
                    </div>
                  </td>
                  <td className="border-t border-border p-3 text-muted-foreground">
                    {tag.format}
                  </td>
                  <td className="border-t border-border p-3 font-mono text-xs text-muted-foreground">
                    {tag.tid}
                  </td>
                  <td className="border-t border-border p-3 text-muted-foreground">
                    {tag.lastRead}
                  </td>
                  <td className="border-t border-border p-3">
                    {tag.rssi === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span
                        className="font-mono text-xs font-medium"
                        style={{ color: rssiTone(tag.rssi) }}
                      >
                        {tag.rssi} dBm
                      </span>
                    )}
                  </td>
                  <td className="border-t border-border p-3">
                    <span className={"ks-badge " + STATUS_TONE[tag.status]}>
                      {tag.status}
                    </span>
                  </td>
                  <td className="border-t border-border p-3">
                    {tag.printed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                        <CheckCircle2 size={13} />
                        Printed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Printer size={13} />
                        Queued
                      </span>
                    )}
                  </td>
                  <td className="border-t border-border p-3">
                    {canManage && (
                      <button
                        className="ks-btn ks-btn-ghost ks-btn-sm"
                        disabled={
                          isEncoding && encodingVars?.asset_id === tag.assetId
                        }
                        type="button"
                        onClick={() => handleEncode(tag)}
                      >
                        <Zap size={13} />
                        Encode
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="justify-between text-xs text-muted-foreground flex items-center"
          style={{ borderTop: "1px solid hsl(var(--border))", padding: "10px 18px" }}
        >
          <span>Showing {tags.length} of {resp?.pagination?.count ?? 0}</span>
          <PaginationCursor
            currentPage={page}
            hasNextPage={page < (resp?.pagination?.total_pages ?? 1)}
            hasPrevPage={page > 1}
            limit={PAGE_LIMIT}
            totalCount={resp?.pagination?.total_count ?? null}
            totalPages={resp?.pagination?.total_pages}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>
      </div>
      </FaQueryState>
    </div>
  );
}
