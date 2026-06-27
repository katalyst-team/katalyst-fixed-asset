"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Cog,
  Eye,
  Package,
  Radio,
  RefreshCw,
  Shield,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { useUser } from "@/context/user-context";
import { useGetMaintenanceQuery } from "@/hooks/api/fixed-assets";
import {
  catToneClass,
  FaMeter,
  formatAge,
  healthBarTone,
  healthTone,
} from "@/modules/dashboard/fixed-assets";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";

export const flexCol: React.CSSProperties = { display: "flex", flexDirection: "column" };
export const flexRow: React.CSSProperties = { alignItems: "center", display: "flex" };
export const mono: React.CSSProperties = { fontFamily: "ui-monospace, monospace" };
export const muted: React.CSSProperties = { color: "hsl(var(--text-3))", fontSize: 12 };

export function TH({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-medium text-muted-foreground p-3">{children}</th>;
}

export function TD({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td className="p-3 border-t border-border" style={style}>
      {children}
    </td>
  );
}

export function CatCell({ cat, name }: { cat: string; name: string }) {
  return (
    <div style={flexRow}>
      <span className={`ks-badge ${catToneClass(cat)}`}>{CAT_LABEL[cat]}</span>
      <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 6 }}>{name}</span>
    </div>
  );
}

export function iconBox(size = 34): React.CSSProperties {
  return {
    background: "hsl(var(--surface-2))",
    borderRadius: 8,
    color: "hsl(var(--text-2))",
    display: "grid",
    height: size,
    placeItems: "center",
    width: size,
  };
}

const LIFECYCLE: { icon: LucideIcon; label: string; n: string }[] = [
  { icon: Radio, label: "Scan-In", n: "8,420" },
  { icon: Cog, label: "Operate", n: "7,180" },
  { icon: Wrench, label: "Maintain", n: "42 open" },
  { icon: Package, label: "Transfer / Dispose", n: "38 / 12" },
];

const WO_SOURCES: { icon: LucideIcon; label: string; n: number }[] = [
  { icon: Eye, label: "Inspection", n: 8 },
  { icon: Zap, label: "Predictive AI", n: 3 },
  { icon: Wrench, label: "Corrective", n: 18 },
  { icon: Calendar, label: "PM", n: 9 },
  { icon: Shield, label: "Audit", n: 4 },
];

