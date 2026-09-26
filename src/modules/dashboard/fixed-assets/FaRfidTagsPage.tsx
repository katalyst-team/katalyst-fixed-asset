"use client";

import {
  CheckCircle2,
  Download,
  Pencil,
  Plus,
  Printer,
  Search,
  Tag,
  Zap,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import PaginationCursor from "@/components/shared/PaginationCursor";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { useUser } from "@/context/user-context";
import {
  useEncodeRFIDTagMutation,
  useExportDataMutation,
  useGetRfidTagOrdersQuery,
  useGetRFIDTagsQuery,
} from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatActivityTime,
} from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";
import type { FaRfidTag, FaRfidTagOrder } from "@/types/fixed-assets";

const STATUS_TONE: Record<string, string> = {
  active: "success",
  damaged: "warn",
  inactive: "outline",
  lost: "danger",
};

const ORDER_TONE: Record<string, string> = {
  cancelled: "danger",
  placed: "warn",
  received: "success",
};

const rssiTone = (rssi: number): string =>
  rssi >= -50
    ? "hsl(var(--success))"
    : rssi >= -58
      ? "hsl(var(--warn))"
      : "hsl(var(--destructive))";

export function FaRfidTagsPage() {
  const { t } = useTranslation("fixed-assets");
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
  const { data: ordersResp } = useGetRfidTagOrdersQuery({
    limit: 5,
    organizationId,
  });
  const orders: FaRfidTagOrder[] = ordersResp?.data?.orders ?? [];
  const tags = resp?.data?.tags ?? [];
  const activeTags = tags.filter((t) => t.status === "active").length;
  const inactiveTags = tags.filter((t) => t.status === "inactive").length;
  const lostTags = tags.filter((t) => t.status === "lost").length;
  const damagedTags = tags.filter((t) => t.status === "damaged").length;
  const printQueue = tags.filter((t) => !t.printed);

  const handleNext = () => {
    if (resp?.page_pagination?.has_next) {
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
  const { isPending: isExporting, mutateAsync: exportData } =
    useExportDataMutation({ organizationId });

  const handleEncode = async (tag: FaRfidTag) => {
    await encodeTag({ asset_id: tag.asset_id, tag_type: tag.format });
  };

  const handleOpenPrintQueue = () => {
    if (printQueue.length === 0) {
      toast.info(t("page.rfid.noTagsInQueue"));
      return;
    }
    openModal("printTag", { tags: printQueue });
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
                type="button"
                onClick={handleOpenPrintQueue}
              >
                <Printer size={14} />
                {t("actions.printQueue")}
              </button>
            )}
            {canManage && (
              <button
                className="ks-btn ks-btn-sm"
                type="button"
                onClick={() => openModal("registerTag")}
              >
                <Zap size={14} />
                {t("page.rfid.registerTag")}
              </button>
            )}
            {canManage && (
              <button
                className="ks-btn ks-btn-sm"
                type="button"
                onClick={() => openModal("orderStock")}
              >
                <Plus size={14} />
                {t("actions.orderTags")}
              </button>
            )}
            <button
              className="ks-btn ks-btn-ghost ks-btn-sm"
              disabled={isExporting}
              type="button"
              onClick={handleExport}
            >
              <Download size={14} />
              {t("actions.export")}
            </button>
          </>
        }
        desc={t("page.rfid.description")}
        title={t("page.rfid.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.rfid.kpi.activeTags")} tone="brand" value={String(activeTags)} />
        <FaStat label={t("page.rfid.kpi.inactive")} tone="info" value={String(inactiveTags)} />
        <FaStat label={t("page.rfid.kpi.lost")} tone="danger" value={String(lostTags)} />
        <FaStat label={t("page.rfid.kpi.damaged")} tone="warn" value={String(damagedTags)} />
        <FaStat
          label={t("page.rfid.kpi.printQueue")}
          sub={t("page.rfid.kpi.zebraZd621")}
          tone="warn"
          value={String(printQueue.length)}
        />
      </FaKpiStrip>

      <div className="ks-card">
        <div className="ks-card-head">
          <div className="flex items-center gap-2">
            <Printer size={14} />
            <div className="ks-card-title">{t("page.rfid.ordersTitle")}</div>
          </div>
          <span className="ks-badge outline">
            {ordersResp?.page_pagination?.total_records ?? orders.length} {t("page.rfid.total")}
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                {[t("page.rfid.orderColumns.order"), t("page.rfid.orderColumns.supplier"), t("page.rfid.orderColumns.items"), t("page.rfid.orderColumns.qty"), t("page.rfid.orderColumns.status"), t("page.rfid.orderColumns.placed")].map((c) => (
                  <th key={c} className="p-3 text-left font-medium text-muted-foreground">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="border-t border-border p-3 font-mono text-xs">
                    {o.order_no}
                  </td>
                  <td className="border-t border-border p-3">{o.supplier}</td>
                  <td className="border-t border-border p-3 text-muted-foreground">
                    {o.lines
                      .map((l) => `${l.qty}× ${l.tag_type}`)
                      .join(", ")}
                  </td>
                  <td className="border-t border-border p-3 font-medium">
                    {o.total_qty}
                  </td>
                  <td className="border-t border-border p-3">
                    <span className={"ks-badge " + (ORDER_TONE[o.status] ?? "outline")}>
                      {o.status}
                    </span>
                  </td>
                  <td className="border-t border-border p-3 text-xs text-muted-foreground">
                    {formatActivityTime(o.created_at)}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="border-t border-border p-3 text-muted-foreground" colSpan={6}>
                    {t("page.rfid.noOrders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FaQueryState
        emptyDescription={t("page.rfid.noTagsDesc")}
        emptyTitle={t("page.rfid.noTags")}
        isEmpty={tags.length === 0}
        isError={isError}
        isLoading={isLoading}
        skeleton={<SkeletonTable columns={10} rows={8} />}
      >
      <div className="ks-card">
        <div className="ks-card-head">
          <div className="flex items-center gap-2">
            <Tag size={14} />
            <div className="ks-card-title">{t("page.rfid.tagsTitle")}</div>
          </div>
          <div className="ks-search-box">
            <Search size={14} />
            {t("page.rfid.searchPlaceholder")}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  {t("page.rfid.columns.epc")}
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  {t("page.rfid.columns.asset")}
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  {t("page.rfid.columns.format")}
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  {t("page.rfid.columns.tid")}
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  {t("page.rfid.columns.lastRead")}
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  {t("page.rfid.columns.rssi")}
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  {t("page.rfid.columns.status")}
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  {t("page.rfid.columns.notes")}
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  {t("page.rfid.columns.printStatus")}
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">
                  {t("page.rfid.columns.actions")}
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
                      {tag.asset_id}
                    </div>
                  </td>
                  <td className="border-t border-border p-3 text-muted-foreground">
                    {tag.format}
                  </td>
                  <td className="border-t border-border p-3 font-mono text-xs text-muted-foreground">
                    {tag.tid}
                  </td>
                  <td className="border-t border-border p-3 text-muted-foreground">
                    {tag.last_read}
                  </td>
                  <td className="border-t border-border p-3">
                    {tag.rssi === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span
                        className="font-mono text-xs font-medium"
                        style={{ color: rssiTone(tag.rssi) }}
                      >
                        {t("page.rfid.dbm", { value: tag.rssi })}
                      </span>
                    )}
                  </td>
                  <td className="border-t border-border p-3">
                    <span className={"ks-badge " + (STATUS_TONE[tag.status] ?? "outline")}>
                      {tag.status}
                    </span>
                  </td>
                  <td className="max-w-[220px] border-t border-border p-3 text-xs text-muted-foreground">
                    {tag.notes ? (
                      <span title={tag.notes}>{tag.notes}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="border-t border-border p-3">
                    {tag.printed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                        <CheckCircle2 size={13} />
                        {t("page.rfid.printed")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Printer size={13} />
                        {t("page.rfid.queued")}
                      </span>
                    )}
                  </td>
                  <td className="border-t border-border p-3">
                    <div className="flex items-center gap-1">
                      {canManage && (
                        <>
                          <button
                            className="ks-btn ks-btn-ghost ks-btn-sm"
                            disabled={
                              isEncoding && encodingVars?.asset_id === tag.asset_id
                            }
                            type="button"
                            onClick={() => handleEncode(tag)}
                          >
                            <Zap size={13} />
                            {t("actions.encode")}
                          </button>
                          <button
                            aria-label={t("page.rfid.printLabel")}
                            className="ks-btn ks-btn-icon ks-btn-sm"
                            title={t("page.rfid.printLabel")}
                            type="button"
                            onClick={() =>
                              openModal("printTag", { tags: [tag] })
                            }
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            aria-label={t("page.rfid.editTag")}
                            className="ks-btn ks-btn-icon ks-btn-sm"
                            title={t("page.rfid.editTag")}
                            type="button"
                            onClick={() => openModal("editTag", { tag })}
                          >
                            <Pencil size={13} />
                          </button>
                        </>
                      )}
                    </div>
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
          <span>{t("pagination.showing", { current: tags.length, total: resp?.page_pagination?.total_records ?? 0 })}</span>
          <PaginationCursor
            currentPage={page}
            hasNextPage={resp?.page_pagination?.has_next ?? false}
            hasPrevPage={resp?.page_pagination?.has_prev ?? false}
            limit={PAGE_LIMIT}
            totalCount={resp?.page_pagination?.total_records ?? null}
            totalPages={resp?.page_pagination?.total_pages}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>
      </div>
      </FaQueryState>
    </div>
  );
}
