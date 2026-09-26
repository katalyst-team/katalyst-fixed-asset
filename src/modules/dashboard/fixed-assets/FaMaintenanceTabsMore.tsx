"use client";

import type { LucideIcon } from "lucide-react";
import {
  Ban,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Cog,
  Eye,
  Wrench,
  Zap,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import { useUser } from "@/context/user-context";
import {
  useGetMaintenanceQuery,
  useSubmitPreUseCheckMutation,
  useUpdatePmRuleMutation,
  useUpdateWorkOrderStatusMutation,
} from "@/hooks/api/fixed-assets";
import { formatActivityTime } from "@/modules/dashboard/fixed-assets";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";

import {
  CatCell,
  flexCol,
  flexRow,
  iconBox,
  mono,
  muted,
  TD,
  TH,
} from "./FaMaintenanceTabs";
import { FaQueryState } from "./FaQueryState";

const WO_FILTERS = ["All", "Open", "In-progress", "Critical", "Predictive"];
const WO_FILTER_KEY: Record<string, string> = { All: "page.maintenanceMore.woFilter.all", Critical: "page.maintenanceMore.woFilter.critical", "In-progress": "page.maintenanceMore.woFilter.inProgress", Open: "page.maintenanceMore.woFilter.open", Predictive: "page.maintenanceMore.woFilter.predictive" };

const SOURCE_MAP: Record<string, { icon: LucideIcon; label: string }> = {
  corrective: { icon: Wrench, label: "page.maintenanceMore.source.corrective" },
  inspection: { icon: Eye, label: "page.maintenanceMore.source.inspection" },
  pm: { icon: Calendar, label: "page.maintenanceMore.source.pm" },
  predictive: { icon: Zap, label: "page.maintenanceMore.source.predictive" },
};

const priorityBadge = (p: string): string =>
  p === "critical" ? "danger" : p === "high" ? "warn" : "outline";

export function WoTab() {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetMaintenanceQuery({ organizationId });
  const { mutateAsync: updateWoStatus } = useUpdateWorkOrderStatusMutation({
    organizationId,
  });
  const { canManage } = useFaPermission();
  const WORK_ORDERS = resp?.data?.work_orders ?? [];
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const queue = WORK_ORDERS.filter((w) => {
    if (filter === "All") return true;
    if (filter === "Open") return w.status === "open";
    if (filter === "In-progress") return w.status === "in-progress";
    if (filter === "Critical") return w.priority === "critical";
    if (filter === "Predictive") return w.type === "predictive";
    return true;
  });
  if (WORK_ORDERS.length === 0) {
    return (
      <FaQueryState
        isEmpty
        emptyDescription={t("page.maintenanceMore.noWoDesc")}
        emptyTitle={t("page.maintenanceMore.noWo")}
        isError={isError}
        isLoading={isLoading}
      >
        {null}
      </FaQueryState>
    );
  }
  const wo = WORK_ORDERS.find((w) => w.id === selectedId) ?? WORK_ORDERS[0];
  const src = SOURCE_MAP[wo.type] ?? SOURCE_MAP.corrective;
  const SrcIcon = src.icon;
  const srcLabel = t(src.label);
  const srcDesc =
    wo.type === "predictive"
      ? t("page.maintenanceMore.srcDesc.predictive")
      : wo.type === "pm"
        ? t("page.maintenanceMore.srcDesc.pm")
        : t("page.maintenanceMore.srcDesc.manual");
  return (
    <FaQueryState
      emptyDescription={t("page.maintenanceMore.noWoDesc")}
      emptyTitle={t("page.maintenanceMore.noWo")}
      isError={isError}
      isLoading={isLoading}
    >
      <div className="ks-grid-2">
        <div className="ks-card">
          <div className="ks-card-head">
            <div className="ks-card-title">{t("page.maintenanceMore.woQueue")}</div>
            <div className="ks-chips">
              {WO_FILTERS.map((f) => (
                <button
                  key={f}
                  className={`ks-chip ${filter === f ? "on" : ""}`}
                  type="button"
                  onClick={() => setFilter(f)}
                >
                  {t(WO_FILTER_KEY[f])}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <TH>{t("page.maintenanceMore.colsWo.wo")}</TH>
                <TH>{t("page.maintenanceMore.colsWo.asset")}</TH>
                <TH>{t("page.maintenanceMore.colsWo.source")}</TH>
                <TH>{t("page.maintenanceMore.colsWo.priority")}</TH>
                <TH>{t("page.maintenanceMore.colsWo.status")}</TH>
              </tr>
            </thead>
            <tbody>
              {queue.map((w) => (
                <tr
                  key={w.id}
                  style={{ background: w.id === selectedId ? "hsl(var(--surface-2))" : "transparent", cursor: "pointer" }}
                  onClick={() => setSelectedId(w.id)}
                >
                  <TD>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{w.desc}</span>
                  </TD>
                  <TD>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{w.asset}</div>
                  </TD>
                  <TD>
                    <span className="ks-badge outline">
                      <SrcIcon size={10} />
                      {srcLabel}
                    </span>
                  </TD>
                  <TD>
                    <span className={`ks-badge ${priorityBadge(w.priority)}`}>{w.priority}</span>
                  </TD>
                  <TD>
                    <span className={`ks-badge ${w.status === "in-progress" ? "info" : "outline"}`}>
                      {w.status}
                    </span>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">{wo.desc}</div>
              <div className="ks-card-desc">{wo.asset}</div>
            </div>
            <span className={`ks-badge ${priorityBadge(wo.priority)}`}>{wo.priority}</span>
          </div>
          <div className="ks-card-body" style={{ ...flexCol, gap: 14 }}>
            <div
              style={{
                alignItems: "flex-start",
                background: "hsl(var(--surface-2))",
                borderRadius: 8,
                display: "flex",
                gap: 10,
                padding: 12,
              }}
            >
              <SrcIcon size={15} style={{ color: "hsl(var(--brand))", flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {t("page.maintenanceMore.sourceLabel", { source: srcLabel })}
                </div>
                <div style={{ ...muted, marginTop: 2 }}>{srcDesc}</div>
              </div>
            </div>

            <div>
              <div style={{ ...muted, marginBottom: 4 }}>{t("page.maintenanceMore.issue")}</div>
              <div style={{ fontSize: 13 }}>{wo.desc}</div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {[
                ["page.maintenanceMore.assigned", wo.assigned_to],
                ["page.maintenanceMore.eta", wo.eta],
                ["page.maintenanceMore.created", formatActivityTime(wo.created_at)],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ ...muted, fontSize: 11 }}>{t(k)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ ...muted, marginBottom: 6 }}>{t("page.maintenanceMore.connectedEvents")}</div>
              <div style={{ ...flexCol, gap: 6 }}>
                <div style={{ ...flexRow, fontSize: 12, gap: 8 }}>
                  <Bell size={12} style={{ color: "hsl(var(--text-3))" }} />
                  {t("page.maintenanceMore.rfidAnomaly")}
                </div>
                <div style={{ ...flexRow, fontSize: 12, gap: 8 }}>
                  <Clock size={12} style={{ color: "hsl(var(--text-3))" }} />
                  {t("page.maintenanceMore.preUseFlagged", { time: formatActivityTime(wo.created_at) })}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {canManage && (
                <button
                  className="ks-btn ks-btn-primary"
                  type="button"
                  onClick={() => updateWoStatus({ data: { status: "in-progress" }, workOrderId: wo.id })}
                >
                  {t("page.maintenanceMore.startWork")}
                </button>
              )}
              {canManage && (
                <button
                  className="ks-btn"
                  type="button"
                  onClick={() => updateWoStatus({ data: { status: "done" }, workOrderId: wo.id })}
                >
                  <CheckCircle2 size={13} />
                  {t("page.maintenanceMore.close")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FaQueryState>
  );
}

export function ScheduleTab() {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isError, isLoading } = useGetMaintenanceQuery({ organizationId });
  const { mutateAsync: submitCheck } = useSubmitPreUseCheckMutation({
    organizationId,
  });
  const { mutateAsync: updatePmRule } = useUpdatePmRuleMutation({
    organizationId,
  });
  const { canManage } = useFaPermission();
  const PRE_USE_ASSETS = resp?.data?.pre_use_assets ?? [];
  const PM_SCHEDULE = resp?.data?.pm_schedule ?? [];
  const PM_RULES = resp?.data?.pm_rules ?? [];
  const [view, setView] = useState<"preuse" | "pm">("preuse");
  const [selAsset, setSelAsset] = useState("");
  const asset = PRE_USE_ASSETS.find((a) => a.id === selAsset) ?? PRE_USE_ASSETS[0];

  if (view === "preuse" && !asset) {
    return (
      <FaQueryState
        isEmpty
        emptyDescription={t("page.maintenanceMore.noPreUseDesc")}
        emptyTitle={t("page.maintenanceMore.noPreUse")}
        isError={isError}
        isLoading={isLoading}
      >
        {null}
      </FaQueryState>
    );
  }
  return (
    <div>
      <div className="ks-seg" style={{ marginBottom: 16 }}>
        <button className={view === "preuse" ? "on" : ""} type="button" onClick={() => setView("preuse")}>
          {t("page.maintenanceMore.preUseTab")}
        </button>
        <button className={view === "pm" ? "on" : ""} type="button" onClick={() => setView("pm")}>
          {t("page.maintenanceMore.pmTab")}
        </button>
      </div>

      <FaQueryState
        emptyDescription={view === "preuse" ? t("page.maintenanceMore.noPreUseDesc") : t("page.maintenanceMore.noPmDesc")}
        emptyTitle={view === "preuse" ? t("page.maintenanceMore.noPreUse") : t("page.maintenanceMore.noPm")}
        isEmpty={view === "preuse" ? PRE_USE_ASSETS.length === 0 : PM_SCHEDULE.length === 0 && PM_RULES.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
        {view === "preuse" ? (
        <div className="ks-grid-2">
          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">{t("page.maintenanceMore.inspectionRequired")}</div>
              <span className="ks-badge warn">
                {t("page.maintenanceMore.overdueCount", { n: PRE_USE_ASSETS.filter((a) => a.overdue).length })}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <TH>{t("page.maintenanceMore.colsSched.asset")}</TH>
                  <TH>{t("page.maintenanceMore.colsSched.due")}</TH>
                  <TH>{t("page.maintenanceMore.colsSched.streak")}</TH>
                  <TH>{t("page.maintenanceMore.colsSched.result")}</TH>
                </tr>
              </thead>
              <tbody>
                {PRE_USE_ASSETS.map((a) => (
                  <tr
                    key={a.id}
                    style={{
                      background: a.id === selAsset ? "hsl(var(--surface-2))" : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelAsset(a.id)}
                  >
                    <TD>
                      <CatCell cat={a.cat} name={a.asset} />
                    </TD>
                    <TD>
                      <span
                        style={{
                          ...mono,
                          color: a.overdue ? "hsl(var(--destructive))" : "inherit",
                          fontSize: 12,
                          fontWeight: a.overdue ? 600 : 400,
                        }}
                      >
                        {a.dueIn}
                      </span>
                    </TD>
                    <TD style={mono}>{`${a.streak}x`}</TD>
                    <TD>
                      <span className={`ks-badge ${a.last_result === "pass" ? "success" : "danger"}`}>
                        {a.last_result === "pass" ? <CheckCircle2 size={11} /> : <Ban size={11} />}
                        {a.last_result}
                      </span>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div>
                <div className="ks-card-title">{asset.asset}</div>
                <div className="ks-card-desc">
                  {t("page.maintenanceMore.lastBy", {
                    checker: asset.last_checker,
                    interval: asset.interval,
                    label: asset.lastCheckLabel,
                  })}
                </div>
              </div>
              {asset.critical && <span className="ks-badge danger">{t("page.maintenanceMore.critical")}</span>}
            </div>
            <div className="ks-card-body">
              {asset.fail_item && (
                <div
                  style={{
                    alignItems: "center",
                    background: "hsl(var(--danger-soft))",
                    borderRadius: 8,
                    color: "hsl(var(--destructive))",
                    display: "flex",
                    fontSize: 12,
                    gap: 8,
                    marginBottom: 12,
                    padding: 10,
                  }}
                >
                  <Ban size={14} />
                  {asset.fail_item}
                </div>
              )}
              <div style={{ ...muted, marginBottom: 8 }}>
                {t("page.maintenanceMore.checklist", { n: asset.checks.length })}
              </div>
              <div style={{ ...flexCol, gap: 8 }}>
                {asset.checks.map((c) => (
                  <div key={c} style={{ ...flexRow, fontSize: 13, gap: 10 }}>
                    <CheckCircle2 size={15} style={{ color: "hsl(var(--success))" }} />
                    {c}
                  </div>
                ))}
              </div>
              {canManage && (
                <button
                  className="ks-btn ks-btn-primary"
                  style={{ marginTop: 14, width: "100%" }}
                  type="button"
                  onClick={() =>
                    submitCheck({
                      asset_id: asset.id,
                      checker: asset.last_checker,
                      fail_item: asset.fail_item,
                      overall_result: asset.fail_item ? "fail" : "pass",
                      results: asset.checks.map((check) => ({ check, passed: !asset.fail_item })),
                    })
                  }
                >
                  {t("page.maintenanceMore.submitInspection")}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="ks-grid-2">
          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">{t("page.maintenanceMore.pmSchedule")}</div>
              <span className="ks-badge outline">{t("page.maintenanceMore.upcomingCount", { n: PM_SCHEDULE.length })}</span>
            </div>
            <div className="ks-card-body" style={{ ...flexCol, gap: 10 }}>
              {PM_SCHEDULE.map((p, i) => (
                <div
                  key={`${p.asset_code}-${p.created_at}-${i}`}
                  style={{ border: "1px solid hsl(var(--border))", borderRadius: 8, display: "flex", gap: 10, padding: 10 }}
                >
                  <div style={iconBox(32)}>
                    <Cog size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.desc}</div>
                    <div style={{ ...muted, marginTop: 2 }}>
                      {`${p.asset} · ${p.assigned_to}`}
                    </div>
                    <div style={{ ...flexRow, ...muted, fontSize: 11, gap: 10, marginTop: 4 }}>
                      <span>{formatActivityTime(p.created_at)}</span>
                    </div>
                  </div>
                  <span className={`ks-badge ${p.status === "done" ? "success" : "warn"}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">{t("page.maintenanceMore.pmRules")}</div>
              <span className="ks-badge brand">{t("page.maintenanceMore.autoWoOn")}</span>
            </div>
            <div className="ks-card-body" style={{ ...flexCol, gap: 10 }}>
              {PM_RULES.map((r) => (
                <div
                  key={r.name}
                  style={{ border: "1px solid hsl(var(--border))", borderRadius: 8, padding: 10 }}
                >
                  <div style={{ ...flexRow, gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</span>
                    <span className={`ks-badge ${r.tone || "outline"}`} style={{ marginLeft: "auto" }}>
                      {r.scope}
                    </span>
                    {canManage && (
                      <button
                        className={`ks-btn ks-btn-sm ${r.auto_wo ? "ks-btn-primary" : ""}`}
                        type="button"
                        onClick={() =>
                          updatePmRule({
                            data: { auto_wo: !r.auto_wo },
                            pmRuleId: r.name,
                          })
                        }
                      >
                        <Zap size={12} />
                        {r.auto_wo ? t("page.maintenanceMore.autoWo") : t("page.maintenanceMore.manual")}
                      </button>
                    )}
                  </div>
                  <div style={{ ...flexRow, ...muted, gap: 12, marginTop: 6 }}>
                    <span>{t("page.maintenanceMore.trigger", { value: r.trigger })}</span>
                    <span>{t("page.maintenanceMore.remind", { value: r.remind })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </FaQueryState>
    </div>
  );
}
