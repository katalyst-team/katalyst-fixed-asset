"use client";

import {
  Ban,
  CheckCircle2,
  DollarSign,
  Download,
  FileText,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { useUser } from "@/context/user-context";
import {
  useApproveDisposalMutation,
  useExportDataMutation,
  useGenerateBastMutation,
  useGetDisposalsQuery,
  usePostDisposalJournalEntryMutation,
  useRejectDisposalMutation,
  useReviseDisposalMutation,
} from "@/hooks/api/fixed-assets";
import { useUrlFilterSync } from "@/hooks/useUrlFilterSync";
import {
  catToLucide,
  catToneClass,
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatIDR,
} from "@/modules/dashboard/fixed-assets";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("approv") || s.includes("signed")) return "success";
  if (s.includes("review") || s.includes("head")) return "warn";
  return "info";
}

export function FaScanOutPage() {
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
  const { data: resp, isError, isLoading } = useGetDisposalsQuery({
    limit: PAGE_LIMIT,
    organizationId,
    page,
  });
  const { mutateAsync: approveDisposal } = useApproveDisposalMutation({
    organizationId,
  });
  const { mutateAsync: rejectDisposal } = useRejectDisposalMutation({
    organizationId,
  });
  const { mutateAsync: reviseDisposal } = useReviseDisposalMutation({
    organizationId,
  });
  const { mutateAsync: generateBast } = useGenerateBastMutation({
    organizationId,
  });
  const { mutateAsync: postDisposalJE } = usePostDisposalJournalEntryMutation({
    organizationId,
  });
  const { isPending: isExporting, mutateAsync: exportData } =
    useExportDataMutation({ organizationId });
  const disposals = resp?.data?.disposals ?? [];
  const summary = resp?.data?.summary;
  const awaitingApproval = disposals.filter((d) => !d.status.toLowerCase().includes("approv") && !d.status.toLowerCase().includes("signed")).length;
  const recoveryYTD = disposals.reduce((sum, d) => sum + d.rec, 0);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const item = disposals[selectedIdx] ?? disposals[0];

  if (!item) {
    return (
      <div className="space-y-4">
        <FaShellHead
          actions={
            canCreate ? (
              <button
                className="ks-btn ks-btn-primary"
                type="button"
                onClick={() => openModal("disposal")}
              >
                <Plus size={15} />
                {t("actions.newDisposal")}
              </button>
            ) : null
          }
          desc={t("page.scanout.description")}
          title={t("page.scanout.title")}
        />
        <div className="ks-card">
          <div className="ks-card-body">
            <p className="text-sm text-muted-foreground">{t("page.scanout.noDisposalsInQueue")}</p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = catToLucide[item.cat] ?? catToLucide.furn;
  const approvalHistory = item.approval_history ?? [];
  // Mirrors the exact lines POST /disposals/:id/journal-entry will post
  // (core/fixed_asset/fixed_asset_service/disposal.go JournalEntry) — this is a
  // preview, not the source of truth, so it must stay in lockstep with the backend.
  const accumDepDebit = item.nbv - item.rec;

  const handleGenerateBast = async () => {
    await generateBast({ disposalId: item.id });
  };

  const handlePostJE = async () => {
    await postDisposalJE({ disposalId: item.id });
  };

  const handleExport = async () => {
    const resp = await exportData({ format: "csv", source: "disposals" });
    if (resp?.data?.download_url) {
      safeOpenUrl(resp.data.download_url);
    }
  };

  const handleNext = () => {
    if (resp?.page_pagination?.has_next) {
      goToPage(page + 1);
      setSelectedIdx(0);
    }
  };

  const handlePrev = () => {
    goToPage(Math.max(1, page - 1));
    setSelectedIdx(0);
  };

  return (
    <div className="space-y-4">
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-ghost"
              disabled={isExporting}
              type="button"
              onClick={handleExport}
            >
              <Download size={15} />
              {t("actions.export")}
            </button>
            {canManage && (
              <button
                className="ks-btn ks-btn-ghost"
                type="button"
                onClick={handleGenerateBast}
              >
                <FileText size={15} />
                {t("actions.bastPdf")}
              </button>
            )}
            {canCreate && (
              <button
                className="ks-btn ks-btn-primary"
                type="button"
                onClick={() => openModal("disposal")}
              >
                <Plus size={15} />
                {t("actions.newDisposal")}
              </button>
            )}
          </>
        }
        desc={t("page.scanout.description")}
        title={t("page.scanout.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.scanout.kpi.thisMonth")} sub={t("page.scanout.kpi.disposals")} tone="info" value={String(disposals.length)} />
        <FaStat label={t("page.scanout.kpi.awaitingApproval")} sub={t("page.scanout.kpi.pending")} tone="warn" value={String(awaitingApproval)} />
        <FaStat label={t("page.scanout.kpi.recoveryYtd")} tone="success" value={recoveryYTD > 0 ? formatIDR(recoveryYTD) : "—"} />
        <FaStat label={t("page.scanout.kpi.taxImpact")} sub={t("page.scanout.kpi.nbvWriteoff")} tone="danger" value={summary && summary.total_nbv > 0 ? formatIDR(summary.total_nbv) : "—"} />
      </FaKpiStrip>

      <FaQueryState
        emptyDescription={t("page.scanout.noDisposalsDesc")}
        emptyTitle={t("page.scanout.noDisposals")}
        isEmpty={!item}
        isError={isError}
        isLoading={isLoading}
        skeleton={<SkeletonTable columns={5} rows={6} />}
      >
      <div className="ks-grid-2">
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{t("page.scanout.queueTitle")}</div>
              <div className="ks-card-desc">{t("page.scanout.queueDescription", { count: disposals.length })}</div>
            </div>
          </div>
          <div className="ks-card-body">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left font-medium text-muted-foreground p-3">{t("page.scanout.columns.asset")}</th>
                  <th className="text-left font-medium text-muted-foreground p-3">{t("page.scanout.columns.reason")}</th>
                  <th className="text-right font-medium text-muted-foreground p-3">{t("page.scanout.columns.nbv")}</th>
                  <th className="text-right font-medium text-muted-foreground p-3">{t("page.scanout.columns.recovery")}</th>
                  <th className="text-left font-medium text-muted-foreground p-3">{t("page.scanout.columns.status")}</th>
                </tr>
              </thead>
              <tbody>
                {disposals.map((d, i) => {
                  const DIcon = catToLucide[d.cat] ?? catToLucide.furn;
                  return (
                    <tr
                      key={d.id}
                      className={`cursor-pointer ${i === selectedIdx ? "bg-[hsl(var(--brand)/0.06)]" : "hover:bg-muted"}`}
                      onClick={() => setSelectedIdx(i)}
                    >
                      <td className="p-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <DIcon size={14} />
                          <div>
                            <div className="font-medium">{d.a}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 border-t border-border text-muted-foreground">{d.reason}</td>
                      <td className="p-3 border-t border-border text-right">{d.nbv > 0 ? formatIDR(d.nbv) : "—"}</td>
                      <td className="p-3 border-t border-border text-right">{d.rec > 0 ? formatIDR(d.rec) : "—"}</td>
                      <td className="p-3 border-t border-border">
                        <span className={`ks-badge ${statusBadgeClass(d.status)}`}>{d.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex flex-row flex-1 justify-end items-end w-full">
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
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{t("page.scanout.detailTitle")}</div>
              <div className="ks-card-desc">{t("page.scanout.detailDescription", { id: item.a })}</div>
            </div>
          </div>
          <div className="ks-card-body space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.a}</span>
                  <span className={`ks-badge ${catToneClass(item.cat)}`}>{CAT_LABEL[item.cat]}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.reason}</p>
              </div>
            </div>

            <div className="ks-grid-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{t("page.scanout.netBookValue")}</p>
                <p className="mt-1 text-lg font-bold">{formatIDR(item.nbv)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{t("page.scanout.recoveryValue")}</p>
                <p className="mt-1 text-lg font-bold text-[hsl(var(--success))]">
                  {item.rec > 0 ? formatIDR(item.rec) : "—"}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">{t("page.scanout.approvalFlow")}</p>
              {approvalHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("page.scanout.noApprovalActions")}</p>
              ) : (
                <div className="space-y-0">
                  {approvalHistory.map((s, i) => (
                    <div key={`${s.stage}-${s.acted_at}`} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white">
                          <CheckCircle2 size={14} />
                        </div>
                        {i < approvalHistory.length - 1 && (
                          <div className="my-0.5 w-px flex-1 bg-[hsl(var(--brand))]" style={{ minHeight: 18 }} />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium text-foreground">
                          {s.stage} · {s.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{s.approver} · {s.acted_at}</p>
                        {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center gap-2">
                <DollarSign size={14} />
                <span className="text-xs font-medium text-muted-foreground">{t("page.scanout.journalEntryPreview")}</span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span>Dr. {t("page.scanout.accumDep")}</span>
                  <span className="font-semibold">{formatIDR(accumDepDebit)}</span>
                </div>
                {item.rec > 0 && (
                  <div className="flex justify-between">
                    <span>Dr. {t("page.scanout.cashBank")}</span>
                    <span className="font-semibold">{formatIDR(item.rec)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-1">
                  <span>Cr. {t("page.scanout.fixedAssetsCost")}</span>
                  <span className="font-semibold">{formatIDR(item.nbv)}</span>
                </div>
              </div>
              {canManage && (
                <button
                  className="ks-btn ks-btn-ghost mt-3 w-full"
                  type="button"
                  onClick={handlePostJE}
                >
                  <DollarSign size={15} />
                  {t("actions.postJe")}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {canManage && (
                <button
                  className="ks-btn ks-btn-ghost"
                  type="button"
                  onClick={() => reviseDisposal({ disposalId: item.id, notes: "Revision requested" })}
                >
                  <RefreshCw size={15} />
                  {t("actions.revise")}
                </button>
              )}
              {canManage && (
                <button
                  className="ks-btn ks-btn-ghost"
                  type="button"
                  onClick={() => rejectDisposal({ disposalId: item.id, reason: "Rejected by reviewer" })}
                >
                  <Ban size={15} />
                  {t("actions.reject")}
                </button>
              )}
              {canManage && (
                <button
                  className="ks-btn ks-btn-primary"
                  type="button"
                  onClick={() => approveDisposal({ disposalId: item.id })}
                >
                  <CheckCircle2 size={15} />
                  {t("actions.approve")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      </FaQueryState>
    </div>
  );
}
