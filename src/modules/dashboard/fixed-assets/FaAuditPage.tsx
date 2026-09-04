"use client";

import {
  Clock,
  Download,
  FileText,
  PlayCircle,
  Shield,
} from "lucide-react";
import { useState } from "react";

import { useUser } from "@/context/user-context";
import {
  useAuditSignOffMutation,
  useGetAuditReportMutation,
  useGetAuditZonesQuery,
  usePostAuditAdjustmentMutation,
  useResumeAuditSweepMutation,
  useStartAuditSessionMutation,
} from "@/hooks/api/fixed-assets";
import {
  FaKpiStrip,
  FaMeter,
  FaShellHead,
  FaStat,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { FaAuditSignOffCard, SIGNOFF_ROLE_COUNT } from "@/modules/dashboard/fixed-assets/FaAuditSignOffCard";
import { FaDesktopReaderPanel } from "@/modules/dashboard/fixed-assets/FaDesktopReaderPanel";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { safeOpenUrl } from "@/modules/dashboard/fixed-assets/safeOpenUrl";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";
import type {
  AuditSignOffRequest,
  FaAuditSignOffRole,
  FaJournalEntryLine,
  PostAuditAdjustmentRequest,
} from "@/types/fixed-assets";

export function FaAuditPage() {
  const [sweepEpcs, setSweepEpcs] = useState<string[]>([]);
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
  const { mutateAsync: startSession } = useStartAuditSessionMutation({
    organizationId,
  });
  const zones = resp?.data?.zones ?? [];  const auditProgress = resp?.data?.audit_progress;
  const session = resp?.data?.audit_session;
  const auditId = session?.id ?? "";

  const countedTotal = zones.reduce((sum, z) => sum + z.f, 0);
  const varianceCount = zones.filter((z) => typeof z.v === "number" && z.v !== 0).length;
  const nbvImpact = zones.reduce((sum, z) => sum + (typeof z.nbv === "number" ? z.nbv : 0), 0);
  const zonesRemaining = zones.filter((z) => z.tone !== "success").length;

  const signOffByRole = new Map((session?.sign_offs ?? []).map((s) => [s.role, s]));
  const signoffDone = session?.sign_off_count ?? 0;
  const signoffRequired = session?.required_sign_off ?? SIGNOFF_ROLE_COUNT;

  // The zone with the largest NBV variance drives the adjustment journal preview —
  // PostAdjustment only takes a single zone_id, so it can't post for every variance at once.
  const varianceZones = zones.filter((z) => typeof z.nbv === "number" && z.nbv !== 0);
  const worstZone = varianceZones.reduce<typeof varianceZones[number] | null>((worst, z) => {
    if (!worst) return z;
    return Math.abs(Number(z.nbv)) > Math.abs(Number(worst.nbv)) ? z : worst;
  }, null);
  const journalAmount = worstZone ? Math.abs(Number(worstZone.nbv)) : 0;
  const journalLines: FaJournalEntryLine[] = worstZone
    ? [
        {
          account: "1.500 · Aset Tetap",
          credit: journalAmount,
          debit: 0,
          description: `Audit variance adjustment — ${worstZone.z}`,
        },
        {
          account: "7.120 · Beban Selisih Stok",
          credit: 0,
          debit: journalAmount,
          description: `Audit variance adjustment — ${worstZone.z}`,
        },
      ]
    : [];

  const nextZoneToScan = zones.find((z) => z.status !== "scanned" && z.status !== "reconciled");

  const handlePostToGl = async () => {
    if (!auditId || !worstZone) return;
    const data: PostAuditAdjustmentRequest = {
      lines: journalLines,
      zone_id: worstZone.z,
    };
    await postAdjustment({ auditId, data });
  };

  const handleSweepEpc = (epc: string) => {
    setSweepEpcs((prev) => (prev.includes(epc) ? prev : [...prev, epc]));
  };

  const handleResumeSweep = async () => {
    if (!auditId || !nextZoneToScan) return;
    await resumeSweep({
      auditId,
      epcs: sweepEpcs.length > 0 ? sweepEpcs : undefined,
      zone_id: nextZoneToScan.z,
    });
    setSweepEpcs([]);
  };

  const handleAuditReport = async () => {
    if (!auditId) return;
    const reportResp = await getAuditReport({ auditId });
    if (reportResp?.data?.download_url) {
      safeOpenUrl(reportResp.data.download_url);
    }
  };

  const handleSignOff = async (role: FaAuditSignOffRole) => {
    if (!auditId) return;
    const data: AuditSignOffRequest = {
      role,
      signature:
        [tokenPayload?.first_name, tokenPayload?.last_name]
          .filter(Boolean)
          .join(" ") || tokenPayload?.email || "",
      user_id: tokenPayload?.account_id ?? "",
    };
    await signOff({ auditId, data });
  };

  return (
    <div>
      <FaShellHead
        actions={
          <>
            {canManage && !auditId && (
              <button
                className="ks-btn ks-btn-primary"
                type="button"
                onClick={() => void startSession(undefined)}
              >
                <PlayCircle size={14} />
                Start audit session
              </button>
            )}
            <button
              className="ks-btn"
              disabled={!auditId}
              type="button"
              onClick={handleAuditReport}
            >
              <FileText size={14} />
              Audit report PDF
            </button>
            {canManage && (
              <button
                className="ks-btn ks-btn-primary"
                disabled={!auditId || !nextZoneToScan}
                type="button"
                onClick={handleResumeSweep}
              >
                <PlayCircle size={14} />
                Continue sweep
              </button>
            )}
          </>
        }
        title={session?.name ? `Stock Audit · ${session.name}` : "Stock Audit"}
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
              <span className="ks-badge brand">{session?.status ?? "Live"}</span>
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
                {auditProgress ? `${auditProgress.scanned_zones} of ${auditProgress.total_zones} zones` : "—"}
              </span>
              {nextZoneToScan && (
                <span style={{ alignItems: "center", display: "inline-flex", gap: 4 }}>
                  <Clock size={12} />
                  Next: {nextZoneToScan.z}
                </span>
              )}
            </div>
            <FaMeter pct={auditProgress?.pct_complete ?? 0} tone="brand" />
            {canManage && nextZoneToScan && (
              <div style={{ marginTop: 10 }}>
                <FaDesktopReaderPanel onEpc={handleSweepEpc} />
                <p className="mt-1 text-xs text-muted-foreground">
                  {sweepEpcs.length} tag(s) read for {nextZoneToScan.z} · counted
                  on Continue sweep
                </p>
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              {auditProgress ? `${Math.round(auditProgress.pct_complete)}%` : "—"}
            </div>
            <div style={{ color: "hsl(var(--text-3))", fontSize: 12 }}>
              {auditProgress ? `${auditProgress.total_zones - auditProgress.scanned_zones} zones remaining` : ""}
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
        <FaStat label="Sign-off" sub={`${signoffDone} of ${signoffRequired} done`} tone="success" value={`${signoffDone}/${signoffRequired}`} />
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
                  {worstZone ? `Largest variance · ${worstZone.z}` : "No variance to adjust"}
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
                {journalLines.map((l) => (
                  <div
                    key={l.account}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "hsl(var(--text-2))" }}>{l.account}</span>
                    <span
                      style={{
                        color: l.debit
                          ? "hsl(var(--text))"
                          : "hsl(var(--destructive))",
                        fontWeight: 600,
                      }}
                    >
                      {l.debit ? "Dr " : "Cr "}
                      {formatIDRShort(l.debit || l.credit)}
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
                    {worstZone ? formatIDRShort(-journalAmount) : "—"}
                  </span>
                </div>
              </div>
              {canManage && (
                <button
                  className="ks-btn ks-btn-primary"
                  disabled={!auditId || !worstZone}
                  style={{ marginTop: 12, width: "100%" }}
                  type="button"
                  onClick={handlePostToGl}
                >
                  Post to GL
                </button>
              )}
            </div>
          </div>

          <FaAuditSignOffCard
            auditId={auditId}
            canManage={canManage}
            signOffByRole={signOffByRole}
            signoffDone={signoffDone}
            signoffRequired={signoffRequired}
            onSignOff={handleSignOff}
          />
        </div>
      </div>
      </FaQueryState>
    </div>
  );
}
