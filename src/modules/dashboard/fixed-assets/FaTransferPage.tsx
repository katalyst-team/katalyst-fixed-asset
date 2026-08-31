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
import { useState } from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import SkeletonTable from "@/components/shared/SkeletonTable";
import { useUser } from "@/context/user-context";
import {
  useConfirmTransferReceiptMutation,
  useGetTransfersQuery,
} from "@/hooks/api/fixed-assets";
import {
  avatarColor,
  FaKpiStrip,
  FaShellHead,
  FaStat,
  initials,
} from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";

const STAGES = ["Dispatched", "In-transit", "Received"];

function StageDots({ stage }: { stage: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {STAGES.map((label, i) => {
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
            {idx < STAGES.length && (
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
  const { openModal } = useFaModal();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [page, setPage] = useState(1);
  const PAGE_LIMIT = 20;
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
      setPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
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
              History
            </button>
            <button
              className="ks-btn ks-btn-primary"
              type="button"
              onClick={() => openModal("transfer")}
            >
              <Plus size={14} />
              New transfer
            </button>
          </>
        }
        title="Asset Transfers"
      />

      <FaKpiStrip>
        <FaStat label="In transit" tone="brand" value={String(inTransit)} />
        <FaStat label="Awaiting receipt" tone="warn" value={String(awaitingReceipt)} />
        <FaStat label="This month" tone="info" value={String(transfers.length)} />
        <FaStat label="Cross-site" tone="success" value="—" />
      </FaKpiStrip>

      <FaQueryState
        emptyDescription="No transfers in progress."
        emptyTitle="No transfers"
        isEmpty={transfers.length === 0}
        isError={isError}
        isLoading={isLoading}
        skeleton={<SkeletonTable columns={4} rows={6} />}
      >
      <div className="ks-card">
        <div className="ks-card-head">
          <div>
            <div className="ks-card-title">Active Transfers</div>
            <div className="ks-card-desc">
              {transfers.length} movements in progress · RFID-tracked chain of custody
            </div>
          </div>
          <button className="ks-btn ks-btn-sm" type="button">
            <Download size={13} />
            Export
          </button>
        </div>
        <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {transfers.map((t, i) => (
            <div
              key={t.id}
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
                    {t.n}
                  </span>
                  {t.late && (
                    <span className="ks-badge danger">
                      <Clock size={10} />
                      Late
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                  {t.n}
                </div>
                <div
                  style={{
                    color: "hsl(var(--text-3))",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {t.from} <ArrowLeft size={11} style={{ display: "inline", verticalAlign: -1 }} /> {t.to}
                </div>
              </div>

              <div style={{ flexShrink: 0 }}>
                <StageDots stage={t.stage} />
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
                  title={t.by}
                >
                  {initials(t.by)}
                </div>
                <span style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>
                  {t.by}
                </span>
              </div>

              {t.stage === 2 ? (
                <button
                  className="ks-btn ks-btn-primary ks-btn-sm"
                  type="button"
                  onClick={() => confirmReceipt({ transferId: t.id })}
                >
                  <CheckCircle2 size={13} />
                  Confirm receipt
                </button>
              ) : t.stage >= 3 ? (
                <span className="ks-badge success">
                  <CheckCircle2 size={11} />
                  Received
                </span>
              ) : (
                <span style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>
                  In dispatch
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
