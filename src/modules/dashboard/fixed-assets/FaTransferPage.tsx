"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  History,
  Plus,
  Truck,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { useUser } from "@/context/user-context";
import {
  useConfirmTransferReceiptMutation,
  useGetTransfersQuery,
} from "@/hooks/api/fixed-assets";
import { useUrlFilterSync } from "@/hooks/useUrlFilterSync";
import {
  avatarColor,
  FaKpiStrip,
  FaShellHead,
  FaStat,
  initials,
} from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";

const STAGE_KEYS = [
  "page.transfer.stages.dispatched",
  "page.transfer.stages.inTransit",
  "page.transfer.stages.received",
];

function StageDots({ stage }: { stage: number }) {
  const { t } = useTranslation("fixed-assets");
  return (
    <div className="flex items-center gap-1.5">
      {STAGE_KEYS.map((key, i) => {
        const label = t(key);
        const idx = i + 1;
        const done = idx <= stage;
        return (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className="inline-block rounded-full"
              style={{
                background: done ? "hsl(var(--brand))" : "hsl(var(--surface-2))",
                border: done
                  ? "1px solid hsl(var(--brand))"
                  : "1px solid hsl(var(--border))",
                height: 8,
                width: 8,
              }}
            />
            <span
              style={{
                color: done ? "hsl(var(--text))" : "hsl(var(--text-3))",
                fontSize: 11,
                fontWeight: idx === stage ? 600 : 400,
              }}
            >
              {label}
            </span>
            {idx < STAGE_KEYS.length && (
              <span
                style={{
                  background:
                    idx < stage ? "hsl(var(--brand))" : "hsl(var(--border))",
                  height: 1,
                  width: 14,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FaTransferPage() {
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
  const { data: resp, isError, isLoading } = useGetTransfersQuery({
    limit: PAGE_LIMIT,
    organizationId,
    page,
  });
  const { mutateAsync: confirmReceipt } =
    useConfirmTransferReceiptMutation({ organizationId });
  const transfers = resp?.data?.transfers ?? [];

  const handleNext = () => {
    if (resp?.page_pagination?.has_next) {
      goToPage(page + 1);
    }
  };

  const handlePrev = () => {
    goToPage(Math.max(1, page - 1));
  };
  const inTransit = transfers.filter((t) => t.stage < 3).length;
  const awaitingReceipt = transfers.filter((t) => t.stage === 2).length;

  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button className="ks-btn ks-btn-ghost" type="button">
              <History size={14} />
              {t("actions.history")}
            </button>
            {canCreate && (
              <button
                className="ks-btn ks-btn-primary"
                type="button"
                onClick={() => openModal("transfer")}
              >
                <Plus size={14} />
                {t("actions.newTransfer")}
              </button>
            )}
          </>
        }
        title={t("page.transfer.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.transfer.kpi.inTransit")} tone="brand" value={String(inTransit)} />
        <FaStat label={t("page.transfer.kpi.awaitingReceipt")} tone="warn" value={String(awaitingReceipt)} />
        <FaStat label={t("page.transfer.kpi.thisMonth")} tone="info" value={String(transfers.length)} />
        <FaStat label={t("page.transfer.kpi.crossSite")} tone="success" value="—" />
      </FaKpiStrip>

      <FaQueryState
        emptyDescription={t("page.transfer.noTransfersDesc")}
        emptyTitle={t("page.transfer.noTransfers")}
        isEmpty={transfers.length === 0}
        isError={isError}
        isLoading={isLoading}
        skeleton={<SkeletonTable columns={4} rows={6} />}
      >
      <div className="ks-card">
        <div className="ks-card-head">
          <div>
            <div className="ks-card-title">{t("page.transfer.activeTitle")}</div>
            <div className="ks-card-desc">
              {t("page.transfer.activeDescription", { count: transfers.length })}
            </div>
          </div>
          <button className="ks-btn ks-btn-sm" type="button">
            <Download size={13} />
            {t("actions.export")}
          </button>
        </div>
        <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {transfers.map((tr, i) => (
            <div
              key={tr.id}
              style={{
                alignItems: "center",
                border: "1px solid hsl(var(--border))",
                borderRadius: 10,
                display: "flex",
                gap: 14,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  alignItems: "center",
                  background: "hsl(var(--surface-2))",
                  borderRadius: 8,
                  color: "hsl(var(--text-2))",
                  display: "flex",
                  flexShrink: 0,
                  height: 38,
                  justifyContent: "center",
                  width: 38,
                }}
              >
                <Truck size={16} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
                  <span
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {tr.n}
                  </span>
                  {tr.late && (
                    <span className="ks-badge danger">
                      <Clock size={10} />
                      {t("page.transfer.late")}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                  {tr.n}
                </div>
                <div
                  style={{
                    color: "hsl(var(--text-3))",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {tr.from} <ArrowLeft size={11} style={{ display: "inline", verticalAlign: -1 }} /> {tr.to}
                </div>
              </div>

              <div style={{ flexShrink: 0 }}>
                <StageDots stage={tr.stage} />
              </div>

              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  flexShrink: 0,
                  gap: 8,
                }}
              >
                <div
                  style={{
                    alignItems: "center",
                    background: avatarColor(i),
                    borderRadius: "50%",
                    color: "#fff",
                    display: "flex",
                    fontSize: 11,
                    fontWeight: 700,
                    height: 28,
                    justifyContent: "center",
                    width: 28,
                  }}
                  title={tr.by}
                >
                  {initials(tr.by)}
                </div>
                <span style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>
                  {tr.by}
                </span>
              </div>

              {canManage && tr.stage === 2 ? (
                <button
                  className="ks-btn ks-btn-primary ks-btn-sm"
                  type="button"
                  onClick={() => confirmReceipt({ transferId: tr.id })}
                >
                  <CheckCircle2 size={13} />
                  {t("actions.confirmReceipt")}
                </button>
              ) : tr.stage >= 3 ? (
                <span className="ks-badge success">
                  <CheckCircle2 size={11} />
                  {t("page.transfer.stages.received")}
                </span>
              ) : (
                <span style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>
                  {t("page.transfer.inDispatch")}
                </span>
              )}
            </div>
          ))}
        </div>
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
      </FaQueryState>
    </div>
  );
}
