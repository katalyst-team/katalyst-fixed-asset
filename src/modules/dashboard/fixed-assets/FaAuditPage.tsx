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
import { toast } from "sonner";

import {
  FaKpiStrip,
  FaMeter,
  FaShellHead,
  FaStat,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { AUDIT_ZONES } from "@/services/fixed-assets/mock";

interface SignoffItem {
  done: boolean;
  label: string;
  who: string;
}

const SIGNOFFS: SignoffItem[] = [
  { done: true, label: "Stock count lead", who: "Rahmat S." },
  { done: true, label: "Department head", who: "Dewi A." },
  { done: true, label: "Internal audit", who: "Surya D." },
  { done: true, label: "Finance manager", who: "Ratna I." },
  { done: false, label: "External accountant", who: "KAP Tanjung" },
];

const JOURNAL_LINES = [
  { acc: "1.500 · Aset Tetap — Peralatan", amt: "-5.200.000", dr: false },
  { acc: "7.120 · Beban Selisih Stok", amt: "5.200.000", dr: true },
  { acc: "1.500 · Aset Tetap — Kendaraan", amt: "-4.200.000", dr: false },
  { acc: "7.120 · Beban Selisih Stok", amt: "4.200.000", dr: true },
];

export function FaAuditPage() {
  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button className="ks-btn" type="button">
              <FileText size={14} />
              Audit report PDF
            </button>
            <button
              className="ks-btn ks-btn-primary"
              type="button"
              onClick={() => toast.info("Resuming zone sweep · BDG-WH Bay 2")}
            >
              <PlayCircle size={14} />
              Continue sweep
            </button>
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
        <FaStat label="Counted" sub="physical units" tone="brand" value="9,684" />
        <FaStat label="Variances found" tone="warn" value="14" />
        <FaStat
          label="Impact NBV"
          sub="net book value"
          tone="danger"
          value={
            <span style={{ color: "hsl(var(--destructive))" }}>-Rp 14.2 jt</span>
          }
        />
        <FaStat label="Zones remaining" tone="info" value="6" />
        <FaStat label="Sign-off" sub="4 of 6 done" tone="success" value="4/6" />
      </FaKpiStrip>

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
              {AUDIT_ZONES.map((z) => (
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
              <button
                className="ks-btn ks-btn-primary"
                style={{ marginTop: 12, width: "100%" }}
                type="button"
                onClick={() => toast.success("Journal entry JE-2410-018 posted to GL")}
              >
                Post to GL
              </button>
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
                  ) : (
                    <span className="ks-badge warn">Awaiting</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
