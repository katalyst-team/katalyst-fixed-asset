"use client";

import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  PlayCircle,
  Shield,
  User,
} from "lucide-react";

import { useUser } from "@/context/user-context";
import {
  useAuditSignOffMutation,
  useGetAuditReportMutation,
  useGetAuditZonesQuery,
  usePostAuditAdjustmentMutation,
  useResumeAuditSweepMutation,
} from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaMeter,
  FaShellHead,
  FaStat,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";
import type {
  AuditSignOffRequest,
  FaAuditSignOffRole,
  FaJournalEntryLine,
  PostAuditAdjustmentRequest,
} from "@/types/fixed-assets";

interface SignoffItem {
  done: boolean;
  label: string;
  role: FaAuditSignOffRole;
  who: string;
}

const ACTIVE_ZONE_ID = "BDG-WH-Bay-2";
const AUDIT_ID = "Q4-2025";

const SIGNOFFS: SignoffItem[] = [
  { done: true, label: "Stock count lead", role: "stock_count_lead", who: "Rahmat S." },
  { done: true, label: "Department head", role: "dept_head", who: "Dewi A." },
  { done: true, label: "Internal audit", role: "internal_audit", who: "Surya D." },
  { done: true, label: "Finance manager", role: "finance_manager", who: "Ratna I." },
  { done: false, label: "External accountant", role: "external_accountant", who: "KAP Tanjung" },
];

const JOURNAL_LINES = [
  { acc: "1.500 · Aset Tetap — Peralatan", amt: "-5.200.000", dr: false },
  { acc: "7.120 · Beban Selisih Stok", amt: "5.200.000", dr: true },
  { acc: "1.500 · Aset Tetap — Kendaraan", amt: "-4.200.000", dr: false },
  { acc: "7.120 · Beban Selisih Stok", amt: "4.200.000", dr: true },
];

