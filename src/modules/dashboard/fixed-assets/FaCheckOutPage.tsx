"use client";

import { Clock, Download, History, Plus } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { useUser } from "@/context/user-context";
import {
  useExportDataMutation,
  useGetCheckOutsQuery,
  useReturnCheckOutMutation,
} from "@/hooks/api/fixed-assets";
import { useUrlFilterSync } from "@/hooks/useUrlFilterSync";
import {
  avatarColor,
  catToLucide,
  catToneClass,
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatActivityTime,
} from "@/modules/dashboard/fixed-assets";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";

const STATUS_TONE: Record<string, string> = {
  active: "info",
  overdue: "danger",
  returned: "success",
};

const CONDITION_TONE: Record<string, string> = {
  excellent: "success",
  fair: "warn",
  good: "brand",
};

function statusLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function FaCheckOutPage() {
  const { t } = useTranslation("fixed-assets");
  const { openModal } = useFaModal();
  const { canCreate, canManage } = useFaPermission();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [page, setPage] = useState(1);
  const PAGE_LIMIT = 20;
  const { syncToUrl } = useUrlFilterSync<{ page: number }>({
    fromQuery: (query) => ({ page: Number(query.page) > 0 ? Number(query.page) : 1 }),
    onInit: (f) => setPage(f.page ?? 1),
    toQuery: (f) => (f.page > 1 ? { page: String(f.page) } : {}),
  });
  const goToPage = (p: number) => {
    setPage(p);
    syncToUrl({ page: p });
  };
  const { data: resp, isError, isLoading } = useGetCheckOutsQuery({
    limit: PAGE_LIMIT,
    organizationId,
    page,
  });
  const { mutateAsync: returnAsset } = useReturnCheckOutMutation({
    organizationId,
  });
  const { isPending: isExporting, mutateAsync: exportData } =
    useExportDataMutation({ organizationId });
  const check_outs = resp?.data?.check_outs ?? [];
  const summary = resp?.data?.summary;

  const handleNext = () => {
    if (resp?.page_pagination?.has_next) {
      goToPage(page + 1);
    }
  };

  const handlePrev = () => {
    goToPage(Math.max(1, page - 1));
  };

  const handleExport = async () => {
    const resp = await exportData({ format: "csv", source: "check-outs" });
    if (resp?.data?.download_url) {
      safeOpenUrl(resp.data.download_url);
    }
  };

  return (
    <div className="space-y-4">
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-ghost"
              type="button"
            >
              <History size={15} />
              {t("actions.history")}
            </button>
            {canCreate && (
              <button
                className="ks-btn ks-btn-primary"
                type="button"
                onClick={() => openModal("checkout")}
              >
                <Plus size={15} />
                {t("actions.newCheckout")}
              </button>
            )}
          </>
        }
        desc={t("page.checkout.description")}
        title={t("page.checkout.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.checkout.kpi.activeLoans")} tone="info" value={String(summary?.active ?? "—")} />
        <FaStat label={t("page.checkout.kpi.overdue")} sub={t("page.checkout.kpi.needsAction")} tone="danger" value={String(summary?.overdue ?? "—")} />
        <FaStat label={t("page.checkout.kpi.returnRate")} tone="success" value={summary ? `${Math.round(summary.on_time_rate)}%` : "—"} />
        <FaStat label={t("page.checkout.kpi.avgDuration")} sub={t("page.checkout.kpi.outToReturn")} tone="brand" value={summary ? `${summary.avg_duration_days.toFixed(1)} d` : "—"} />
      </FaKpiStrip>

      <FaQueryState
        emptyDescription={t("page.checkout.noCheckoutsDesc")}
        emptyTitle={t("page.checkout.noCheckouts")}
        isEmpty={check_outs.length === 0}
        isError={isError}
        isLoading={isLoading}
        skeleton={<SkeletonTable columns={7} rows={6} />}
      >
      <div className="ks-card">
        <div className="ks-card-head">
          <div>
            <div className="ks-card-title">{t("page.checkout.recordsTitle")}</div>
            <div className="ks-card-desc">
              {t("page.checkout.recordsDescription", { count: check_outs.length })}
            </div>
          </div>
          <button
            className="ks-btn ks-btn-sm"
            disabled={isExporting}
            type="button"
            onClick={handleExport}
          >
            <Download size={13} />
            {t("actions.export")}
          </button>
        </div>
        <div className="ks-card-body">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-medium text-muted-foreground p-3">{t("page.checkout.columns.asset")}</th>
                <th className="text-left font-medium text-muted-foreground p-3">{t("page.checkout.columns.borrower")}</th>
                <th className="text-left font-medium text-muted-foreground p-3">{t("page.checkout.columns.outDate")}</th>
                <th className="text-left font-medium text-muted-foreground p-3">{t("page.checkout.columns.dueDate")}</th>
                <th className="text-left font-medium text-muted-foreground p-3">{t("page.checkout.columns.purpose")}</th>
                <th className="text-left font-medium text-muted-foreground p-3">{t("page.checkout.columns.condition")}</th>
                <th className="text-left font-medium text-muted-foreground p-3">{t("page.checkout.columns.status")}</th>
              </tr>
            </thead>
            <tbody>
              {check_outs.map((c, i) => {
                const Icon = catToLucide[
                  c.asset_id.startsWith("TL") ? "tool" : c.asset_id.startsWith("IT") ? "it" : "furn"
                ];
                return (
                  <tr key={c.id} className="hover:bg-muted">
                    <td className="p-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Icon size={14} />
                        <div>
                          <div className="font-medium">{c.asset}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">{c.asset_id}</span>
                            <span className={`ks-badge ${catToneClass(c.asset_id.startsWith("TL") ? "tool" : c.asset_id.startsWith("IT") ? "it" : "furn")}`}>
                              {CAT_LABEL[c.asset_id.startsWith("TL") ? "tool" : c.asset_id.startsWith("IT") ? "it" : "furn"]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ background: avatarColor(i) }}
                          title={c.by}
                        >
                          {c.by.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </div>
                        <span>{c.by}</span>
                      </div>
                    </td>
                    <td className="p-3 border-t border-border text-muted-foreground">{formatActivityTime(c.out_date)}</td>
                    <td className="p-3 border-t border-border">
                      <span className={c.status === "overdue" ? "font-medium text-[hsl(var(--destructive))]" : "text-muted-foreground"}>
                        {c.status === "overdue" && <Clock className="mr-1 inline" size={12} />}
                        {formatActivityTime(c.due_date)}
                      </span>
                    </td>
                    <td className="p-3 border-t border-border text-muted-foreground">{c.purpose}</td>
                    <td className="p-3 border-t border-border">
                      <span className={`ks-badge ${CONDITION_TONE[c.condition] ?? "outline"}`}>
                        {c.condition}
                      </span>
                    </td>
                    <td className="p-3 border-t border-border">
                      <span className={`ks-badge ${STATUS_TONE[c.status] ?? "outline"}`}>
                        {statusLabel(c.status)}
                      </span>
                      {canManage && c.status === "active" && (
                        <button
                          className="ml-2 text-xs text-[hsl(var(--brand))] hover:underline"
                          type="button"
                          onClick={() =>
                            returnAsset({
                              checkOutId: c.id,
                              data: {
                                condition: c.condition,
                                return_date: new Date().toISOString(),
                              },
                            })
                          }
                        >
                          {t("actions.return")}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          className="justify-between text-xs text-muted-foreground flex items-center"
          style={{ borderTop: "1px solid hsl(var(--border))", padding: "10px 18px" }}
        >
          <span>{t("page.checkout.showing", { current: check_outs.length, total: resp?.page_pagination?.total_records ?? 0 })}</span>
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
