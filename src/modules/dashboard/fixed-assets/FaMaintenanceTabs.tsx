"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Calendar,
  Eye,
  Wrench,
  Zap,
} from "lucide-react";
import { useTranslation } from "next-i18next";
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

const WO_TYPE_META: Record<string, { icon: LucideIcon; label: string }> = {
  corrective: { icon: Wrench, label: "page.maintenanceTabs.woType.corrective" },
  inspection: { icon: Eye, label: "page.maintenanceTabs.woType.inspection" },
  pm: { icon: Calendar, label: "page.maintenanceTabs.woType.pm" },
  predictive: { icon: Zap, label: "page.maintenanceTabs.woType.predictive" },
};

export function FlowTab() {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetMaintenanceQuery({ organizationId });
  const HEALTH_DATA = resp?.data?.health_data ?? [];
  const alerts = HEALTH_DATA.filter(
    (h) => h.status === "critical" || h.status === "alert",
  );
  const openWorkOrders = (resp?.data?.work_orders ?? []).filter((w) => w.status === "open");
  const woBySource = Object.entries(WO_TYPE_META)
    .map(([type, meta]) => ({ ...meta, n: openWorkOrders.filter((w) => w.type === type).length }))
    .filter((s) => s.n > 0);
  const buckets = [
    {
      label: t("page.maintenanceTabs.bucket.critical"),
      n: HEALTH_DATA.filter((h) => h.health_score < 40).length,
      tone: "danger",
    },
    {
      label: t("page.maintenanceTabs.bucket.alert"),
      n: HEALTH_DATA.filter((h) => h.health_score >= 40 && h.health_score < 60).length,
      tone: "warn",
    },
    {
      label: t("page.maintenanceTabs.bucket.watch"),
      n: HEALTH_DATA.filter((h) => h.health_score >= 60 && h.health_score < 80).length,
      tone: "brand",
    },
    {
      label: t("page.maintenanceTabs.bucket.healthy"),
      n: HEALTH_DATA.filter((h) => h.health_score >= 80).length,
      tone: "success",
    },
  ];
  return (
    <div style={{ ...flexCol, gap: 16 }}>
      {openWorkOrders.length > 0 && (
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
            {t("page.maintenanceTabs.intake", { m: woBySource.length, n: openWorkOrders.length })}
          </span>
          <div className="ks-chips" style={{ marginLeft: "auto" }}>
            {woBySource.map((src) => {
              const Icon = src.icon;
              return (
                <span key={src.label} className="ks-chip">
                  <Icon size={12} />
                  {`${t(src.label)} · ${src.n}`}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <FaQueryState
        emptyDescription={t("page.maintenanceTabs.noDataDesc")}
        emptyTitle={t("page.maintenanceTabs.noData")}
        isEmpty={HEALTH_DATA.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
        <div className="ks-grid-2">
          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">{t("page.maintenanceTabs.criticalAlerts")}</div>
              <span className="ks-badge danger">{t("page.maintenanceTabs.activeCount", { n: alerts.length })}</span>
            </div>
            <div className="ks-card-body" style={{ ...flexCol, gap: 10 }}>
              {alerts.map((a) => (
                <div key={a.id} style={{ alignItems: "flex-start", display: "flex", gap: 10 }}>
                  <AlertTriangle size={16} style={{ color: "hsl(var(--destructive))", flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                    <div style={{ ...muted, marginTop: 2 }}>{a.ai}</div>
                    <div style={{ ...muted, fontSize: 11, marginTop: 2 }}>
                      {t("page.maintenanceTabs.lastSeen", { time: a.lastSeenLabel })}
                    </div>
                  </div>
                  <span className={`ks-badge ${healthTone(a.status)}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">{t("page.maintenanceTabs.healthDist")}</div>
              <span className="ks-badge outline">{t("page.maintenanceTabs.assetsCount", { n: HEALTH_DATA.length })}</span>
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

const HEALTH_FILTER_KEY: Record<string, string> = {
  Alert: "page.maintenanceTabs.healthFilter.alert",
  All: "page.maintenanceTabs.healthFilter.all",
  Critical: "page.maintenanceTabs.healthFilter.critical",
  Dormant: "page.maintenanceTabs.healthFilter.dormant",
  "No maint": "page.maintenanceTabs.healthFilter.noMaint",
  "PM due": "page.maintenanceTabs.healthFilter.pmDue",
  Watch: "page.maintenanceTabs.healthFilter.watch",
};

export function HealthTab() {
  const { t } = useTranslation("fixed-assets");
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
  const cols = [
    "page.maintenanceTabs.cols.asset",
    "page.maintenanceTabs.cols.age",
    "page.maintenanceTabs.cols.lastSeen",
    "page.maintenanceTabs.cols.noMaint",
    "page.maintenanceTabs.cols.nextPm",
    "page.maintenanceTabs.cols.cyclesHours",
    "page.maintenanceTabs.cols.mtbf",
    "page.maintenanceTabs.cols.health",
    "page.maintenanceTabs.cols.status",
  ];
  return (
    <FaQueryState
      emptyDescription={t("page.maintenanceTabs.noAssetsDesc")}
      emptyTitle={t("page.register.noAssetsFound")}
      isEmpty={HEALTH_DATA.length === 0}
      isError={isError}
      isLoading={isLoading}
    >
      <div className="ks-card">
        <div className="ks-card-head">
          <div className="ks-card-title">{t("page.maintenanceTabs.registerTitle")}</div>
          <div className="ks-chips">
            {HEALTH_FILTERS.map((f) => (
              <button
                key={f}
                className={`ks-chip ${filter === f ? "on" : ""}`}
                type="button"
                onClick={() => setFilter(f)}
              >
                {t(HEALTH_FILTER_KEY[f])}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              {cols.map((c) => (
                <TH key={c}>{t(c)}</TH>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => (
              <tr key={h.id}>
                <TD>
                  <CatCell cat={h.cat} name={h.name} />
                  <div style={{ ...muted, fontSize: 11, marginTop: 2 }}>
                    {h.loc}
                  </div>
                </TD>
                <TD style={mono}>{formatAge(h.ageDays)}</TD>
                <TD>{h.lastSeenLabel}</TD>
                <TD style={mono}>{`${h.since_maint_days}d`}</TD>
                <TD style={{ ...mono, color: h.next_pm_days < 0 ? "hsl(var(--destructive))" : "inherit", fontWeight: h.next_pm_days < 0 ? 600 : 400 }}>
                  {h.next_pm_days <= 0 ? t("page.maintenanceTabs.daysOver", { n: Math.abs(h.next_pm_days) }) : `${h.next_pm_days}d`}
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