export function FaAuditPage() {
  const { tokenPayload } = useUser();
  const { canManage } = useFaPermission();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetAuditZonesQuery({ organizationId });
  const { mutateAsync: signOff } = useAuditSignOffMutation({ organizationId });
  const { mutateAsync: postAdjustment } = usePostAuditAdjustmentMutation({
    organizationId,
  });
  const { mutateAsync: resumeSweep } = useResumeAuditSweepMutation({
    organizationId,
  });
  const { mutateAsync: getAuditReport } = useGetAuditReportMutation({
    organizationId,
  });
  const zones = resp?.data?.zones ?? [];
  const countedTotal = zones.reduce((sum, z) => sum + z.f, 0);
  const varianceCount = zones.filter((z) => typeof z.v === "number" && z.v !== 0).length;
  const nbvImpact = zones.reduce((sum, z) => sum + (typeof z.nbv === "number" ? z.nbv : 0), 0);
  const zonesRemaining = zones.filter((z) => z.tone !== "success").length;
  const signoffDone = SIGNOFFS.filter((s) => s.done).length;

  const handlePostToGl = async () => {
    const lines: FaJournalEntryLine[] = JOURNAL_LINES.map((l) => {
      const amount = Math.abs(parseInt(l.amt.replace(/\./g, ""), 10) || 0);
      return {
        account: l.acc,
        credit: l.dr ? 0 : amount,
        debit: l.dr ? amount : 0,
        description: "Audit variance adjustment",
      };
    });
    const data: PostAuditAdjustmentRequest = {
      lines,
      zone_id: ACTIVE_ZONE_ID,
    };
    await postAdjustment({ auditId: AUDIT_ID, data });
  };

  const handleResumeSweep = async () => {
    await resumeSweep({ auditId: AUDIT_ID, zone_id: ACTIVE_ZONE_ID });
  };

  const handleAuditReport = async () => {
    const reportResp = await getAuditReport({ auditId: AUDIT_ID });
    if (reportResp?.data?.download_url) {
      safeOpenUrl(reportResp.data.download_url);
    }
  };

  const handleSignOff = async (role: FaAuditSignOffRole) => {
    const data: AuditSignOffRequest = {
      role,
      signature:
        [tokenPayload?.first_name, tokenPayload?.last_name]
          .filter(Boolean)
          .join(" ") || tokenPayload?.email || "",
      user_id: tokenPayload?.account_id ?? "",
    };
    await signOff({ auditId: AUDIT_ID, data });
  };

  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn"
              type="button"
              onClick={handleAuditReport}
            >
              <FileText size={14} />
              Audit report PDF
            </button>
            {canManage && (
              <button
                className="ks-btn ks-btn-primary"
                type="button"
                onClick={handleResumeSweep}
              >
                <PlayCircle size={14} />
                Continue sweep
              </button>
            )}
          </>
        }
        title="Stock Audit · Q4 2025"
      />

      <div
        className="ks-card"
        style={{ marginBottom: 16, padding: "16px 18px" }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: "1 1 320px", minWidth: 240 }}>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <Shield size={16} style={{ color: "hsl(var(--brand))" }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Physical count sweep in progress
              </span>
              <span className="ks-badge brand">Live</span>
            </div>
            <div
              style={{
                alignItems: "center",
                color: "hsl(var(--text-2))",
                display: "flex",
                fontSize: 13,
                gap: 16,
                marginBottom: 10,
              }}
            >
              <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>
                22 of 28 zones
              </span>
              <span style={{ alignItems: "center", display: "inline-flex", gap: 4 }}>
                <Clock size={12} />
                Day 3 · 14:42
              </span>
              <span style={{ alignItems: "center", display: "inline-flex", gap: 4 }}>
                <User size={12} />
                Auditor: Rahmat S.
              </span>
            </div>
            <FaMeter pct={78} tone="brand" />
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              78%
            </div>
            <div style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>
              6 zones remaining
            </div>
          </div>
        </div>
      </div>

      <FaKpiStrip>
        <FaStat label="Counted" sub="physical units" tone="brand" value={String(countedTotal)} />
        <FaStat label="Variances found" tone="warn" value={String(varianceCount)} />
        <FaStat
          label="Impact NBV"
          sub="net book value"
          tone="danger"
          value={nbvImpact !== 0 ? formatIDRShort(nbvImpact) : "—"}
        />
        <FaStat label="Zones remaining" tone="info" value={String(zonesRemaining)} />
        <FaStat label="Sign-off" sub={`${signoffDone} of ${SIGNOFFS.length} done`} tone="success" value={`${signoffDone}/${SIGNOFFS.length}`} />
      </FaKpiStrip>

      <FaQueryState
        isEmpty={zones.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
      <div className="ks-grid-2">
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">Reconciliation</div>
              <div className="ks-card-desc">
                System vs physical count · per zone
              </div>
            </div>
            <button className="ks-btn ks-btn-sm" type="button">
              <Download size={13} />
              Export
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-medium text-muted-foreground p-3">
                  Zone
                </th>
                <th className="text-left font-medium text-muted-foreground p-3">
                  System
                </th>
                <th className="text-left font-medium text-muted-foreground p-3">
                  Physical
                </th>
                <th className="text-left font-medium text-muted-foreground p-3">
                  Var.
                </th>
                <th className="text-left font-medium text-muted-foreground p-3">
                  NBV Δ
                </th>
                <th className="text-left font-medium text-muted-foreground p-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.z}>
                  <td className="p-3 border-t border-border">{z.z}</td>
                  <td className="p-3 border-t border-border">{z.s}</td>
                  <td className="p-3 border-t border-border">
                    {z.f === 0 ? "—" : z.f}
                  </td>
                  <td
                    className="p-3 border-t border-border"
                    style={{
                      color:
                        z.v === "—"
                          ? "hsl(var(--text-3))"
                          : typeof z.v === "number" && z.v < 0
                            ? "hsl(var(--destructive))"
                            : typeof z.v === "number" && z.v > 0
                              ? "hsl(var(--success))"
                              : "inherit",
                      fontFamily: "ui-monospace, monospace",
                      fontWeight: 600,
                    }}
                  >
                    {z.v}
                  </td>
                  <td
                    className="p-3 border-t border-border"
                    style={{
                      color:
                        typeof z.nbv === "number" && z.nbv < 0
                          ? "hsl(var(--destructive))"
                          : typeof z.nbv === "number" && z.nbv > 0
                            ? "hsl(var(--success))"
                            : "hsl(var(--text-3))",
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 12,
                    }}
                  >
                    {z.nbv === "—" ? "—" : formatIDRShort(Number(z.nbv))}
                  </td>
                  <td className="p-3 border-t border-border">
                    {z.tone === "success" ? (
                      <span className="ks-badge success">Match</span>
                    ) : z.tone === "danger" ? (
                      <span className="ks-badge danger">Variance</span>
                    ) : z.tone === "warn" ? (
                      <span className="ks-badge warn">Review</span>
                    ) : (
                      <span className="ks-badge outline">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="ks-card">
            <div className="ks-card-head">
              <div>
                <div className="ks-card-title">Adjustment journal entry</div>
                <div className="ks-card-desc">
                  Auto-drafted from variances · JE-2410-018
                </div>
              </div>
              <span className="ks-badge outline">Draft</span>
            </div>
            <div className="ks-card-body">
              <div
                style={{
                  background: "hsl(var(--surface-2))",
                  borderRadius: 8,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                  fontSize: 12,
                  lineHeight: 1.7,
                  padding: 14,
                }}
              >
                {JOURNAL_LINES.map((l) => (
                  <div
                    key={l.acc}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "hsl(var(--text-2))" }}>{l.acc}</span>
                    <span
                      style={{
                        color: l.dr
                          ? "hsl(var(--text))"
                          : "hsl(var(--destructive))",
                        fontWeight: 600,
                      }}
                    >
                      {l.dr ? "Dr " : "Cr "}
                      {l.amt}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    borderTop: "1px dashed hsl(var(--border))",
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                    paddingTop: 8,
                  }}
                >
                  <span style={{ color: "hsl(var(--text-3))" }}>Net NBV impact</span>
                  <span
                    style={{
                      color: "hsl(var(--destructive))",
                      fontWeight: 700,
                    }}
                  >
                    -Rp 14.200.000
                  </span>
                </div>
              </div>
              {canManage && (
                <button
                  className="ks-btn ks-btn-primary"
                  style={{ marginTop: 12, width: "100%" }}
                  type="button"
                  onClick={handlePostToGl}
                >
                  Post to GL
                </button>
              )}
            </div>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div>
                <div className="ks-card-title">Sign-off · Audit report</div>
                <div className="ks-card-desc">4 of 5 required approvals</div>
              </div>
              <span className="ks-badge warn">1 pending</span>
            </div>
            <div className="ks-card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SIGNOFFS.map((s) => (
                <div
                  key={s.label}
                  style={{
                    alignItems: "center",
                    display: "flex",
                    gap: 10,
                  }}
                >
                  {s.done ? (
                    <CheckCircle2
                      size={18}
                      style={{ color: "hsl(var(--success))", flexShrink: 0 }}
                    />
                  ) : (
                    <Clock
                      size={18}
                      style={{ color: "hsl(var(--warn))", flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {s.label}
                    </div>
                    <div style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>
                      {s.who}
                    </div>
                  </div>
                  {s.done ? (
                    <span className="ks-badge success">Signed</span>
                  ) : canManage ? (
                    <button
                      className="ks-btn ks-btn-primary ks-btn-sm"
                      type="button"
                      onClick={() => handleSignOff(s.role)}
                    >
                      Sign off
                    </button>
                  ) : (
                    <span className="ks-badge outline">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </FaQueryState>
    </div>
  );
}