export function FlowTab() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetMaintenanceQuery({ organizationId });
  const HEALTH_DATA = resp?.data?.health_data ?? [];
  const alerts = HEALTH_DATA.filter(
    (h) => h.status === "critical" || h.status === "alert",
  );
  const buckets = [
    { label: "Critical (<40)", n: HEALTH_DATA.filter((h) => h.health_score < 40).length, tone: "danger" },
    { label: "Alert (40-59)", n: HEALTH_DATA.filter((h) => h.health_score >= 40 && h.health_score < 60).length, tone: "warn" },
    { label: "Watch (60-79)", n: HEALTH_DATA.filter((h) => h.health_score >= 60 && h.health_score < 80).length, tone: "brand" },
    { label: "Healthy (80+)", n: HEALTH_DATA.filter((h) => h.health_score >= 80).length, tone: "success" },
  ];
  return (
    <div style={{ ...flexCol, gap: 16 }}>
      <div className="ks-card">
        <div className="ks-card-body">
          <div style={{ ...flexRow, gap: 10, marginBottom: 14 }}>
            <RefreshCw size={15} style={{ color: "hsl(var(--brand))" }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Asset lifecycle</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {LIFECYCLE.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ ...flexRow, flex: "1 1 180px" }}>
                  <button
                    className="ks-card"
                    style={{ ...flexRow, cursor: "pointer", gap: 10, padding: "12px 14px", width: "100%" }}
                    type="button"
                  >
                    <div style={{ ...iconBox(), background: "hsl(var(--brand-soft))", color: "hsl(var(--brand))" }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                      <div style={muted}>{s.n} assets</div>
                    </div>
                  </button>
                  {i < LIFECYCLE.length - 1 && (
                    <ChevronRight size={16} style={{ color: "hsl(var(--text-3))", margin: "0 2px" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          background: "hsl(var(--brand-soft))",
          border: "1px solid hsl(var(--border))",
          borderRadius: 10,
          display: "flex",
          gap: 12,
          padding: "12px 16px",
        }}
      >
        <Wrench size={16} style={{ color: "hsl(var(--brand))" }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          Work Order intake · 42 open across 5 sources
        </span>
        <div className="ks-chips" style={{ marginLeft: "auto" }}>
          {WO_SOURCES.map((src) => {
            const Icon = src.icon;
            return (
              <span key={src.label} className="ks-chip">
                <Icon size={12} />
                {src.label} · {src.n}
              </span>
            );
          })}
        </div>
      </div>

      <FaQueryState
        emptyDescription="No health monitoring data available."
        emptyTitle="No data"
        isEmpty={HEALTH_DATA.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
        <div className="ks-grid-2">
          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">Critical alerts</div>
              <span className="ks-badge danger">{alerts.length} active</span>
            </div>
            <div className="ks-card-body" style={{ ...flexCol, gap: 10 }}>
              {alerts.map((a) => (
                <div key={a.id} style={{ alignItems: "flex-start", display: "flex", gap: 10 }}>
                  <AlertTriangle size={16} style={{ color: "hsl(var(--destructive))", flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                    <div style={{ ...muted, marginTop: 2 }}>{a.ai}</div>
                    <div style={{ ...muted, fontSize: 11, marginTop: 2 }}>
                      {a.id} · last seen {a.lastSeenLabel}
                    </div>
                  </div>
                  <span className={`ks-badge ${healthTone(a.status)}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">Health score distribution</div>
              <span className="ks-badge outline">{HEALTH_DATA.length} assets</span>
            </div>
            <div className="ks-card-body" style={{ ...flexCol, gap: 16 }}>
              {buckets.map((b) => (
                <div key={b.label}>
                  <div style={{ ...flexRow, justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{b.label}</span>
                    <span style={{ ...mono, fontSize: 13, fontWeight: 600 }}>{b.n}</span>
                  </div>
                  <FaMeter pct={(b.n / HEALTH_DATA.length) * 100} tone={b.tone} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </FaQueryState>
    </div>
  );
}

const HEALTH_FILTERS = ["All", "Critical", "Alert", "Watch", "Dormant", "No maint", "PM due"];

export function HealthTab() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetMaintenanceQuery({ organizationId });
  const HEALTH_DATA = resp?.data?.health_data ?? [];
  const [filter, setFilter] = useState("All");
  const rows = HEALTH_DATA.filter((h) => {
    if (filter === "All") return true;
    if (filter === "Critical") return h.status === "critical";
    if (filter === "Alert") return h.status === "alert";
    if (filter === "Watch") return h.status === "watch";
    if (filter === "Dormant") return h.lastSeenMin > 120;
    if (filter === "No maint") return h.since_maint_days > 180;
    if (filter === "PM due") return h.next_pm_days <= 0;
    return true;
  });
  const cols = ["Asset", "Age", "Last seen", "No maint", "Next PM", "Cycles/Hours", "MTBF", "Health", "Status"];
  return (
    <FaQueryState
      emptyDescription="No assets registered for health monitoring."
      emptyTitle="No assets found"
      isEmpty={HEALTH_DATA.length === 0}
      isError={isError}
      isLoading={isLoading}
    >
      <div className="ks-card">
        <div className="ks-card-head">
          <div className="ks-card-title">Asset health register</div>
          <div className="ks-chips">
            {HEALTH_FILTERS.map((f) => (
              <button
                key={f}
                className={`ks-chip ${filter === f ? "on" : ""}`}
                type="button"
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              {cols.map((c) => (
                <TH key={c}>{c}</TH>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => (
              <tr key={h.id}>
                <TD>
                  <CatCell cat={h.cat} name={h.name} />
                  <div style={{ ...muted, fontSize: 11, marginTop: 2 }}>
                    {h.id} · {h.loc}
                  </div>
                </TD>
                <TD style={mono}>{formatAge(h.ageDays)}</TD>
                <TD>{h.lastSeenLabel}</TD>
                <TD style={mono}>{h.since_maint_days}d</TD>
                <TD style={{ ...mono, color: h.next_pm_days < 0 ? "hsl(var(--destructive))" : "inherit", fontWeight: h.next_pm_days < 0 ? 600 : 400 }}>
                  {h.next_pm_days <= 0 ? `${Math.abs(h.next_pm_days)}d over` : `${h.next_pm_days}d`}
                </TD>
                <TD style={mono}>{h.cycles > 0 ? `${h.cycles}c` : `${h.run_hours}h`}</TD>
                <TD style={mono}>{h.mtbf_days > 0 ? `${h.mtbf_days}d` : "—"}</TD>
                <TD style={{ minWidth: 110 }}>
                  <div style={{ ...flexRow, gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <FaMeter pct={h.health_score} tone={healthBarTone(h.health_score)} />
                    </div>
                    <span style={{ ...mono, fontSize: 12, fontWeight: 600 }}>{h.health_score}</span>
                  </div>
                </TD>
                <TD>
                  <span className={`ks-badge ${healthTone(h.status)}`}>{h.status}</span>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FaQueryState>
  );
}
